const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a user ID']
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount']
    // > 0 check handled in pre-save hook
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Food', 'Travel', 'Shopping', 'Entertainment', 'Bills', 'Other']
  },
  date: {
    type: Date,
    required: [true, 'Please add a date'],
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
expenseSchema.index({ userId: 1 });
expenseSchema.index({ date: 1 });
expenseSchema.index({ userId: 1, category: 1 });

// Pre-save hook to validate amount and verify user existence
expenseSchema.pre('save', async function(next) {
  // Validate amount > 0
  if (this.amount <= 0) {
    return next(new Error('Amount must be greater than 0'));
  }

  // Verify userId exists
  try {
    // using mongoose.model to avoid circular dependency issues if any
    const User = mongoose.model('User');
    const userExists = await User.exists({ _id: this.userId });
    
    if (!userExists) {
      return next(new Error('Referenced user does not exist'));
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Expense', expenseSchema);
