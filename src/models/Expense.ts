import mongoose, { Schema } from 'mongoose';

const expenseSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Indexes
expenseSchema.index({ userId: 1 });
expenseSchema.index({ date: 1 });
expenseSchema.index({ userId: 1, category: 1 });

// Pre-save hook
expenseSchema.pre('save', async function () {
  if (this.amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  const User = mongoose.model('User');
  const userExists = await User.exists({ _id: this.userId });

  if (!userExists) {
    throw new Error('Referenced user does not exist');
  }
});

export const Expense = mongoose.model('Expense', expenseSchema);
