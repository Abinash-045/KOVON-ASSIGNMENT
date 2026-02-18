import { ObjectId } from 'mongodb';

export interface Job {
  _id: ObjectId;
  title: string;
  country: string;
  minExperience: number;
  minLanguageScore: number;
  createdAt: Date;
}

