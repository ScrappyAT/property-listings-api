import { Router } from 'express';
import { listAgents, getAgentById } from './agent.controller';

const router = Router();

router.get('/', listAgents);
router.get('/:id', getAgentById);

export default router;
