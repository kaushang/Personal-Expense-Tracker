import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

// Helper to check valid email
const isValidEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

// Validate User Input
export const validateUserInput = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, monthlyBudget } = req.body;
  const errors: string[] = [];

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

// Validate Expense Input
export const validateExpenseInput = (req: Request, res: Response, next: NextFunction) => {
  const { userId, title, amount, category, date } = req.body;
  const errors: string[] = [];

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
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

// Validate ObjectId in Params
export const validateObjectId = (req: Request, res: Response, next: NextFunction) => {
  // Check common param names for ID
  const id = (req.params.id || req.params.userId) as string;
  
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  next();
};
