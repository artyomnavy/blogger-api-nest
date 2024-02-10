import { CommentDocument } from '../../domain/comment.entity';

export class CommentOutputModel {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  };
}

export type PaginatorCommentOutputModel = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: CommentOutputModel[];
};

export const commentMapper = (comment: CommentDocument): CommentOutputModel => {
  const commentOutputModel = new CommentOutputModel();

  commentOutputModel.id = comment._id.toString();
  commentOutputModel.content = comment.content;
  commentOutputModel.commentatorInfo.userId = comment.commentatorInfo.userId;
  commentOutputModel.commentatorInfo.userLogin =
    comment.commentatorInfo.userLogin;
  commentOutputModel.createdAt = comment.createdAt;
  commentOutputModel.likesInfo.likesCount = comment.likesInfo.likesCount;
  commentOutputModel.likesInfo.dislikesCount = comment.likesInfo.dislikesCount;
  commentOutputModel.likesInfo.myStatus = comment.likesInfo.myStatus;

  return commentOutputModel;
};
