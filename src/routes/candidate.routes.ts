import { Router } from 'express';
import { CandidateController } from '../controllers/candidate.controller';

const router = Router();
const candidateController = new CandidateController();

router.post('/', candidateController.handleCreateCandidate.bind(candidateController));

export { router as candidateRouter };

