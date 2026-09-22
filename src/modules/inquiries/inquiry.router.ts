import { Router } from 'express';
import { listInquiries, getInquiryById } from './inquiry.controller';

const router = Router();

router.get('/', listInquiries);
router.get('/:id', getInquiryById);

export default router;
