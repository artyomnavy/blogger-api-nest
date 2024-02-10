import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { HTTP_STATUSES } from '../src/utils';
import { UserOutputModel } from '../src/features/users/api/models/user.output.model';
import { appSettings } from '../src/app.settings';
import { badId, Paths, responseNullData } from './test-utils';
import { entitiesTestManager } from './test-manager';
describe('Users testing (e2e)', () => {
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

  let newUser: UserOutputModel | null = null;

  it('+ GET all users database', async () => {
    const foundusers = await request(server)
      .get(Paths.users)
      .query({
        sortBy: '',
        sortDirection: '',
        pageNumber: '',
        pageSize: '',
        searchLoginTerm: '',
        searchEmailTerm: '',
      })
      .expect(HTTP_STATUSES.OK_200);

    expect(foundusers.body).toStrictEqual(responseNullData);
  });

  it('- POST does not create user with incorrect data', async () => {
    const createData = {
      login: 'abcdefghijk',
      password: '12345',
      email: 'test$test.com',
    };

    await entitiesTestManager.createUserByAdmin(
      Paths.users,
      createData,
      server,
      HTTP_STATUSES.BAD_REQUEST_400,
    );

    const foundusers = await request(server)
      .get(Paths.users)
      .expect(HTTP_STATUSES.OK_200);

    expect(foundusers.body).toStrictEqual(responseNullData);
  });

  it('+ POST create user with correct data', async () => {
    const createData = {
      login: 'login',
      password: '123456',
      email: 'test@test.com',
    };

    const createUser = await entitiesTestManager.createUserByAdmin(
      Paths.users,
      createData,
      server,
    );

    newUser = createUser.body;

    expect(newUser).toEqual({
      id: expect.any(String),
      login: 'login',
      email: 'test@test.com',
      createdAt: expect.any(String),
    });

    const foundUsers = await request(server)
      .get(Paths.users)
      .expect(HTTP_STATUSES.OK_200);

    expect(foundUsers.body).toStrictEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [newUser],
    });
  });

  it('- DELETE user by ID with incorrect id', async () => {
    await request(server)
      .delete(`${Paths.users}/${badId}`)
      .expect(HTTP_STATUSES.NOT_FOUND_404);

    const foundUsers = await request(server)
      .get(Paths.users)
      .expect(HTTP_STATUSES.OK_200);

    expect(foundUsers.body).toStrictEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [newUser],
    });
  });

  it('+ DELETE user by ID with correct id', async () => {
    await request(server)
      .delete(`${Paths.users}/${newUser!.id}`)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    const foundUsers = await request(server)
      .get(Paths.users)
      .expect(HTTP_STATUSES.OK_200);

    expect(foundUsers.body).toStrictEqual(responseNullData);
  });

  afterAll(async () => {
    await request(server)
      .delete(`${Paths.testing}/all-data`)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await server.close();
  });
});
