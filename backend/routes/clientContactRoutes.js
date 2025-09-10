import express from 'express';
import {
  createClientContact,
  getClientContacts,
  updateClientContactStatus,
  getClientContactById,
  deleteClientContact
} from '../controllers/clientContactController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Create client contact (public route for contact form)
router.post('/create', createClientContact);

// Get client contacts for a designer (protected route)
router.get('/designer/:designerEmail', protect, getClientContacts);

// Update client contact status (protected route)
router.put('/update/:id', protect, updateClientContactStatus);

// Get client contact by ID (protected route)
router.get('/:id', protect, getClientContactById);

// Delete client contact (protected route)
router.delete('/delete/:id', protect, deleteClientContact);

export default router;
