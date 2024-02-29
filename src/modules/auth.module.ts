import { PassportModule } from '@nestjs/passport';
import { Module } from '@nestjs/common';
import { LocalStrategy } from '../features/auth/api/strategies/local.strategy';
import { UsersModule } from './users.module';
import { EmailsManager } from '../managers/emails-manager';
import { EmailsAdapter } from '../adapters/emails-adapter';
import { MongooseModule } from '@nestjs/mongoose';
import { Attempt, AttemptEntity } from '../features/auth/domain/attempt.entity';
import { AuthController } from '../features/auth/api/auth.controller';
import { UsersQueryRepository } from '../features/users/infrastructure/users.query-repository';
import { User, UserEntity } from '../features/users/domain/user.entity';
import { JwtService } from '../application/jwt.service';
import { DevicesQueryRepository } from '../features/devices/infrastrucure/devices.query-repository';
import {
  DeviceSession,
  DeviceSessionEntity,
} from '../features/devices/domain/device.entity';
import { DevicesRepository } from '../features/devices/infrastrucure/devices.repository';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../features/auth/api/strategies/jwt.strategy';
import { BasicStrategy } from '../features/auth/api/strategies/basic.strategy';
import { jwtSecret } from '../features/auth/api/auth.constants';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdatePasswordForRecoveryUseCase } from '../features/auth/application/use-cases/update-password-for-recovery-user.use-case';
import { SendEmailForPasswordRecoveryUseCase } from '../features/auth/application/use-cases/send-email-for-password-recovery-user.use-case';
import { ResendingEmailUseCase } from '../features/auth/application/use-cases/re-sending-email-user.use-case';
import { CreateUserByRegistrationUseCase } from '../features/auth/application/use-cases/create-user-by-registration.use-case';
import { ConfirmEmailUseCase } from '../features/auth/application/use-cases/confirm-email-user.use-case';
import { CheckCredentialsUseCase } from '../features/auth/application/use-cases/check-credentials-user.use-case';
import { ThrottlerModule } from '@nestjs/throttler';

const servicesProviders = [JwtService];

const authUseCases = [
  UpdatePasswordForRecoveryUseCase,
  SendEmailForPasswordRecoveryUseCase,
  ResendingEmailUseCase,
  CreateUserByRegistrationUseCase,
  ConfirmEmailUseCase,
  CheckCredentialsUseCase,
];

const repositoriesProviders = [DevicesRepository];

const queryRepositoriesProviders = [
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
    CqrsModule,
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '10s' },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
  ],
  providers: [
    ...authUseCases,
    ...servicesProviders,
    ...repositoriesProviders,
    ...queryRepositoriesProviders,
    ...emailsProviders,
    ...strategiesProviders,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
