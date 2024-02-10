import { UserAccountModel } from '../api/models/user.output.model';
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = HydratedDocument<UserAccountModel>;

@Schema()
class AccountData {
  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  createdAt: string;
}

@Schema()
class EmailConfirmation {
  @Prop({ required: true })
  confirmationCode: string;

  @Prop({ required: true })
  expirationDate: string;

  @Prop({ required: true })
  isConfirmed: boolean;
}

@Schema()
export class User {
  @Prop({ required: true })
  accountData: AccountData;

  @Prop({ required: true })
  emailConfirmation: EmailConfirmation;
}

export const UserEntity = SchemaFactory.createForClass(User);