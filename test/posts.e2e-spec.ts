import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PostOutputModel } from '../src/features/posts/api/models/post.output.model';
import { BlogOutputModel } from '../src/features/blogs/api/models/blog.output.model';
import { HTTP_STATUSES, likesStatuses } from '../src/utils';
import { appSettings } from '../src/app.settings';
import { badId, Paths, responseNullData } from './utils/test-constants';
import { CreateEntitiesTestManager } from './utils/test-manager';
import {
  basicLogin,
  basicPassword,
} from '../src/features/auth/api/auth.constants';

describe('Posts testing (e2e)', () => {
  let app: INestApplication;
  let server;
  let createEntitiesTestManager: CreateEntitiesTestManager;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSettings(app);
    await app.init();

    server = app.getHttpServer();

    createEntitiesTestManager = new CreateEntitiesTestManager(app);

    await request(server)
      .delete(`${Paths.testing}/all-data`)
      .expect(HTTP_STATUSES.NO_CONTENT_204);
  });

  let newPost: PostOutputModel | null = null;
  let newBlog: BlogOutputModel | null = null;

  it('+ GET all posts database', async () => {
    const foundPosts = await request(server)
      .get(Paths.posts)
      .expect(HTTP_STATUSES.OK_200);

    expect(foundPosts.body).toStrictEqual(responseNullData);
  });

  it('- POST does not create post with incorrect login and password)', async () => {
    const createData = {
      title: 'new title',
      shortDescription: 'new shortDescription',
      content: 'new content',
      blogId: `${badId}`,
    };

    await createEntitiesTestManager.createPost(
      Paths.posts,
      createData,
      'wrongLogin',
      'wrongpass',
      HTTP_STATUSES.UNAUTHORIZED_401,
    );

    const foundPosts = await request(server)
      .get(Paths.posts)
      .expect(HTTP_STATUSES.OK_200);

    expect(foundPosts.body).toStrictEqual(responseNullData);
  });

  it('- POST does not create post with incorrect title, shortDescription, content and blogId)', async () => {
    const createData = {
      title: '',
      shortDescription: '',
      content: '',
      blogId: `1`,
    };

    const errorsCreatePost = await createEntitiesTestManager.createPost(
      Paths.posts,
      createData,
      basicLogin,
      basicPassword,
      HTTP_STATUSES.BAD_REQUEST_400,
    );

    expect(errorsCreatePost.body).toStrictEqual({
      errorsMessages: [
        { message: expect.any(String), field: 'title' },
        { message: expect.any(String), field: 'shortDescription' },
        { message: expect.any(String), field: 'content' },
        { message: expect.any(String), field: 'blogId' },
      ],
    });

    const foundPosts = await request(server)
      .get(Paths.posts)
      .expect(HTTP_STATUSES.OK_200);

    expect(foundPosts.body).toStrictEqual(responseNullData);
  });

  it('+ POST create blog with correct data)', async () => {
    const createData = {
      name: 'New blog 1',
      description: 'New description 1',
      websiteUrl: 'https://website1.com',
    };

    const createBlog = await createEntitiesTestManager.createBlog(
      Paths.blogs,
      createData,
      basicLogin,
      basicPassword,
    );

    newBlog = createBlog.body;

    expect(newBlog).toEqual({
      id: expect.any(String),
      name: createData.name,
      description: createData.description,
      websiteUrl: createData.websiteUrl,
      createdAt: expect.any(String),
      isMembership: false,
    });

    const foundBlogs = await request(server)
      .get(Paths.blogs)
      .expect(HTTP_STATUSES.OK_200);

    expect(foundBlogs.body).toStrictEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [newBlog],
    });
  });

  it('+ POST create post with correct data)', async () => {
    const createData = {
      title: 'New post 1',
      shortDescription: 'New shortDescription 1',
      content: 'New content 1',
      blogId: newBlog!.id,
    };

    const createPost = await createEntitiesTestManager.createPost(
      Paths.posts,
      createData,
      basicLogin,
      basicPassword,
    );

    newPost = createPost.body;

    expect(newPost).toEqual({
      id: expect.any(String),
      title: createData.title,
      shortDescription: createData.shortDescription,
      content: createData.content,
      blogId: createData.blogId,
      blogName: expect.any(String),
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: likesStatuses.none,
        newestLikes: [],
      },
    });

    const foundPosts = await request(server)
      .get(Paths.posts)
      .expect(HTTP_STATUSES.OK_200);

    expect(foundPosts.body).toStrictEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [newPost],
    });
  });

  it('- GET post by ID with incorrect id', async () => {
    await request(server)
      .get(`${Paths.posts}/${badId}`)
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it('+ GET post by ID with correct id', async () => {
    const foundPost = await request(server)
      .get(`${Paths.posts}/${newPost!.id}`)
      .expect(HTTP_STATUSES.OK_200);

    expect(foundPost.body).toStrictEqual(newPost);
  });

  it('- PUT post by ID with incorrect id', async () => {
    const updateData = {
      title: 'Bad title',
      shortDescription: 'Bad shortDescription',
      content: 'Bad content',
      blogId: newBlog!.id,
    };

    await request(server)
      .put(`${Paths.posts}/${badId}`)
      .auth(basicLogin, basicPassword)
      .send(updateData)
      .expect(HTTP_STATUSES.NOT_FOUND_404);

    const foundPosts = await request(server)
      .get(Paths.posts)
      .expect(HTTP_STATUSES.OK_200);

    expect(foundPosts.body).toStrictEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [newPost],
    });
  });

  it('- PUT post by ID with incorrect data', async () => {
    const updateData = {
      title: '',
      shortDescription: '',
      content: '',
      blogId: '',
    };

    const errorsUpdatePost = await request(server)
      .put(`${Paths.posts}/${newPost!.id}`)
      .auth(basicLogin, basicPassword)
      .send(updateData)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(errorsUpdatePost.body).toStrictEqual({
      errorsMessages: [
        { message: expect.any(String), field: 'title' },
        { message: expect.any(String), field: 'shortDescription' },
        { message: expect.any(String), field: 'content' },
        { message: expect.any(String), field: 'blogId' },
      ],
    });

    const foundPosts = await request(server)
      .get(Paths.posts)
      .expect(HTTP_STATUSES.OK_200);

    expect(foundPosts.body).toStrictEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [newPost],
    });
  });

  it('+ PUT post by ID with correct data', async () => {
    const updateData = {
      title: 'New post 2',
      shortDescription: 'New shortDescription 2',
      content: 'New content 2',
      blogId: newBlog!.id,
    };

    await request(server)
      .put(`${Paths.posts}/${newPost!.id}`)
      .auth(basicLogin, basicPassword)
      .send(updateData)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    const foundPosts = await request(server)
      .get(Paths.posts)
      .expect(HTTP_STATUSES.OK_200);

    expect(foundPosts.body.items[0]).toEqual({
      ...newPost,
      title: updateData.title,
      shortDescription: updateData.shortDescription,
      content: updateData.content,
    });
    newPost = foundPosts.body.items[0];
  });

  it('- DELETE post by ID with incorrect id', async () => {
    await request(server)
      .delete(`${Paths.posts}/${badId}`)
      .auth(basicLogin, basicPassword)
      .expect(HTTP_STATUSES.NOT_FOUND_404);

    const foundPosts = await request(server)
      .get(Paths.posts)
      .expect(HTTP_STATUSES.OK_200);

    expect(foundPosts.body).toStrictEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [newPost],
    });
  });

  it('+ DELETE post by ID with correct id', async () => {
    await request(server)
      .delete(`${Paths.posts}/${newPost!.id}`)
      .auth(basicLogin, basicPassword)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    const foundPosts = await request(server)
      .get(Paths.posts)
      .expect(HTTP_STATUSES.OK_200);

    expect(foundPosts.body).toStrictEqual(responseNullData);
  });

  afterAll(async () => {
    await request(server)
      .delete(`${Paths.testing}/all-data`)
      .expect(HTTP_STATUSES.NO_CONTENT_204);
    await server.close();
  });
});
