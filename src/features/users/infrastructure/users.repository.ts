import { Injectable } from '@nestjs/common';
import {
  UserOutputModel,
  userMapper,
  UserAccountModel,
} from '../api/models/user.output.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../domain/user.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async createUser(newUser: UserAccountModel): Promise<UserOutputModel> {
    const resultCreateUser = await this.userModel.create(newUser);
    return userMapper(resultCreateUser);
  }
  async deleteUser(id: string): Promise<boolean> {
    const resultDeleteUser = await this.userModel.deleteOne({
      _id: new ObjectId(id),
    });
    return resultDeleteUser.deletedCount === 1;
  }
}
