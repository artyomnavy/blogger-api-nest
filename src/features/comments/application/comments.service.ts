import { Injectable } from '@nestjs/common';
import { likesStatuses } from '../../../utils';
import { ObjectId } from 'mongodb';
import {
  CommentOutputModel,
  Comment,
} from '../api/models/comment.output.model';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { LikesRepository } from '../../likes/infrastructure/likes.repository';
import { CreateAndUpdateCommentModel } from '../api/models/comment.input.model';

@Injectable()
export class CommentsService {
  constructor(
    protected commentsRepository: CommentsRepository,
    protected likesRepository: LikesRepository,
  ) {}
  async createComment(
    postId: string,
    userId: string,
    userLogin: string,
    content: string,
  ): Promise<CommentOutputModel> {
    const newComment = new Comment(
      new ObjectId(),
      content,
      {
        userId: userId,
        userLogin: userLogin,
      },
      new Date(),
      postId,
      {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: likesStatuses.none,
      },
    );

    const createdComment =
      await this.commentsRepository.createComment(newComment);

    return createdComment;
  }
  async updateComment(
    id: string,
    updateData: CreateAndUpdateCommentModel,
  ): Promise<boolean> {
    return await this.commentsRepository.updateComment(id, updateData);
  }
  async changeLikeStatusCommentForUser(
    userId: string,
    comment: CommentOutputModel,
    likeStatus: string,
  ): Promise<boolean> {
    const currentMyStatus = comment.likesInfo.myStatus;
    let likesCount = comment.likesInfo.likesCount;
    let dislikesCount = comment.likesInfo.dislikesCount;

    if (likeStatus === currentMyStatus) {
      return true;
    }

    const newLike = {
      commentIdOrPostId: comment.id,
      userId: userId,
      status: likeStatus,
      addedAt: new Date(),
    };

    if (currentMyStatus === likesStatuses.none) {
      await this.likesRepository.createLike(newLike);
    } else if (likeStatus === likesStatuses.none) {
      await this.likesRepository.deleteLike(comment.id, userId);
    } else {
      await this.likesRepository.updateLike(newLike);
    }

    if (
      likeStatus === likesStatuses.none &&
      currentMyStatus === likesStatuses.like
    ) {
      likesCount--;
    }

    if (
      likeStatus === likesStatuses.like &&
      currentMyStatus === likesStatuses.none
    ) {
      likesCount++;
    }

    if (
      likeStatus === likesStatuses.none &&
      currentMyStatus === likesStatuses.dislike
    ) {
      dislikesCount--;
    }

    if (
      likeStatus === likesStatuses.dislike &&
      currentMyStatus === likesStatuses.none
    ) {
      dislikesCount++;
    }

    if (
      likeStatus === likesStatuses.like &&
      currentMyStatus === likesStatuses.dislike
    ) {
      likesCount++;
      dislikesCount--;
    }

    if (
      likeStatus === likesStatuses.dislike &&
      currentMyStatus === likesStatuses.like
    ) {
      likesCount--;
      dislikesCount++;
    }

    return await this.commentsRepository.changeLikeStatusCommentForUser(
      comment.id,
      likesCount,
      dislikesCount,
    );
  }
  async deleteComment(id: string): Promise<boolean> {
    return this.commentsRepository.deleteComment(id);
  }
}
