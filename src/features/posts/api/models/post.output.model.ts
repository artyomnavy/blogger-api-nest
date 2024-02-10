import { ObjectId } from 'mongodb';
import { PostDocument } from '../../domain/post.entity';

export class Post {
  constructor(
    public _id: ObjectId,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: string,
    public extendedLikesInfo: {
      likesCount: number;
      dislikesCount: number;
      myStatus: string;
      newestLikes: {
        addedAt: string;
        userId: string;
        login: string;
      }[];
    },
  ) {}
}

export class NewestLikesModel {
  addedAt: string;
  userId: string;
  login: string;
}

export class PostOutputModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
    newestLikes: NewestLikesModel[];
  };
}

export class PostModel {
  _id: ObjectId;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
    newestLikes: NewestLikesModel[];
  };
}
export class PaginatorPostOutputModel {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: PostOutputModel[];
}

export const postMapper = (post: PostDocument): PostOutputModel => {
  const postOutputModel = new PostOutputModel();

  postOutputModel.id = post._id.toString();
  postOutputModel.title = post.title;
  postOutputModel.shortDescription = post.shortDescription;
  postOutputModel.content = post.content;
  postOutputModel.blogId = post.blogId;
  postOutputModel.blogName = post.blogName;
  postOutputModel.createdAt = post.createdAt;
  postOutputModel.extendedLikesInfo.likesCount =
    post.extendedLikesInfo.likesCount;
  postOutputModel.extendedLikesInfo.dislikesCount =
    post.extendedLikesInfo.dislikesCount;
  postOutputModel.extendedLikesInfo.myStatus = post.extendedLikesInfo.myStatus;
  postOutputModel.extendedLikesInfo.newestLikes =
    post.extendedLikesInfo.newestLikes;

  return postOutputModel;
};
