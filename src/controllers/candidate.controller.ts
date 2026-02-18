import { Request, Response, NextFunction } from 'express';
import { CandidateService } from '../services/candidate.service';

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

export class CandidateController {
  private candidateService: CandidateService;

  constructor() {
    this.candidateService = new CandidateService();
  }

  async handleCreateCandidate(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const body = req.body as any;

      if (!isNonEmptyString(body?.name)) {
        return res.status(400).json({ error: 'name is required' });
      }
      if (!isNonEmptyString(body?.skill)) {
        return res.status(400).json({ error: 'skill is required' });
      }
      if (!isNumber(body?.experience) || body.experience < 0) {
        return res.status(400).json({ error: 'experience must be a number >= 0' });
      }
      if (
        !isNumber(body?.languageScore) ||
        body.languageScore < 0 ||
        body.languageScore > 100
      ) {
        return res
          .status(400)
          .json({ error: 'languageScore must be a number between 0 and 100' });
      }
      if (typeof body?.documentsVerified !== 'boolean') {
        return res.status(400).json({ error: 'documentsVerified must be boolean' });
      }

      const candidate = await this.candidateService.createCandidate({
        name: body.name,
        skill: body.skill,
        experience: body.experience,
        languageScore: body.languageScore,
        documentsVerified: body.documentsVerified,
      });
      res.status(201).json(candidate);
    } catch (err) {
      next(err);
    }
  }
}

