import { JobRepository } from '../repositories/job.repository';
import { Job } from '../models/job.model';

export interface CreateJobInput {
  title: string;
  country: string;
  minExperience: number;
  minLanguageScore: number;
}

export class JobService {
  private jobRepository: JobRepository;

  constructor() {
    this.jobRepository = new JobRepository();
  }

  async createJob(data: CreateJobInput): Promise<Job> {
    return this.jobRepository.create(data);
  }
}

