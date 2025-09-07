import mongoose from 'mongoose';

const clientContactSchema = new mongoose.Schema({
  designId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Design',
    required: true
  },
  designerEmail: {
    type: String,
    required: true,
    trim: true
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  clientEmail: {
    type: String,
    required: true,
    trim: true
  },
  clientPhone: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'in_progress', 'completed', 'closed'],
    default: 'new'
  },
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
clientContactSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const ClientContact = mongoose.model('ClientContact', clientContactSchema);
export default ClientContact;
