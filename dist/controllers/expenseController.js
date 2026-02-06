"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpensesByUserId = exports.createExpense = void 0;
const Expense_1 = __importDefault(require("../models/Expense"));
const User_1 = __importDefault(require("../models/User"));
// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Public
const createExpense = async (req, res) => {
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
        const userExists = await User_1.default.findById(userId);
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Create expense
        const expense = await Expense_1.default.create({
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
    }
    catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Server Error'
        });
    }
};
exports.createExpense = createExpense;
// @desc    Fetch all expenses for a specific user
// @route   GET /api/users/:userId/expenses
// @access  Public
const getExpensesByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const category = req.query.category;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }
        // Build query object
        const query = { userId };
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
        const totalExpenses = await Expense_1.default.countDocuments(query);
        const expenses = await Expense_1.default.find(query)
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
    }
    catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Server Error'
        });
    }
};
exports.getExpensesByUserId = getExpensesByUserId;
