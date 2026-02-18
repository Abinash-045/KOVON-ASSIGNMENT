import { ObjectId } from 'mongodb';

export type ApplicationStatus = 'ELIGIBLE' | 'REJECTED' | 'SHORTLISTED';

export interface Application {
  _id: ObjectId;
  candidateId: ObjectId;
  jobId: ObjectId;
  eligibilityScore: number;
  status: ApplicationStatus;
  createdAt: Date;
}

