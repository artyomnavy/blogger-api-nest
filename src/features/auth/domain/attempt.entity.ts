import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AttemptModel } from '../api/models/attempt.model';

export type AttemptDocument = HydratedDocument<AttemptModel>;

@Schema()
export class Attempt {
  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  date: Date;
}

export const AttemptEntity = SchemaFactory.createForClass(Attempt);
