import { Request, Response } from 'express';
import { User } from '../models/User';
import { Expense } from '../models/Expense';
import mongoose from 'mongoose';

// @desc    Get user summary: total expenses, budget, remaining for current month
// @route   GET /api/users/:userId/summary
// @access  Public
export const getUserSummary = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as { userId: string };

    // Validate if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId as any)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid User ID format'
      });
    }

    // 1. Get User and Monthly Budget
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const monthlyBudget = user.monthlyBudget;

    // 2. Determine Start and End of Current Month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // 3. Aggregate Expenses for Current Month
    const stats = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' },
          expenseCount: { $sum: 1 }
        }
      }
    ]);

    // Extract results (aggregate returns an array)
    const totalExpenses = stats.length > 0 ? stats[0].totalExpenses : 0;
    const expenseCount = stats.length > 0 ? stats[0].expenseCount : 0;
    const remainingBudget = monthlyBudget - totalExpenses;

    // 4. Return Summary
    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        userName: user.name,
        currency: 'USD',
        month: now.getMonth() + 1, // 1-12
        year: now.getFullYear(),
        monthlyBudget,
        totalExpenses,
        remainingBudget,
        expenseCount
      },
      message: 'User summary retrieved successfully'
    });

  } catch (error: any) {
    console.error('Error in getUserSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
