import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { AppError, NotFoundError } from '../utils/errors';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(__dirname, '../../uploads'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    const allowed = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'zip', 'rar', 'mp4', 'mp3', 'wav', 'mov', 'avi'];
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new AppError(`File type .${ext} is not allowed`, 400, 'INVALID_FILE_TYPE'));
    }
  },
});

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const userId = req.query.userId as string | undefined;
    const mimeType = req.query.mimeType as string | undefined;

    const where: Record<string, unknown> = {};

    if (projectId) where.projectId = projectId;
    if (userId) where.userId = userId;
    if (mimeType) where.mimeType = { startsWith: mimeType };

    const files = await prisma.file.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: files });
  } catch (error) {
    next(error);
  }
});

router.post('/upload', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError('No file uploaded', 400, 'NO_FILE');

    const { originalname, filename, mimetype, size } = req.file;
    const { projectId } = req.body;

    const file = await prisma.file.create({
      data: {
        name: filename,
        originalName: originalname,
        mimeType: mimetype,
        size,
        url: `/uploads/${filename}`,
        userId: req.user!.userId,
        projectId: projectId || null,
      },
    });

    res.status(201).json({ data: file });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    if (!file) throw new NotFoundError('File');
    res.json({ data: file });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    if (!file) throw new NotFoundError('File');

    await prisma.file.delete({ where: { id: req.params.id } });
    res.json({ data: { message: 'File deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as filesRouter };