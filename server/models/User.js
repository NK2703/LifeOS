const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password_hash: {
      type: String,
      required: true,
      select: false, // Never returned in queries by default
    },
    avatar_url: {
      type: String,
      default: null,
    },
    preferences: {
      target_study_hours: { type: Number, default: 4 },
      theme: { type: String, default: 'dark' },
      currency: { type: String, default: 'INR' },
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

// Don't return password_hash in JSON responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password_hash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
