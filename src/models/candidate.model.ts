import { ObjectId } from 'mongodb';

export interface Candidate {
  _id: ObjectId;
  name: string;
  skill: string;
  experience: number;
  languageScore: number;
  documentsVerified: boolean;
  createdAt: Date;
}

