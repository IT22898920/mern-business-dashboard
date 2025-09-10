import mongoose from 'mongoose';

const designSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  contact: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['In Progress', 'Review', 'Completed'],
    default: 'In Progress'
  },
  description: {
    type: String,
    trim: true
  },
  imageURL: {
    type: String, // store image URL
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Design = mongoose.model('Design', designSchema);
export default Design;
