import { ObjectId } from 'mongodb';
import { getDb } from '../config/db';
import { Candidate } from '../models/candidate.model';

export class CandidateRepository {
  async create(data: Omit<Candidate, '_id' | 'createdAt'>): Promise<Candidate> {
    const db = getDb();
    const now = new Date();
    
    const doc = {
      ...data,
      createdAt: now,
    };
    
    const result = await db.collection('candidates').insertOne(doc);
    return { _id: result.insertedId as ObjectId, ...doc } as Candidate;
  }

  async findById(id: ObjectId): Promise<Candidate | null> {
    const db = getDb();
    return (await db.collection('candidates').findOne({ _id: id })) as Candidate | null;
  }
}

