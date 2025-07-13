import express from 'express';
import {
  initTools,
  getAllTools,
  updateToolCategory
} from '../controllers/tool.controller.js';

const router = express.Router();

router.post('/init', initTools);
router.get('/', getAllTools);
router.put('/:id', updateToolCategory);

export default router;
