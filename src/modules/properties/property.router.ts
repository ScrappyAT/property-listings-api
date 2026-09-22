import { Router } from 'express';
import { listProperties, getPropertyById } from './property.controller';

const router = Router();

router.get('/', listProperties);
router.get('/:id', getPropertyById);

export default router;
