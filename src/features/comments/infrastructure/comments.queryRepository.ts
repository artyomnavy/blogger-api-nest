import { Injectable } from '@nestjs/common';
import {
  commentMapper,
  CommentOutputModel,
} from '../api/models/comment.output.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Comment, CommentDocument } from '../domain/comment.entity';
import { PaginatorModel } from '../../../common/models/paginator.input.model';
import { PaginatorOutputModel } from '../../../common/models/paginator.output.model';

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
    queryData: PaginatorModel & { postId: string },
  ): Promise<PaginatorOutputModel<CommentOutputModel>> {
    const pageNumber = queryData.pageNumber ? queryData.pageNumber : 1;
    const pageSize = queryData.pageSize ? queryData.pageSize : 10;
    const sortBy = queryData.sortBy ? queryData.sortBy : 'createdAt';
    const sortDirection = queryData.sortDirection
      ? queryData.sortDirection
      : 'desc';
    const postId = queryData.postId;

    const filter = {
      postId: postId,
    };

    const comments = await this.commentModel
      .find(filter)
      .sort({
        [sortBy]: sortDirection === 'desc' ? -1 : 1,
      })
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
