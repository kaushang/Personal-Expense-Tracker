"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateObjectId = exports.validateExpenseInput = exports.validateUserInput = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Helper to check valid email
const isValidEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
};
// Validate User Input
const validateUserInput = (req, res, next) => {
    const { name, email, monthlyBudget } = req.body;
    const errors = [];
    if (!name || name.trim() === '') {
        errors.push('Name is required');
    }
    if (!email || !isValidEmail(email)) {
        errors.push('Please include a valid email');
    }
    if (monthlyBudget !== undefined) {
        if (isNaN(monthlyBudget) || monthlyBudget < 0) {
            errors.push('Monthly budget must be a positive number');
        }
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors
        });
    }
    next();
};
exports.validateUserInput = validateUserInput;
// Validate Expense Input
const validateExpenseInput = (req, res, next) => {
    const { userId, title, amount, category, date } = req.body;
    const errors = [];
    if (!userId || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
        errors.push('Valid User ID is required');
    }
    if (!title || title.trim() === '') {
        errors.push('Title is required');
    }
    if (amount === undefined || isNaN(amount) || amount <= 0) {
        errors.push('Amount must be a positive number');
    }
    if (!category || category.trim() === '') {
        errors.push('Category is required');
    }
    if (date) {
        const parsedDate = Date.parse(date);
        if (isNaN(parsedDate)) {
            errors.push('Invalid date format');
        }
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors
        });
    }
    next();
};
exports.validateExpenseInput = validateExpenseInput;
// Validate ObjectId in Params
const validateObjectId = (req, res, next) => {
    // Check common param names for ID
    const id = (req.params.id || req.params.userId);
    if (id && !mongoose_1.default.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }
    next();
};
exports.validateObjectId = validateObjectId;
