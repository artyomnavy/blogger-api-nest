import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { CreateUserModel, PaginatorUserModel } from './models/user.input.model';
import { PaginatorUserOutputModel } from './models/user.output.model';

@Controller('users')
export class UsersController {
  constructor(
    protected usersService: UsersService,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}
  @Get()
  async getAllUsers(
    @Query() query: PaginatorUserModel,
  ): Promise<PaginatorUserOutputModel> {
    const {
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
      searchLoginTerm,
      searchEmailTerm,
    } = query;

    const users = await this.usersQueryRepository.getAllUsers({
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
      searchLoginTerm,
      searchEmailTerm,
    });

    return users;
  }
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUserByAdmin(@Body() createModel: CreateUserModel) {
    const { login, password, email } = createModel;

    const newUser = await this.usersService.createUserByAdmin({
      login,
      password,
      email,
    });

    return newUser;
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') userId: string) {
    const isDeleted = await this.usersService.deleteUser(userId);

    if (isDeleted) {
      return;
    } else {
      throw new NotFoundException('User not found');
    }
  }
}
