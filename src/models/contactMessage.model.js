import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: false,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'replied'],
    default: 'unread',
  },
  replyMessage: {
    type: String,
    required: false,
  },
  repliedAt: {
    type: Date,
    required: false,
  }
}, { timestamps: true });

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

export default ContactMessage;
