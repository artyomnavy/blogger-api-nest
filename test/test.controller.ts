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

@Controller('testing')
export class TestController {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  @Delete('all-data')
  @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
  async deleteAll() {
    await this.blogModel.deleteMany({});
    await this.postModel.deleteMany({});
    await this.commentModel.deleteMany({});
    await this.userModel.deleteMany({});
    return;
  }
}
