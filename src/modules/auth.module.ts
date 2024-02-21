import { PassportModule } from '@nestjs/passport';
import { Module } from '@nestjs/common';
import { LocalStrategy } from '../features/auth/api/strategies/local.strategy';
import { UsersModule } from './users.module';
import { AuthService } from '../features/auth/application/auth.service';
import { AttemptsRepository } from '../features/auth/infrastructure/attempts.repository';
import { EmailsManager } from '../managers/emails-manager';
import { EmailsAdapter } from '../adapters/emails-adapter';
import { MongooseModule } from '@nestjs/mongoose';
import { Attempt, AttemptEntity } from '../features/auth/domain/attempt.entity';
import { AuthController } from '../features/auth/api/auth.controller';
import { AttemptsQueryRepository } from '../features/auth/infrastructure/attempts.query-repository';
import { UsersQueryRepository } from '../features/users/infrastructure/users.query-repository';
import { User, UserEntity } from '../features/users/domain/user.entity';
import { JwtService } from '../application/jwt.service';
import { DevicesQueryRepository } from '../features/devices/infrastrucure/devices.query-repository';
import {
  DeviceSession,
  DeviceSessionEntity,
} from '../features/devices/domain/device.entity';
import { DevicesService } from '../features/devices/application/devices.service';
import { DevicesRepository } from '../features/devices/infrastrucure/devices.repository';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../features/auth/api/strategies/jwt.strategy';
import { BasicStrategy } from '../features/auth/api/strategies/basic.strategy';
import { jwtSecret } from '../features/auth/api/auth.constants';

const servicesProviders = [AuthService, JwtService, DevicesService];

const repositoriesProviders = [AttemptsRepository, DevicesRepository];

const queryRepositoriesProviders = [
  AttemptsQueryRepository,
  UsersQueryRepository,
  DevicesQueryRepository,
];

const emailsProviders = [EmailsManager, EmailsAdapter];

const strategiesProviders = [LocalStrategy, JwtStrategy, BasicStrategy];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attempt.name, schema: AttemptEntity },
      { name: User.name, schema: UserEntity },
      { name: DeviceSession.name, schema: DeviceSessionEntity },
    ]),
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '10m' },
    }),
  ],
  providers: [
    ...servicesProviders,
    ...repositoriesProviders,
    ...queryRepositoriesProviders,
    ...emailsProviders,
    ...strategiesProviders,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
