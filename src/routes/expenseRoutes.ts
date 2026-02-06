import express from 'express';
import * as expenseController from '../controllers/expenseController';
import { validateExpenseInput, validateObjectId } from '../middleware/validators';

const router = express.Router();

// POST /expenses - Create a new expense
router.post('/expenses', validateExpenseInput, expenseController.createExpense);

// GET /users/:id/expenses - Get all expenses for a user
router.get('/users/:userId/expenses', validateObjectId, expenseController.getExpensesByUserId);

export default router;
