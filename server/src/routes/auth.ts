import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { authService } from '../services';

const router = Router();

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const result = await authService.register(email, password, firstName, lastName);
    res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.json({ data: { message: 'Logged out successfully' } });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshTokens(refreshToken);
    res.json({ data: tokens });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getProfile(req.user!.userId);
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
});

router.put('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, avatar } = req.body;
    const user = await authService.updateProfile(req.user!.userId, { firstName, lastName, avatar });
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
});

router.put('/password', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user!.userId, currentPassword, newPassword);
    res.json({ data: { message: 'Password updated successfully' } });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as authRouter };
