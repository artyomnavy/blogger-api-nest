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
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { BlogsService } from '../application/blogs.service';
import { PostsService } from '../../posts/application/posts.service';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query-repository';
import { BlogOutputModel } from './models/blog.output.model';
import {
  CreateAndUpdateBlogModel,
  PaginatorBlogModel,
} from './models/blog.input.model';
import {
  CreateAndUpdatePostModel,
  PaginatorPostModel,
} from '../../posts/api/models/post.input.model';
import { PaginatorPostOutputModel } from '../../posts/api/models/post.output.model';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsQueryRepository: BlogsQueryRepository,
    protected blogsService: BlogsService,
    protected postsQueryRepository: PostsQueryRepository,
    protected postsService: PostsService,
  ) {}

  @Get()
  async getAllBlogs(@Query() query: PaginatorBlogModel) {
    const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } =
      query;

    const blogs = await this.blogsQueryRepository.getAllBlogs({
      searchNameTerm,
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
    });

    return blogs;
  }
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(
    @Body() createModel: CreateAndUpdateBlogModel,
  ): Promise<BlogOutputModel> {
    const { name, description, websiteUrl } = createModel;

    const newBlog = await this.blogsService.createBlog({
      name,
      description,
      websiteUrl,
    });

    return newBlog;
  }
  @Get(':id/posts')
  async getPostsForBlog(
    @Param('id') blogId: string,
    @Query() query: PaginatorPostModel,
  ): Promise<PaginatorPostOutputModel> {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;

    const blog = await this.blogsQueryRepository.getBlogById(blogId);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const posts = await this.postsQueryRepository.getPostsByBlogId({
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      blogId,
    });

    return posts;
  }
  @Post(':id/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostForBlog(
    @Param('id') blogId: string,
    @Body() updateModel: CreateAndUpdatePostModel,
  ) {
    const blog = await this.blogsQueryRepository.getBlogById(blogId);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const { title, shortDescription, content } = updateModel;

    const post = await this.postsService.createPost({
      title,
      shortDescription,
      content,
      blogId,
    });

    return post;
  }
  @Get(':id')
  async getBlog(@Param('id') blogId: string): Promise<BlogOutputModel> {
    const blog = await this.blogsQueryRepository.getBlogById(blogId);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    } else {
      return blog;
    }
  }
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') blogId: string,
    @Body() updateModel: CreateAndUpdateBlogModel,
  ) {
    const { name, description, websiteUrl } = updateModel;

    const blog = await this.blogsQueryRepository.getBlogById(blogId);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const isUpdated = await this.blogsService.updateBlog(blogId, {
      name,
      description,
      websiteUrl,
    });

    if (isUpdated) {
      return;
    }
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') blogId: string) {
    const isDeleted = await this.blogsService.deleteBlog(blogId);

    if (isDeleted) {
      return;
    } else {
      throw new NotFoundException('Blog not found');
    }
  }
}
