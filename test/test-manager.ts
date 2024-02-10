import request from 'supertest';
import { HTTP_STATUSES, HttpStatusType } from '../src/utils';
import { CreateAndUpdateBlogModel } from '../src/features/blogs/api/models/blog.input.model';
import { CreateAndUpdatePostModel } from '../src/features/posts/api/models/post.input.model';
import { CreateUserModel } from '../src/features/users/api/models/user.input.model';

export const entitiesTestManager = {
  async createBlog(
    uri: string,
    createData: CreateAndUpdateBlogModel,
    server: any,
    statusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
  ) {
    const response = await request(server)
      .post(uri)
      .send(createData)
      .expect(statusCode);

    return response;
  },
  async createPostForBlog(
    uri: string,
    createData: CreateAndUpdatePostModel,
    server: any,
    statusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
  ) {
    const response = await request(server)
      .post(uri)
      .send(createData)
      .expect(statusCode);

    return response;
  },
  async createPost(
    uri: string,
    createData: CreateAndUpdatePostModel,
    server: any,
    statusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
  ) {
    const response = await request(server)
      .post(uri)
      .send(createData)
      .expect(statusCode);

    return response;
  },
  async createUserByAdmin(
    uri: string,
    createData: CreateUserModel,
    server: any,
    statusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
  ) {
    const response = await request(server)
      .post(uri)
      .send(createData)
      .expect(statusCode);

    return response;
  },
};
