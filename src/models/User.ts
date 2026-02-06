import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  monthlyBudget: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook
userSchema.pre('save', function () {
  if (this.monthlyBudget <= 0) {
    throw new Error('Monthly budget must be greater than 0');
  }
});

export const User = mongoose.model('User', userSchema);
