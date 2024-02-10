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

    return false;
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

    return false;
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
