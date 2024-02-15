import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attempt, AttemptDocument } from '../domain/attempt.entity';
import { AttemptModel } from '../api/models/attempt.model';

@Injectable()
export class AttemptsRepository {
  constructor(
    @InjectModel(Attempt.name) private attemptModel: Model<AttemptDocument>,
  ) {}
  async addAttempt(attempt: AttemptModel): Promise<AttemptModel> {
    await this.attemptModel.create(attempt);

    return attempt;
  }
}
