import express from 'express';
import {
  addDesign,
  getAllDesigns,
  getDesignById,
  updateDesign,
  deleteDesign
} from '../controllers/designController.js';

const router = express.Router();

// Routes without multer, only JSON
router.post('/add', addDesign);
router.get('/all', getAllDesigns);
router.get('/:id', getDesignById);
router.put('/update/:id', updateDesign);
router.delete('/delete/:id', deleteDesign);

export default router;
