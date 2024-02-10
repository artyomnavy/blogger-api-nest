import { ObjectId } from 'mongodb';
import { UserDocument } from '../../domain/user.entity';

export class UserOutputModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
}

export class PaginatorUserOutputModel {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: UserOutputModel[];
}

export class UserModel {
  login: string;
  password: string;
  email: string;
  createdAt: string;
}

export class EmailConfirmationModel {
  confirmationCode: string | null;
  expirationDate: string | null;
  isConfirmed: boolean;
}

export class UserAccountModel {
  _id: ObjectId;
  accountData: UserModel;
  emailConfirmation: EmailConfirmationModel;
}

export class User {
  constructor(
    public _id: ObjectId,
    public accountData: UserModel,
    public emailConfirmation: EmailConfirmationModel,
  ) {}
}

export const userMapper = (user: UserDocument): UserOutputModel => {
  const userOutputModel = new UserOutputModel();

  userOutputModel.id = user._id.toString();
  userOutputModel.login = user.accountData.login;
  userOutputModel.email = user.accountData.email;
  userOutputModel.createdAt = user.accountData.createdAt;

  return userOutputModel;
};
