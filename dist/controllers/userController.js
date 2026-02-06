"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.createUser = void 0;
const User_1 = __importDefault(require("../models/User"));
// @desc    Create a new user
// @route   POST /api/users
// @access  Public
const createUser = async (req, res) => {
    try {
        const { name, email, monthlyBudget } = req.body;
        // Manual validation for required fields
        if (!name || !email || monthlyBudget === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and monthly budget'
            });
        }
        // Manual validation for monthlyBudget
        if (monthlyBudget <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Monthly budget must be greater than 0'
            });
        }
        const user = await User_1.default.create({
            name,
            email,
            monthlyBudget
        });
        res.status(201).json({
            success: true,
            data: user,
            message: 'User created successfully'
        });
    }
    catch (error) {
        // Handle duplicate key error (Mongoose error code 11000)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((val) => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', '),
                error: messages
            });
        }
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Server Error'
        });
    }
};
exports.createUser = createUser;
// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User_1.default.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: user,
            message: 'User retrieved successfully'
        });
    }
    catch (error) {
        // Handle invalid ObjectId (CastError)
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Server Error'
        });
    }
};
exports.getUserById = getUserById;
