import { PostType } from '../api/models/post.output.model';
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PostDocument = HydratedDocument<PostType>;

@Schema()
class NewestLikes {
  @Prop({ required: true })
  addedAt: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  login: string;
}

@Schema()
class ExtendedLikesInfo {
  @Prop({ required: true })
  likesCount: number;

  @Prop({ required: true })
  dislikesCount: number;

  @Prop({ required: true })
  myStatus: string;

  @Prop({ required: true })
  newestLikes: NewestLikes[];
}

@Schema()
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  extendedLikesInfo: ExtendedLikesInfo;
}

export const PostEntity = SchemaFactory.createForClass(Post);
