import { Injectable } from '@nestjs/common';
import {
  commentMapper,
  CommentOutputModel,
  PaginatorCommentOutputModel,
} from '../api/models/comment.output.model';
import { PaginatorCommentModel } from '../api/models/comment.input.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Comment, CommentDocument } from '../domain/comment.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}
  async getCommentById(commentId: string): Promise<CommentOutputModel | null> {
    const comment = await this.commentModel.findOne({
      _id: new ObjectId(commentId),
    });

    if (!comment) {
      return null;
    } else {
      return commentMapper(comment);
    }
  }
  async getCommentsByPostId(
    QueryData: PaginatorCommentModel & { postId: string },
  ): Promise<PaginatorCommentOutputModel> {
    const pageNumber = QueryData.pageNumber ? QueryData.pageNumber : 1;
    const pageSize = QueryData.pageSize ? QueryData.pageSize : 10;
    const sortBy = QueryData.sortBy ? QueryData.sortBy : 'createdAt';
    const sortDirection = QueryData.sortDirection
      ? QueryData.sortDirection
      : 'desc';
    const postId = QueryData.postId;

    const filter = {
      postId: postId,
    };

    const comments = await this.commentModel
      .find(filter)
      .sort({ [sortBy]: sortDirection === 'desc' ? -1 : 1 })
      .skip((+pageNumber - 1) * +pageSize)
      .limit(+pageSize);

    const totalCount = await this.commentModel.countDocuments(filter);
    const pagesCount = Math.ceil(+totalCount / +pageSize);

    return {
      pagesCount: pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items: comments.map(commentMapper),
    };
  }
}
