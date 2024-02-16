import { CreateAndUpdatePostModel } from '../api/models/post.input.model';
import { Post, PostOutputModel } from '../api/models/post.output.model';
import { BlogsQueryRepository } from '../../blogs/infrastructure/blogs.query-repository';
import { PostsRepository } from '../infrastructure/posts.repository';
import { ObjectId } from 'mongodb';
import { likesStatuses } from '../../../utils';
import { Injectable } from '@nestjs/common';
import { LikesRepository } from '../../likes/infrastructure/likes.repository';
@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected likesRepository: LikesRepository,
  ) {}
  async createPost(
    createData: CreateAndUpdatePostModel,
  ): Promise<PostOutputModel> {
    const blog = await this.blogsQueryRepository.getBlogById(
      createData.blogId!,
    );

    const newPost = new Post(
      new ObjectId(),
      createData.title,
      createData.shortDescription,
      createData.content,
      createData.blogId!,
      blog!.name,
      new Date(),
      {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: likesStatuses.none,
        newestLikes: [],
      },
    );

    const createdPost = await this.postsRepository.createPost(newPost);

    return createdPost;
  }
  async updatePost(
    id: string,
    updateData: CreateAndUpdatePostModel,
  ): Promise<boolean> {
    return await this.postsRepository.updatePost(id, updateData);
  }
  async changeLikeStatusPostForUser(
    userId: string,
    post: PostOutputModel,
    likeStatus: string,
  ): Promise<boolean> {
    const currentMyStatus = post.extendedLikesInfo.myStatus;
    let likesCount = post.extendedLikesInfo.likesCount;
    let dislikesCount = post.extendedLikesInfo.dislikesCount;

    if (likeStatus === currentMyStatus) {
      return true;
    }

    const newLike = {
      commentIdOrPostId: post.id,
      userId: userId,
      status: likeStatus,
      addedAt: new Date(),
    };

    if (currentMyStatus === likesStatuses.none) {
      await this.likesRepository.createLike(newLike);
    } else if (likeStatus === likesStatuses.none) {
      await this.likesRepository.deleteLike(post.id, userId);
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

    return await this.postsRepository.changeLikeStatusPostForUser(
      post.id,
      likesCount,
      dislikesCount,
    );
  }
  async deletePost(id: string): Promise<boolean> {
    return this.postsRepository.deletePost(id);
  }
}
