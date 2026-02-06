import express from 'express';
import * as userController from '../controllers/userController';
import * as summaryController from '../controllers/summaryController';
import { validateUserInput, validateObjectId } from '../middleware/validators';

const router = express.Router();

// POST /users - Create a new user
router.post('/users', validateUserInput, userController.createUser);

// GET /users/:id - Get user details by ID
router.get('/users/:id', validateObjectId, userController.getUserById);

// GET /users/:id/summary - Get monthly expense summary for user
router.get('/users/:userId/summary', validateObjectId, summaryController.getUserSummary);

export default router;
