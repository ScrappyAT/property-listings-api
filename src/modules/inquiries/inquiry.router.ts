import { Router } from 'express';
import { listInquiries, getInquiryById, createInquiry } from './inquiry.controller';

const router = Router();

router.get('/', listInquiries);
router.post('/', createInquiry);
router.get('/:id', getInquiryById);

export default router;
