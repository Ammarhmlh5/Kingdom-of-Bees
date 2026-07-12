
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { OAuthController } from '../controllers/oauth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../validators';
import { registerSchema, loginSchema, googleAuthSchema, inviteSchema, joinSchema } from '../validators/auth.schema';

const router = Router();
const controller = new AuthController();
const oauthController = new OAuthController();

// Public
router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.post('/google', validate(googleAuthSchema), oauthController.googleAuth);

// Protected (requires valid token)
router.post('/invite', requireAuth, validate(inviteSchema), controller.generateInvite);
router.post('/join', requireAuth, validate(joinSchema), controller.joinApiary);
router.get('/me', requireAuth, controller.me);
router.post('/logout', controller.logout);

export default router;
