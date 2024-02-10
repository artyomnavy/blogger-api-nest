import { CommentType } from '../api/models/comment.output.model';
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CommentDocument = HydratedDocument<CommentType>;

@Schema()
class CommentatorInfo {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;
}

@Schema()
class LikesInfo {
  @Prop({ required: true })
  likesCount: number;

  @Prop({ required: true })
  dislikesCount: number;

  @Prop({ required: true })
  myStatus: string;
}

@Schema()
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  commentatorInfo: CommentatorInfo;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  likesInfo: LikesInfo;
}

export const CommentEntity = SchemaFactory.createForClass(Comment);
