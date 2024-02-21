import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../src/features/blogs/domain/blog.entity';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../src/features/posts/domain/post.entity';
import { User, UserDocument } from '../src/features/users/domain/user.entity';
import {
  CommentDocument,
  Comment,
} from '../src/features/comments/domain/comment.entity';
import { HTTP_STATUSES } from '../src/utils';
import {
  Attempt,
  AttemptDocument,
} from '../src/features/auth/domain/attempt.entity';
import {
  DeviceSession,
  DeviceSessionDocument,
} from '../src/features/devices/domain/device.entity';
import { Like, LikeDocument } from '../src/features/likes/domain/like.entity';

@Controller('testing')
export class TestController {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Attempt.name) private attemptModel: Model<AttemptDocument>,
    @InjectModel(DeviceSession.name)
    private deviceSessionModel: Model<DeviceSessionDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
  ) {}

  @Delete('all-data')
  @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
  async deleteAll() {
    await this.blogModel.deleteMany({});
    await this.postModel.deleteMany({});
    await this.commentModel.deleteMany({});
    await this.userModel.deleteMany({});
    await this.attemptModel.deleteMany({});
    await this.attemptModel.deleteMany({});
    await this.deviceSessionModel.deleteMany({});
    await this.likeModel.deleteMany({});
    return;
  }
}
