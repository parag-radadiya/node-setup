import express from 'express';
import userRoutes from './v1/user/user.route';
import testRoutes from './v1/test/test.route';

const router = express.Router();
router.use('/user', userRoutes);
router.use('/test', testRoutes);
module.exports = router;
