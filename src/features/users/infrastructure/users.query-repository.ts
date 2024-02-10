import { Injectable } from '@nestjs/common';
import { PaginatorUserModel } from '../api/models/user.input.model';
import {
  PaginatorUserOutputModel,
  userMapper,
} from '../api/models/user.output.model';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../domain/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async getAllUsers(
    QueryData: PaginatorUserModel,
  ): Promise<PaginatorUserOutputModel> {
    const sortBy = QueryData.sortBy ? QueryData.sortBy : 'createdAt';
    const sortDirection = QueryData.sortDirection
      ? QueryData.sortDirection
      : 'desc';
    const pageNumber = QueryData.pageNumber ? QueryData.pageNumber : 1;
    const pageSize = QueryData.pageSize ? QueryData.pageSize : 10;
    const searchLoginTerm = QueryData.searchLoginTerm
      ? QueryData.searchLoginTerm
      : null;
    const searchEmailTerm = QueryData.searchEmailTerm
      ? QueryData.searchEmailTerm
      : null;

    let filterLogin = {};
    let filterEmail = {};

    if (searchLoginTerm) {
      filterLogin = {
        login: {
          $regex: searchLoginTerm,
          $options: 'i',
        },
      };
    }

    if (searchEmailTerm) {
      filterEmail = {
        email: {
          $regex: searchEmailTerm,
          $options: 'i',
        },
      };
    }

    const filter = {
      $or: [filterLogin, filterEmail],
    };

    const users = await this.userModel
      .find(filter)
      .sort({ [sortBy]: sortDirection === 'desc' ? -1 : 1 })
      .skip((+pageNumber - 1) * +pageSize)
      .limit(+pageSize);

    const totalCount = await this.userModel.countDocuments(filter);

    const pagesCount = Math.ceil(+totalCount / +pageSize);

    return {
      pagesCount: pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items: users.map(userMapper),
    };
  }
}
