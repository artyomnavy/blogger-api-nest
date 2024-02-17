import { UsersService } from '../features/users/application/users.service';
import { Module } from '@nestjs/common';
import { UsersRepository } from '../features/users/infrastructure/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserEntity } from '../features/users/domain/user.entity';
import { UsersQueryRepository } from '../features/users/infrastructure/users.query-repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserEntity }]),
  ],
  providers: [UsersService, UsersRepository, UsersQueryRepository],
  exports: [UsersService, UsersRepository, UsersQueryRepository],
})
export class UsersModule {}
