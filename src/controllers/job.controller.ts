import { Request, Response, NextFunction } from 'express';
import { JobService } from '../services/job.service';

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

export class JobController {
  private jobService: JobService;

  constructor() {
    this.jobService = new JobService();
  }

  async handleCreateJob(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const body = req.body as any;

      if (!isNonEmptyString(body?.title)) {
        return res.status(400).json({ error: 'title is required' });
      }
      if (!isNonEmptyString(body?.country)) {
        return res.status(400).json({ error: 'country is required' });
      }
      if (!isNumber(body?.minExperience) || body.minExperience < 0) {
        return res.status(400).json({ error: 'minExperience must be a number >= 0' });
      }
      if (
        !isNumber(body?.minLanguageScore) ||
        body.minLanguageScore < 0 ||
        body.minLanguageScore > 100
      ) {
        return res
          .status(400)
          .json({ error: 'minLanguageScore must be a number between 0 and 100' });
      }

      const job = await this.jobService.createJob({
        title: body.title,
        country: body.country,
        minExperience: body.minExperience,
        minLanguageScore: body.minLanguageScore,
      });
      res.status(201).json(job);
    } catch (err) {
      next(err);
    }
  }
}

