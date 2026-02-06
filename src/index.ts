import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

import connectDB from './config/database';
import userRoutes from './routes/userRoutes';
import expenseRoutes from './routes/expenseRoutes';
import errorHandler from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from 'public' directory

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('Personal Expense Tracker API is running');
});

// Connect to Database
connectDB();

// Routes
app.use('/api', userRoutes);
app.use('/api', expenseRoutes);

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on: http://localhost:${PORT}`);
});
