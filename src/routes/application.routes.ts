import { Router } from 'express';
import { ApplicationController } from '../controllers/application.controller';

const router = Router();
const applicationController = new ApplicationController();

router.post('/', applicationController.handleCreateApplication.bind(applicationController));
router.get('/', applicationController.handleListApplications.bind(applicationController));
router.patch('/:id/shortlist', applicationController.handleShortlistApplication.bind(applicationController));

export { router as applicationRouter };

