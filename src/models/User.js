const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address`
    }
  },
  monthlyBudget: {
    type: Number,
    required: [true, 'Please add a monthly budget']
    // We will enforce > 0 in the pre-save hook as requested, 
    // effectively acting as a detailed check.
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Create index on email for faster queries (built-in with unique: true, but explicit doesn't hurt)
userSchema.index({ email: 1 });

// Pre-save hook to validate monthlyBudget
userSchema.pre('save', function(next) {
  if (this.monthlyBudget <= 0) {
    const err = new Error('Monthly budget must be greater than 0');
    return next(err);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
