import { Injectable } from '@nestjs/common';
import { AttemptsRepository } from '../infrastructure/attempts.repository';
import { UsersQueryRepository } from '../../users/infrastructure/users.query-repository';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import {
  User,
  UserOutputModel,
} from '../../users/api/models/user.output.model';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserModel } from '../../users/api/models/user.input.model';
import { AttemptModel } from '../api/models/attempt.model';
import { EmailsManager } from '../../../managers/emails-manager';
import { AuthLoginModel } from '../api/models/auth.input.model';

@Injectable()
export class AuthService {
  constructor(
    protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository,
    protected attemptsRepository: AttemptsRepository,
    protected emailsManager: EmailsManager,
  ) {}
  async createUserByRegistration(
    createData: CreateUserModel,
  ): Promise<UserOutputModel | null> {
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
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), {
          minutes: 10,
        }),
        isConfirmed: false,
      },
    );

    const createdUser = await this.usersRepository.createUser(newUser);

    try {
      await this.emailsManager.sendEmailConfirmationMessage(
        newUser.accountData.email,
        newUser.emailConfirmation.confirmationCode!,
      );
    } catch (e) {
      console.error(e);
      return null;
    }

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
  async updateConfirmationCode(email: string): Promise<string | null> {
    const newCode = uuidv4();
    const newExpirationDate = add(new Date(), {
      minutes: 10,
    });

    const isUpdated = await this.usersRepository.updateConfirmationCode(
      email,
      newCode,
      newExpirationDate,
    );

    if (isUpdated) {
      return newCode;
    } else {
      return null;
    }
  }
  async confirmEmail(code: string): Promise<boolean> {
    const user =
      await this.usersQueryRepository.getUserByConfirmationCode(code);

    return await this.usersRepository.updateConfirmStatus(user!._id);
  }
  async resendingEmail(email: string, newCode: string) {
    try {
      await this.emailsManager.sendEmailConfirmationMessage(email, newCode);
    } catch (e) {
      console.error(e);
      return false;
    }

    return true;
  }
  async addAttempt(attempt: AttemptModel): Promise<AttemptModel> {
    return await this.attemptsRepository.addAttempt(attempt);
  }
  async sendEmailForPasswordRecovery(email: string, recoveryCode: string) {
    try {
      await this.emailsManager.sendEmailReconfirmationMessage(
        email,
        recoveryCode,
      );
    } catch (e) {
      console.error(e);
      return false;
    }

    return true;
  }
  async updatePasswordForRecovery(recoveryCode: string, newPassword: string) {
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    return await this.usersRepository.updatePasswordForRecovery(
      recoveryCode,
      newPasswordHash,
    );
  }
}
