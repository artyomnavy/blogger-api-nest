import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import {
  CheckCodeConfirmation,
  CheckRecoveryCodeConfirmation,
  IsEmailExistAndConfirmed,
} from '../../../../common/decorators/validators/user-validator.decorator';

export class AuthLoginModel {
  @Matches(/^[a-zA-Z0-9_-]{3,10}$/ || /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, {
    message: 'Invalid login or email pattern',
  })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  loginOrEmail: string;

  @Length(6, 20, { message: 'Invalid password length' })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class PasswordRecoveryModel {
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, {
    message: 'Invalid email pattern',
  })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class NewPasswordRecoveryModel {
  @CheckRecoveryCodeConfirmation()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  recoveryCode: string;

  @Length(6, 20)
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class ConfirmCodeModel {
  @CheckCodeConfirmation()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class RegistrationEmailResendModel {
  @IsEmailExistAndConfirmed()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, {
    message: 'Invalid email pattern',
  })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  email: string;
}
