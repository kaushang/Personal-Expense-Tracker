import { Request, Response } from 'express';
import { Expense } from '../models/Expense';
import { User } from '../models/User';

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Public
export const createExpense = async (req: Request, res: Response) => {
  try {
    const { userId, title, amount, category, date } = req.body;

    // Validate required fields
    if (!userId || !title || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId, title, amount, and category'
      });
    }

    // Validate amount > 0
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    // Validate that userId exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create expense
    const expense = await Expense.create({
      userId,
      title,
      amount,
      category,
      date // Optional, defaults to Date.now
    });

    res.status(201).json({
      success: true,
      data: expense,
      message: 'Expense created successfully'
    });
  } catch (error: any) {
    console.error('Error creating expense:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Server Error'
    });
  }
};

// @desc    Fetch all expenses for a specific user
// @route   GET /api/users/:userId/expenses
// @access  Public
export const getExpensesByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const category = req.query.category as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Build query object
    const query: any = { userId };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const totalExpenses = await Expense.countDocuments(query);
    
    const expenses = await Expense.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalExpenses / limit);

    res.status(200).json({
      success: true,
      data: expenses,
      pagination: {
        currentPage: page,
        totalPages,
        totalExpenses,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      message: 'Expenses retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Server Error'
    });
  }
};
