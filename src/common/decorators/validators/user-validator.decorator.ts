import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersQueryRepository } from '../../../features/users/infrastructure/users.query-repository';

@ValidatorConstraint({ name: 'IsLoginExist', async: true })
@Injectable()
export class LoginExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}

  async validate(login: string): Promise<boolean> {
    const user = await this.usersQueryRepository.getUserByLogin(login);

    if (!user) {
      return true;
    }

    throw new Error('Login already exist');
  }
}

export function IsLoginExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: LoginExistConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsEmailExist', async: true })
@Injectable()
export class EmailExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}

  async validate(email: string): Promise<boolean> {
    const user = await this.usersQueryRepository.getUserByEmail(email);

    if (!user) {
      return true;
    }

    throw new Error('Email already exist');
  }
}

export function IsEmailExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: EmailExistConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'CheckRecoveryCodeConfirmation', async: true })
@Injectable()
export class RecoveryCodeConstraint implements ValidatorConstraintInterface {
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}

  async validate(recoveryCode: string): Promise<boolean> {
    const user =
      await this.usersQueryRepository.getUserByConfirmationCode(recoveryCode);

    if (!user) throw new Error('Recovery code is not exist');

    if (
      user.emailConfirmation.expirationDate !== null &&
      user.emailConfirmation.expirationDate < new Date()
    )
      throw new Error('Recovery code expired');

    return true;
  }
}

export function CheckRecoveryCodeConfirmation(
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: RecoveryCodeConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'CheckCodeConfirmation', async: true })
@Injectable()
export class CodeConfirmationConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}

  async validate(code: string): Promise<boolean> {
    const user =
      await this.usersQueryRepository.getUserByConfirmationCode(code);

    if (!user) throw new Error('Code is not exist');
    if (user.emailConfirmation.isConfirmed)
      throw new Error('Code already been applied');
    if (
      user.emailConfirmation.expirationDate !== null &&
      user.emailConfirmation.expirationDate < new Date()
    )
      throw new Error('Code expired');

    return true;
  }
}

export function CheckCodeConfirmation(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: CodeConfirmationConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsEmailExistAndConfirmed', async: true })
@Injectable()
export class EmailExistAndConfirmedConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}

  async validate(email: string): Promise<boolean> {
    const user = await this.usersQueryRepository.getUserByEmail(email);

    if (!user) throw new Error('Email is not exist');
    if (user!.emailConfirmation.isConfirmed)
      throw new Error('Email is already confirmed');

    return true;
  }
}

export function IsEmailExistAndConfirmed(
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: EmailExistAndConfirmedConstraint,
    });
  };
}
