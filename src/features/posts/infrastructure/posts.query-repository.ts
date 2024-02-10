import { Injectable } from '@nestjs/common';
import { PaginatorPostModel } from '../api/models/post.input.model';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../domain/post.entity';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
  PaginatorPostOutputModel,
  postMapper,
  PostOutputModel,
} from '../api/models/post.output.model';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}
  async getAllPosts(
    QueryData: PaginatorPostModel,
  ): Promise<PaginatorPostOutputModel> {
    const pageNumber = QueryData.pageNumber ? QueryData.pageNumber : 1;
    const pageSize = QueryData.pageSize ? QueryData.pageSize : 10;
    const sortBy = QueryData.sortBy ? QueryData.sortBy : 'createdAt';
    const sortDirection = QueryData.sortDirection
      ? QueryData.sortDirection
      : 'desc';

    const posts = await this.postModel
      .find({})
      .sort({ [sortBy]: sortDirection === 'desc' ? -1 : 1 })
      .skip((+pageNumber - 1) * +pageSize)
      .limit(+pageSize);

    const totalCount = await this.postModel.countDocuments({});
    const pagesCount = Math.ceil(+totalCount / +pageSize);

    return {
      pagesCount: pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items: posts.map(postMapper),
    };
  }

  async getPostById(postId: string): Promise<PostOutputModel | null> {
    const post = await this.postModel.findOne({
      _id: new ObjectId(postId),
    });

    if (!post) {
      return null;
    } else {
      return postMapper(post);
    }
  }

  async getPostsByBlogId(
    QueryData: PaginatorPostModel & {
      blogId: string;
    },
  ): Promise<PaginatorPostOutputModel> {
    const pageNumber = QueryData.pageNumber ? QueryData.pageNumber : 1;
    const pageSize = QueryData.pageSize ? QueryData.pageSize : 10;
    const sortBy = QueryData.sortBy ? QueryData.sortBy : 'createdAt';
    const sortDirection = QueryData.sortDirection
      ? QueryData.sortDirection
      : 'desc';
    const blogId = QueryData.blogId;

    const filter = {
      blogId: {
        $regex: blogId,
      },
    };

    const posts = await this.postModel
      .find(filter)
      .sort({ [sortBy]: sortDirection === 'desc' ? -1 : 1 })
      .skip((+pageNumber - 1) * +pageSize)
      .limit(+pageSize);

    const totalCount = await this.postModel.countDocuments(filter);
    const pagesCount = Math.ceil(+totalCount / +pageSize);

    return {
      pagesCount: pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items: posts.map(postMapper),
    };
  }
}
