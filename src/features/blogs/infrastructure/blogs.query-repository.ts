import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../domain/blog.entity';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
  blogMapper,
  BlogOutputModel,
  PaginatorBlogOutputModel,
} from '../api/models/blog.output.model';
import { PaginatorBlogModel } from '../api/models/blog.input.model';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}
  async getAllBlogs(
    QueryData: PaginatorBlogModel,
  ): Promise<PaginatorBlogOutputModel> {
    const searchNameTerm = QueryData.searchNameTerm
      ? QueryData.searchNameTerm
      : null;
    const sortBy = QueryData.sortBy ? QueryData.sortBy : 'createdAt';
    const sortDirection = QueryData.sortDirection
      ? QueryData.sortDirection
      : 'desc';
    const pageNumber = QueryData.pageNumber ? QueryData.pageNumber : 1;
    const pageSize = QueryData.pageSize ? QueryData.pageSize : 10;

    let filter = {};

    if (searchNameTerm) {
      filter = {
        name: {
          $regex: searchNameTerm,
          $options: 'i',
        },
      };
    }

    const blogs = await this.blogModel
      .find(filter)
      .sort({ [sortBy]: sortDirection === 'desc' ? -1 : 1 })
      .skip((+pageNumber - 1) * +pageSize)
      .limit(+pageSize);

    const totalCount = await this.blogModel.countDocuments(filter);

    const pagesCount = Math.ceil(+totalCount / +pageSize);

    return {
      pagesCount: pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items: blogs.map(blogMapper),
    };
  }
  async getBlogById(id: string): Promise<BlogOutputModel | null> {
    const blog = await this.blogModel.findOne({ _id: new ObjectId(id) });

    if (!blog) {
      return null;
    } else {
      return blogMapper(blog);
    }
  }
}
