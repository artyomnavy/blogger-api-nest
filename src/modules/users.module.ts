import { Module } from '@nestjs/common';
import { UsersRepository } from '../features/users/infrastructure/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserEntity } from '../features/users/domain/user.entity';
import { UsersQueryRepository } from '../features/users/infrastructure/users.query-repository';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserEntity }]),
    CqrsModule,
  ],
  providers: [UsersRepository, UsersQueryRepository],
  exports: [UsersRepository, UsersQueryRepository],
})
export class UsersModule {}
