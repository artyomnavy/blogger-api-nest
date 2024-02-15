import { UserOutputModel, User } from '../api/models/user.output.model';
import { CreateUserModel } from '../api/models/user.input.model';
import { UsersRepository } from '../infrastructure/users.repository';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { AuthLoginModel } from '../../auth/api/models/auth.input.model';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
@Injectable()
export class UsersService {
  constructor(
    protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  async createUserByAdmin(
    createData: CreateUserModel,
  ): Promise<UserOutputModel> {
    const passwordHash = await bcrypt.hash(createData.password, 10);

    const newUser = new User(
      new ObjectId(),
      {
        login: createData.login,
        password: passwordHash,
        email: createData.email,
        createdAt: new Date(),
      },
      {
        confirmationCode: null,
        expirationDate: null,
        isConfirmed: true,
      },
    );

    const createdUser = await this.usersRepository.createUser(newUser);

    return createdUser;
  }
  async checkCredentials(inputData: AuthLoginModel) {
    const user = await this.usersQueryRepository.getUserByLoginOrEmail(
      inputData.loginOrEmail,
    );

    if (!user) {
      return null;
    }

    if (!user.emailConfirmation.isConfirmed) {
      return null;
    }

    const checkPassword = await bcrypt.compare(
      inputData.password,
      user.accountData.password,
    );

    if (!checkPassword) {
      return null;
    } else {
      return user;
    }
  }
  async deleteUser(id: string): Promise<boolean> {
    return await this.usersRepository.deleteUser(id);
  }
}
