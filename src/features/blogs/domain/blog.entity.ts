import { BlogType } from '../types/output';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BlogDocument = HydratedDocument<BlogType>;

@Schema()
export class Blog {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  websiteUrl: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  isMembership: boolean;
}

export const BlogEntity = SchemaFactory.createForClass(Blog);
