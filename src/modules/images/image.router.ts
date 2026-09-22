import { Router } from 'express';
import { listImages, getImageById } from './image.controller';

const router = Router();

router.get('/', listImages);
router.get('/:id', getImageById);

export default router;
