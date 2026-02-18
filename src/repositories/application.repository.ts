import { ObjectId } from 'mongodb';
import { getDb } from '../config/db';
import { Application } from '../models/application.model';

export class ApplicationRepository {
  async create(data: Omit<Application, '_id' | 'createdAt'>): Promise<Application> {
    const db = getDb();
    const now = new Date();
    
    const doc = {
      ...data,
      createdAt: now,
    };
    
    const result = await db.collection('applications').insertOne(doc);
    return { _id: result.insertedId as ObjectId, ...doc } as Application;
  }

  async findById(id: ObjectId): Promise<Application | null> {
    const db = getDb();
    return (await db.collection('applications').findOne({ _id: id })) as Application | null;
  }

  async findByJobId(jobId: ObjectId) {
    const db = getDb();
    return db
      .collection('applications')
      .aggregate([
        { $match: { jobId } },
        {
          $lookup: {
            from: 'candidates',
            localField: 'candidateId',
            foreignField: '_id',
            as: 'candidate',
          },
        },
        { $unwind: '$candidate' },
        {
          $addFields: {
            statusRank: {
              $switch: {
                branches: [
                  { case: { $eq: ['$status', 'ELIGIBLE'] }, then: 0 },
                  { case: { $eq: ['$status', 'REJECTED'] }, then: 1 },
                  { case: { $eq: ['$status', 'SHORTLISTED'] }, then: 2 },
                ],
                default: 3,
              },
            },
          },
        },
        { $sort: { statusRank: 1, eligibilityScore: -1, 'candidate.experience': -1 } },
        { $project: { statusRank: 0 } },
      ])
      .toArray();
  }

  async updateStatus(id: ObjectId, status: Application['status']): Promise<Application | null> {
    const db = getDb();
    const result = await db.collection('applications').findOneAndUpdate(
      { _id: id },
      { $set: { status } },
      { returnDocument: 'after' }
    );
    return result?.value as Application | null;
  }

  async updateStatusIfEligible(id: ObjectId, status: Application['status']): Promise<Application | null> {
    const db = getDb();
    const result = await db.collection('applications').findOneAndUpdate(
      { _id: id, status: 'ELIGIBLE' },
      { $set: { status } },
      { returnDocument: 'after' }
    );
    return result?.value as Application | null;
  }
}

