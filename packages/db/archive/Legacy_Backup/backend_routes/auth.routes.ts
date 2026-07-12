import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authLimiter, passwordResetLimiter, registrationLimiter, twoFactorLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               fullName:
 *                 type: string
 *               userType:
 *                 type: string
 *                 enum: [OWNER, WORKER, EXPLORER]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */
router.post('/register', registrationLimiter, authController.register.bind(authController));

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authLimiter, authController.login.bind(authController));
router.get('/me', authenticate, authController.me.bind(authController));
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword.bind(authController));
router.post('/reset-password', passwordResetLimiter, authController.resetPassword.bind(authController));
router.post('/refresh-token', authController.refreshToken.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));
router.post('/verify-email', authController.verifyEmail.bind(authController));
router.post('/send-verification', authenticate, authController.sendVerificationEmail.bind(authController));

// 2FA Routes
router.post('/2fa/enable', authenticate, authController.enable2FA.bind(authController));
router.post('/2fa/verify', authenticate, authController.verify2FA.bind(authController));
router.post('/2fa/disable', authenticate, authController.disable2FA.bind(authController));
router.post('/2fa/login', twoFactorLimiter, authController.verify2FALogin.bind(authController));
router.post('/2fa/backup-codes', authenticate, authController.regenerateBackupCodes.bind(authController));
router.get('/2fa/status', authenticate, authController.get2FAStatus.bind(authController));

export default router;
