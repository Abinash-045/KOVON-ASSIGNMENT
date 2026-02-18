import { Router } from 'express';
import { JobController } from '../controllers/job.controller';

const router = Router();
const jobController = new JobController();

router.post('/', jobController.handleCreateJob.bind(jobController));

export { router as jobRouter };

