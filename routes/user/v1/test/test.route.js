import express from 'express';
import { testController } from 'controllers/user';
import { testValidation } from 'validations/user';
import validate from 'middlewares/validate';
import auth from 'middlewares/auth';

const router = express.Router();
router
  .route('/')
  /**
   * createTest
   * */
  .post(auth('user'), validate(testValidation.createTest), testController.create)
  /**
   * getTest
   * */
  .get(auth('user'), validate(testValidation.getTest), testController.list);
router
  .route('/paginated')
  /**
   * getTestPaginated
   * */
  .get(auth('user'), validate(testValidation.paginatedTest), testController.paginate);
router
  .route('/:testId')
  /**
   * updateTest
   * */
  .put(auth('user'), validate(testValidation.updateTest), testController.update)
  /**
   * deleteTestById
   * */
  .delete(auth('user'), validate(testValidation.deleteTestById), testController.remove)
  /**
   * getTestById
   * */
  .get(auth('user'), validate(testValidation.getTestById), testController.get);
export default router;
