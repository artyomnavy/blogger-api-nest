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
    public createdAt: Date,
    public extendedLikesInfo: {
      likesCount: number;
      dislikesCount: number;
      myStatus: string;
      newestLikes: {
        addedAt: Date;
        userId: string;
        login: string;
      }[];
    },
  ) {}
}

export class NewestLikesModel {
  addedAt: Date;
  userId: string;
  login: string;
}

export class NewestLikesOutputModel {
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
    newestLikes: NewestLikesOutputModel[];
  };
}

export class PostModel {
  _id: ObjectId;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
    newestLikes: NewestLikesModel[];
  };
}
export const postMapper = (post: PostDocument): PostOutputModel => {
  return {
    id: post._id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt.toISOString(),
    extendedLikesInfo: {
      likesCount: post.extendedLikesInfo.likesCount,
      dislikesCount: post.extendedLikesInfo.dislikesCount,
      myStatus: post.extendedLikesInfo.myStatus,
      newestLikes: post.extendedLikesInfo.newestLikes.map((like) => {
        return {
          addedAt: like.addedAt.toISOString(),
          userId: like.userId,
          login: like.login,
        };
      }),
    },
  };
};
