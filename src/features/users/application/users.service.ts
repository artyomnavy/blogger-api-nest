import { UserOutputModel, User } from '../api/models/user.output.model';
import { CreateUserModel } from '../api/models/user.input.model';
import { UsersRepository } from '../infrastructure/users.repository';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

export class UsersService {
  constructor(protected usersRepository: UsersRepository) {}

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
        createdAt: new Date().toISOString(),
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

  async deleteUser(id: string): Promise<boolean> {
    return await this.usersRepository.deleteUser(id);
  }
}
