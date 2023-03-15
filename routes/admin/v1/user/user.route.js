import express from 'express';
import { userController } from 'controllers/admin';
import { userValidation } from 'validations/admin';
import validate from 'middlewares/validate';

const router = express.Router();
router
  .route('/')
  /**
   * createUser
   * */
  .post(validate(userValidation.createUser), userController.create)
  /**
   * getUser
   * */
  .get(validate(userValidation.getUser), userController.list);
router
  .route('/paginated')
  /**
   * getUserPaginated
   * */
  .get(validate(userValidation.paginatedUser), userController.paginate);
router
  .route('/:userId')
  /**
   * updateUser
   * */
  .put(validate(userValidation.updateUser), userController.update)
  /**
   * deleteUserById
   * */
  .delete(validate(userValidation.deleteUserById), userController.remove)
  /**
   * getUserById
   * */
  .get(validate(userValidation.getUserById), userController.get);
export default router;
