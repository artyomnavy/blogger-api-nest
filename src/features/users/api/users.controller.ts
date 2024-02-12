import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { CreateUserModel } from './models/user.input.model';
import { PaginatorModel } from '../../../common/models/paginator.input.model';
import { PaginatorOutputModel } from '../../../common/models/paginator.output.model';
import { UserOutputModel } from './models/user.output.model';
import { HTTP_STATUSES } from '../../../utils';
import { ObjectIdPipe } from '../../../common/pipes/objectId.pipe';
import { AuthBasicGuard } from '../../../common/guards/auth-basic.guard';

@Controller('users')
export class UsersController {
  constructor(
    protected usersService: UsersService,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}
  @Get()
  @UseGuards(AuthBasicGuard)
  async getAllUsers(
    @Query() query: PaginatorModel,
  ): Promise<PaginatorOutputModel<UserOutputModel>> {
    const users = await this.usersQueryRepository.getAllUsers(query);

    return users;
  }
  @Post()
  @UseGuards(AuthBasicGuard)
  @HttpCode(HTTP_STATUSES.CREATED_201)
  async createUserByAdmin(
    @Body() createModel: CreateUserModel,
  ): Promise<UserOutputModel> {
    const newUser = await this.usersService.createUserByAdmin(createModel);

    return newUser;
  }
  @Delete(':id')
  @UseGuards(AuthBasicGuard)
  @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
  async deleteUser(@Param('id', ObjectIdPipe) userId: string) {
    const isDeleted = await this.usersService.deleteUser(userId);

    if (isDeleted) {
      return;
    } else {
      throw new NotFoundException('User not found');
    }
  }
}
