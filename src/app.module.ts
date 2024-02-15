import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import dotenv from 'dotenv';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogEntity } from './features/blogs/domain/blog.entity';
import { Post, PostEntity } from './features/posts/domain/post.entity';
import {
  Comment,
  CommentEntity,
} from './features/comments/domain/comment.entity';
import { User, UserEntity } from './features/users/domain/user.entity';
import { BlogsController } from './features/blogs/api/blogs.controller';
import { PostsController } from './features/posts/api/posts.controller';
import { CommentsController } from './features/comments/api/comments.controller';
import { UsersController } from './features/users/api/users.controller';
import { BlogsService } from './features/blogs/application/blogs.service';
import { PostsService } from './features/posts/application/posts.service';
import { UsersService } from './features/users/application/users.service';
import { BlogsQueryRepository } from './features/blogs/infrastructure/blogs.query-repository';
import { CommentsQueryRepository } from './features/comments/infrastructure/comments.queryRepository';
import { UsersQueryRepository } from './features/users/infrastructure/users.query-repository';
import { PostsQueryRepository } from './features/posts/infrastructure/posts.query-repository';
import { TestController } from '../test/test.controller';
import { BlogsRepository } from './features/blogs/infrastructure/blogs.repository';
import { PostsRepository } from './features/posts/infrastructure/posts.repository';
import { UsersRepository } from './features/users/infrastructure/users.repository';
import { BlogExistConstraint } from './common/decorators/validators/blog-validator.decorator';
import {
  CodeConfirmationConstraint,
  EmailExistAndConfirmedConstraint,
  EmailExistConstraint,
  LoginExistConstraint,
  RecoveryCodeConstraint,
} from './common/decorators/validators/user-validator.decorator';
import { Attempt, AttemptEntity } from './features/auth/domain/attempt.entity';
import {
  DeviceSession,
  DeviceSessionEntity,
} from './features/devices/domain/device.entity';
import { DevicesQueryRepository } from './features/devices/infrastrucure/devices.query-repository';
import { DevicesRepository } from './features/devices/infrastrucure/devices.repository';
import { AttemptsQueryRepository } from './features/auth/infrastructure/attempts.query-repository';
import { AttemptsRepository } from './features/auth/infrastructure/attempts.repository';
import { JwtService } from './application/jwt.service';
import { EmailsAdapter } from './adapters/EmailsAdapter';
import { EmailsManager } from './managers/emails-manager';
dotenv.config();

const mongoURI = process.env.MONGO_URL || 'mongodb://0.0.0.0:27017';

if (!mongoURI) {
  throw new Error(`Url doesn't found`);
}

const servicesProviders = [
  AppService,
  BlogsService,
  PostsService,
  UsersService,
  JwtService,
];

const repositoriesProviders = [
  BlogsRepository,
  PostsRepository,
  UsersRepository,
  DevicesRepository,
  AttemptsRepository,
];

const queryRepositoriesProviders = [
  BlogsQueryRepository,
  CommentsQueryRepository,
  UsersQueryRepository,
  PostsQueryRepository,
  DevicesQueryRepository,
  AttemptsQueryRepository,
];

const emailsProviders = [EmailsAdapter, EmailsManager];

const constraintsProviders = [
  BlogExistConstraint,
  LoginExistConstraint,
  EmailExistConstraint,
  RecoveryCodeConstraint,
  CodeConfirmationConstraint,
  EmailExistAndConfirmedConstraint,
];

@Module({
  imports: [
    MongooseModule.forRoot(mongoURI, {
      dbName: 'BloggerPlatform',
    }),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogEntity },
      { name: Post.name, schema: PostEntity },
      { name: Comment.name, schema: CommentEntity },
      { name: User.name, schema: UserEntity },
      { name: Attempt.name, schema: AttemptEntity },
      { name: DeviceSession.name, schema: DeviceSessionEntity },
    ]),
  ],
  controllers: [
    AppController,
    BlogsController,
    PostsController,
    CommentsController,
    UsersController,
    TestController,
  ],
  providers: [
    ...servicesProviders,
    ...repositoriesProviders,
    ...queryRepositoriesProviders,
    ...emailsProviders,
    ...constraintsProviders,
  ],
})
export class AppModule {}
