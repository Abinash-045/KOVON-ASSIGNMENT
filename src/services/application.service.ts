import { ObjectId } from 'mongodb';
import { ApplicationRepository } from '../repositories/application.repository';
import { CandidateRepository } from '../repositories/candidate.repository';
import { JobRepository } from '../repositories/job.repository';
import { Application, ApplicationStatus } from '../models/application.model';
import { HttpError } from '../middlewares/errorHandler';

export interface CreateApplicationInput {
  candidateId: string;
  jobId: string;
}

function parseObjectId(id: string, fieldName: string): ObjectId {
  try {
    return new ObjectId(id);
  } catch {
    throw new HttpError(400, `Invalid ${fieldName}`);
  }
}

export class ApplicationService {
  private applicationRepository: ApplicationRepository;
  private candidateRepository: CandidateRepository;
  private jobRepository: JobRepository;

  constructor() {
    this.applicationRepository = new ApplicationRepository();
    this.candidateRepository = new CandidateRepository();
    this.jobRepository = new JobRepository();
  }

  async createApplication(input: CreateApplicationInput): Promise<Application> {
    const candidateObjectId = parseObjectId(input.candidateId, 'candidateId');
    const jobObjectId = parseObjectId(input.jobId, 'jobId');

    const candidate = await this.candidateRepository.findById(candidateObjectId);
    if (!candidate) throw new HttpError(404, 'Candidate not found');

    const job = await this.jobRepository.findById(jobObjectId);
    if (!job) throw new HttpError(404, 'Job not found');

    const eligibilityScore =
      candidate.experience * 2 +
      candidate.languageScore / 10 +
      (candidate.documentsVerified ? 10 : 0);

    const isEligible =
      candidate.experience >= job.minExperience &&
      candidate.languageScore >= job.minLanguageScore &&
      candidate.documentsVerified === true;

    const status: ApplicationStatus = isEligible ? 'ELIGIBLE' : 'REJECTED';

    return this.applicationRepository.create({
      candidateId: candidateObjectId,
      jobId: jobObjectId,
      eligibilityScore,
      status,
    });
  }

  async listApplicationsByJob(jobId: string) {
    const jobObjectId = parseObjectId(jobId, 'jobId');

    const exists = await this.jobRepository.exists(jobObjectId);
    if (!exists) throw new HttpError(404, 'Job not found');

    return this.applicationRepository.findByJobId(jobObjectId);
  }

  async shortlistApplication(id: string) {
    const appObjectId = parseObjectId(id, 'application id');

    // First check if application exists
    const existing = await this.applicationRepository.findById(appObjectId);
    if (!existing) throw new HttpError(404, 'Application not found');

    // Check if already shortlisted
    if (existing.status === 'SHORTLISTED') {
      return existing;
    }

    // Check if eligible
    if (existing.status !== 'ELIGIBLE') {
      throw new HttpError(400, 'Only ELIGIBLE applications can be shortlisted');
    }

    // Update to shortlisted
    const result = await this.applicationRepository.updateStatus(
      appObjectId,
      'SHORTLISTED'
    );

    if (!result) {
      throw new HttpError(500, 'Failed to update application status');
    }

    return result;
  }
}

