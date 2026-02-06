"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserExists = exports.formatResponse = exports.getCurrentMonthDateRange = void 0;
const User_1 = __importDefault(require("../models/User"));
/**
 * Returns start and end date of current month for filtering
 */
const getCurrentMonthDateRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { startOfMonth, endOfMonth };
};
exports.getCurrentMonthDateRange = getCurrentMonthDateRange;
/**
 * Standardize API response format
 */
const formatResponse = (res, statusCode, success, data = null, message = '') => {
    const response = {
        success,
        message,
    };
    if (data !== null) {
        response.data = data;
    }
    return res.status(statusCode).json(response);
};
exports.formatResponse = formatResponse;
/**
 * Check if a user exists by ID
 */
const checkUserExists = async (userId) => {
    try {
        const user = await User_1.default.findById(userId);
        return user;
    }
    catch (error) {
        console.error(`Error checking user existence: ${error.message}`);
        return null;
    }
};
exports.checkUserExists = checkUserExists;
