import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipientEmail: {
    type: String,
    required: true,
    trim: true
  },
  senderName: {
    type: String,
    required: true,
    trim: true
  },
  senderEmail: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['client_contact', 'design_inquiry', 'project_update', 'system'],
    default: 'client_contact'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  relatedDesignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Design'
  },
  relatedClientContactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClientContact'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  readAt: {
    type: Date
  }
});

// Index for efficient queries
notificationSchema.index({ recipientEmail: 1, createdAt: -1 });
notificationSchema.index({ recipientEmail: 1, isRead: 1 });

// Update readAt when isRead changes
notificationSchema.pre('save', function(next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
