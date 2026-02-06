import { Request, Response } from 'express';
import { User } from '../models/User';

// @desc    Create a new user
// @route   POST /api/users
// @access  Public
export const createUser = async (req: Request, res: Response) => {
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

    const user = await User.create({
      name,
      email,
      monthlyBudget
    });

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error: any) {
    // Handle duplicate key error (Mongoose error code 11000)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
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

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

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
  } catch (error: any) {
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
