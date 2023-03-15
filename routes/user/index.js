import express from 'express';
import userRoutes from './v1/user/user.route';
import testRoutes from './v1/test/test.route';
import authRoutes from './v1/auth/auth.route';

const router = express.Router();
router.use('/user', userRoutes);
router.use('/test', testRoutes);
router.use('/auth', authRoutes);
module.exports = router;
