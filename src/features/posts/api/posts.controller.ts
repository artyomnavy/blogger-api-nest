import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import {
  CreateAndUpdatePostModel,
  PaginatorPostModel,
} from './models/post.input.model';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.queryRepository';
import { PostOutputModel } from './models/post.output.model';
import { PaginatorCommentModel } from '../../comments/api/models/comment.input.model';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected postsQueryRepository: PostsQueryRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
  ) {}
  @Get(':id/comments')
  async getCommentsForPost(
    @Param('id') postId: string,
    @Query() query: PaginatorCommentModel,
  ) {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;

    const post = await this.postsQueryRepository.getPostById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comments = await this.commentsQueryRepository.getCommentsByPostId({
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      postId,
    });

    return comments;
  }
  @Get()
  async getAllPosts(@Query() query: PaginatorPostModel) {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;

    const posts = await this.postsQueryRepository.getAllPosts({
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    });

    return posts;
  }
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Body() createModel: CreateAndUpdatePostModel) {
    const { title, shortDescription, content, blogId } = createModel;

    const newPost = await this.postsService.createPost({
      title,
      shortDescription,
      content,
      blogId,
    });

    return newPost;
  }
  @Get(':id')
  async getPost(@Param('id') postId: string): Promise<PostOutputModel> {
    const post = await this.postsQueryRepository.getPostById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    } else {
      return post;
    }
  }
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') postId: string,
    @Body() updateModel: CreateAndUpdatePostModel,
  ) {
    const { title, shortDescription, content, blogId } = updateModel;

    const post = await this.postsQueryRepository.getPostById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const isUpdated = await this.postsService.updatePost(postId, {
      title,
      shortDescription,
      content,
      blogId,
    });

    if (isUpdated) {
      return;
    }
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') postId: string) {
    const isDeleted = await this.postsService.deletePost(postId);

    if (isDeleted) {
      return;
    } else {
      throw new NotFoundException('Post not found');
    }
  }
}
