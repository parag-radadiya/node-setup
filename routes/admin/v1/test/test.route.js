import express from 'express';
import { testController } from 'controllers/admin';
import { testValidation } from 'validations/admin';
import validate from 'middlewares/validate';
import auth from 'middlewares/auth';

const router = express.Router();
router
  .route('/')
  /**
   * createTest
   * */
  .post(auth('admin'), validate(testValidation.createTest), testController.create)
  /**
   * getTest
   * */
  .get(auth('admin'), validate(testValidation.getTest), testController.list);
router
  .route('/paginated')
  /**
   * getTestPaginated
   * */
  .get(auth('admin'), validate(testValidation.paginatedTest), testController.paginate);
router
  .route('/:testId')
  /**
   * updateTest
   * */
  .put(auth('admin'), validate(testValidation.updateTest), testController.update)
  /**
   * deleteTestById
   * */
  .delete(auth('admin'), validate(testValidation.deleteTestById), testController.remove)
  /**
   * getTestById
   * */
  .get(auth('admin'), validate(testValidation.getTestById), testController.get);
export default router;
