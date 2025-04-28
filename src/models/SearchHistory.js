const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  query: {
    type: String,
    required: true,
    trim: true
  },
  resultCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create an index on userId and createdAt for faster queries
SearchHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);
