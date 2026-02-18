import { CandidateRepository } from '../repositories/candidate.repository';
import { Candidate } from '../models/candidate.model';

export interface CreateCandidateInput {
  name: string;
  skill: string;
  experience: number;
  languageScore: number;
  documentsVerified: boolean;
}

export class CandidateService {
  private candidateRepository: CandidateRepository;

  constructor() {
    this.candidateRepository = new CandidateRepository();
  }

  async createCandidate(data: CreateCandidateInput): Promise<Candidate> {
    return this.candidateRepository.create(data);
  }
}

