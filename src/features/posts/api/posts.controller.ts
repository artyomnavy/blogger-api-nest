import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { CreateAndUpdatePostModel } from './models/post.input.model';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query-repository';
import { PostOutputModel } from './models/post.output.model';
import { PaginatorModel } from '../../../common/models/paginator.input.model';
import { PaginatorOutputModel } from '../../../common/models/paginator.output.model';
import { CommentOutputModel } from '../../comments/api/models/comment.output.model';
import { HTTP_STATUSES } from '../../../utils';
import { ObjectIdPipe } from '../../../common/pipes/objectId.pipe';
import { BasicAuthGuard } from '../../../common/guards/basic-auth.guard';
import { Request } from 'express';
import { CreateAndUpdateCommentModel } from '../../comments/api/models/comment.input.model';
import { UsersQueryRepository } from '../../users/infrastructure/users.query-repository';
import { CommentsService } from '../../comments/application/comments.service';
import { UpdateLikeModel } from '../../likes/api/models/like.input.model';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected postsQueryRepository: PostsQueryRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
    protected usersQueryRepository: UsersQueryRepository,
    protected commentsService: CommentsService,
  ) {}
  @Get(':id/comments')
  async getCommentsForPost(
    @Param('id', ObjectIdPipe) postId: string,
    @Query() query: PaginatorModel,
  ): Promise<PaginatorOutputModel<CommentOutputModel>> {
    const post = await this.postsQueryRepository.getPostById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const queryData: PaginatorModel & { postId: string } = {
      ...query,
      postId,
    };

    const comments =
      await this.commentsQueryRepository.getCommentsByPostId(queryData);

    return comments;
  }
  @Get()
  async getAllPosts(
    @Query() query: PaginatorModel,
  ): Promise<PaginatorOutputModel<PostOutputModel>> {
    const posts = await this.postsQueryRepository.getAllPosts(query);

    return posts;
  }
  @Post()
  @UseGuards(BasicAuthGuard)
  @HttpCode(HTTP_STATUSES.CREATED_201)
  async createPost(
    @Body() createModel: CreateAndUpdatePostModel,
  ): Promise<PostOutputModel> {
    const newPost = await this.postsService.createPost(createModel);

    return newPost;
  }
  @Post('/:id/comments')
  @HttpCode(HTTP_STATUSES.CREATED_201)
  async createCommentForPost(
    @Param('id', ObjectIdPipe) postId: string,
    @Body() createModel: CreateAndUpdateCommentModel,
    @Req()
    req: Request,
  ) {
    const userId = req.userId!;

    const post = await this.postsQueryRepository.getPostById(postId);

    if (!post) throw new NotFoundException('Post not found');

    const user = await this.usersQueryRepository.getUserById(userId);

    const userLogin = user!.login;

    const newComment = await this.commentsService.createComment(
      postId,
      userId,
      userLogin,
      createModel.content,
    );

    return newComment;
  }
  @Put('/:id/like-status')
  @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
  async changeLikeStatusForPost(
    @Param('id', ObjectIdPipe) postId: string,
    @Body() updateData: UpdateLikeModel,
    @Req() req: Request,
  ) {
    const userId = req.userId!;

    const post = await this.postsQueryRepository.getPostById(postId, userId);

    if (!post) throw new NotFoundException('Post not found');

    const isUpdated = await this.postsService.changeLikeStatusPostForUser(
      userId,
      post,
      updateData.likeStatus,
    );

    if (isUpdated) return;
  }
  @Get(':id')
  async getPost(
    @Param('id', ObjectIdPipe) postId: string,
  ): Promise<PostOutputModel> {
    const post = await this.postsQueryRepository.getPostById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    } else {
      return post;
    }
  }
  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
  async updatePost(
    @Param('id', ObjectIdPipe) postId: string,
    @Body() updateModel: CreateAndUpdatePostModel,
  ) {
    const post = await this.postsQueryRepository.getPostById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const isUpdated = await this.postsService.updatePost(postId, updateModel);

    if (isUpdated) {
      return;
    }
  }
  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
  async deletePost(@Param('id', ObjectIdPipe) postId: string) {
    const isDeleted = await this.postsService.deletePost(postId);

    if (isDeleted) {
      return;
    } else {
      throw new NotFoundException('Post not found');
    }
  }
}
