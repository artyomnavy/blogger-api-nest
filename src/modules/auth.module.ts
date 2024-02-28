import { PassportModule } from '@nestjs/passport';
import { Module } from '@nestjs/common';
import { LocalStrategy } from '../features/auth/api/strategies/local.strategy';
import { UsersModule } from './users.module';
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
import { AddAttemptUseCase } from '../features/auth/application/use-cases/add-attempt-ip.use-case';

const servicesProviders = [JwtService];

const authUseCases = [
  UpdatePasswordForRecoveryUseCase,
  SendEmailForPasswordRecoveryUseCase,
  ResendingEmailUseCase,
  CreateUserByRegistrationUseCase,
  ConfirmEmailUseCase,
  CheckCredentialsUseCase,
  AddAttemptUseCase,
];

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
    CqrsModule,
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '10s' },
    }),
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
