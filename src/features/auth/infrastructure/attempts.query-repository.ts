import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attempt, AttemptDocument } from '../domain/attempt.entity';
import { AttemptModel } from '../api/models/attempt.model';

@Injectable()
export class AttemptsQueryRepository {
  constructor(
    @InjectModel(Attempt.name) private attemptModel: Model<AttemptDocument>,
  ) {}
  async getAmountOfAttempts(attempt: AttemptModel): Promise<number> {
    const amount = await this.attemptModel.countDocuments({
      ip: attempt.ip,
      url: attempt.url,
      date: { $gte: attempt.date },
    });
    return amount;
  }
}
