import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { HTTP_STATUSES, likesStatuses } from '../src/utils';
import { BlogOutputModel } from '../src/features/blogs/api/models/blog.output.model';
import { PostOutputModel } from '../src/features/posts/api/models/post.output.model';
import { appSettings } from '../src/app.settings';
import { badId, Paths, responseNullData } from './test-utils';
import { entitiesTestManager } from './test-manager';

describe('Comments testing (e2e)', () => {
  let app: INestApplication;
  let server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSettings(app);
    await app.init();

    server = app.getHttpServer();

    await request(server)
      .delete(`${Paths.testing}/all-data`)
      .expect(HTTP_STATUSES.NO_CONTENT_204);
  });

  let newPost: PostOutputModel | null = null;
  let newBlog: BlogOutputModel | null = null;

  // CREATE NEW BLOG
  it('+ POST create blog with correct data)', async () => {
    const createData = {
      name: 'New blog 1',
      description: 'New description 1',
      websiteUrl: 'https://website1.com',
    };

    const createBlog = await entitiesTestManager.createBlog(
      Paths.blogs,
      createData,
      server,
    );

    newBlog = createBlog.body;

    expect(newBlog).toEqual({
      id: expect.any(String),
      name: 'New blog 1',
      description: 'New description 1',
      websiteUrl: 'https://website1.com',
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

  // CREATE NEW POST
  it('+ POST create post with correct data)', async () => {
    const createData = {
      title: 'New post 1',
      shortDescription: 'New shortDescription 1',
      content: 'New content 1',
      blogId: newBlog!.id,
    };

    const createPost = await entitiesTestManager.createPost(
      Paths.posts,
      createData,
      server,
    );

    newPost = createPost.body;

    expect(newPost).toEqual({
      id: expect.any(String),
      title: 'New post 1',
      shortDescription: 'New shortDescription 1',
      content: 'New content 1',
      blogId: expect.any(String),
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

  // CHECK GET COMMENTS FOR POST
  it('- GET comments with incorrect postId', async () => {
    await request(server)
      .get(`${Paths.posts}/${badId}/comments`)
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it('+ GET comments with correct postId', async () => {
    const foundComments = await request(server)
      .get(`${Paths.posts}/${newPost!.id}/comments`)
      .expect(HTTP_STATUSES.OK_200);

    expect(foundComments.body).toStrictEqual(responseNullData);
  });

  it('- GET comment by incorrect id', async () => {
    await request(server)
      .get(`${Paths.comments}/${badId}`)
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  afterAll(async () => {
    await request(server)
      .delete(`${Paths.testing}/all-data`)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await server.close();
  });
});
