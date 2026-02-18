import { ObjectId } from 'mongodb';
import { getDb } from '../config/db';
import { Job } from '../models/job.model';

export class JobRepository {
  async create(data: Omit<Job, '_id' | 'createdAt'>): Promise<Job> {
    const db = getDb();
    const now = new Date();
    
    const doc = {
      ...data,
      createdAt: now,
    };
    
    const result = await db.collection('jobs').insertOne(doc);
    return { _id: result.insertedId as ObjectId, ...doc } as Job;
  }

  async findById(id: ObjectId): Promise<Job | null> {
    const db = getDb();
    return (await db.collection('jobs').findOne({ _id: id })) as Job | null;
  }

  async exists(id: ObjectId): Promise<boolean> {
    const db = getDb();
    const result = await db.collection('jobs').findOne({ _id: id }, { projection: { _id: 1 } });
    return result !== null;
  }
}

