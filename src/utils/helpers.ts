import { Response } from 'express';
import { User } from '../models/User';

/**
 * Returns start and end date of current month for filtering
 */ 
export const getCurrentMonthDateRange = (): { startOfMonth: Date; endOfMonth: Date } => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { startOfMonth, endOfMonth };
};

/**
 * Standardize API response format
 */
export const formatResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  data: any = null,
  message: string = ''
): Response => {
  const response: { success: boolean; message: string; data?: any } = {
    success,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Check if a user exists by ID
 */
export const checkUserExists = async (userId: string): Promise<boolean> => {
  try {
    const user = await User.findById(userId);
    return user !== null;
  } catch (error: any) {
    console.error(`Error checking user existence: ${error.message}`);
    return false;
  }
};
