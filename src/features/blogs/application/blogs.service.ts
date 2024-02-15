import { BlogsRepository } from '../infrastructure/blogs.repository';
import { ObjectId } from 'mongodb';
import { Blog, BlogOutputModel } from '../api/models/blog.output.model';
import { CreateAndUpdateBlogModel } from '../api/models/blog.input.model';
import { Injectable } from '@nestjs/common';
@Injectable()
export class BlogsService {
  constructor(protected blogsRepository: BlogsRepository) {}
  async createBlog(
    createData: CreateAndUpdateBlogModel,
  ): Promise<BlogOutputModel> {
    const newBlog = new Blog(
      new ObjectId(),
      createData.name,
      createData.description,
      createData.websiteUrl,
      new Date(),
      false,
    );

    const createdBlog = await this.blogsRepository.createBlog(newBlog);

    return createdBlog;
  }
  async updateBlog(
    id: string,
    updateData: CreateAndUpdateBlogModel,
  ): Promise<boolean> {
    return await this.blogsRepository.updateBlog(id, updateData);
  }
  async deleteBlog(id: string): Promise<boolean> {
    return await this.blogsRepository.deleteBlog(id);
  }
}
