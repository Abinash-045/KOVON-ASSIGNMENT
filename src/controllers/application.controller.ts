import { Request, Response, NextFunction } from 'express';
import { ApplicationService } from '../services/application.service';

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

export class ApplicationController {
  private applicationService: ApplicationService;

  constructor() {
    this.applicationService = new ApplicationService();
  }

  async handleCreateApplication(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const body = req.body as any;
      if (!isNonEmptyString(body?.candidateId)) {
        return res.status(400).json({ error: 'candidateId is required' });
      }
      if (!isNonEmptyString(body?.jobId)) {
        return res.status(400).json({ error: 'jobId is required' });
      }

      const application = await this.applicationService.createApplication({
        candidateId: body.candidateId,
        jobId: body.jobId,
      });
      res.status(201).json(application);
    } catch (err) {
      next(err);
    }
  }

  async handleListApplications(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const jobId = req.query.jobId;
      if (typeof jobId !== 'string' || jobId.trim().length === 0) {
        return res.status(400).json({ error: 'jobId query parameter is required' });
      }

      const applications = await this.applicationService.listApplicationsByJob(jobId);
      res.json(applications);
    } catch (err) {
      next(err);
    }
  }

  async handleShortlistApplication(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      if (!isNonEmptyString(id)) {
        return res.status(400).json({ error: 'id param is required' });
      }
      const updated = await this.applicationService.shortlistApplication(id);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
}

