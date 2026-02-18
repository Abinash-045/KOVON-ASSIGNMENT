import { Router } from 'express';
import { candidateRouter } from './candidate.routes';
import { jobRouter } from './job.routes';
import { applicationRouter } from './application.routes';

export const router = Router();

router.use('/candidates', candidateRouter);
router.use('/jobs', jobRouter);
router.use('/applications', applicationRouter);


