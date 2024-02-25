import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { sub } from 'date-fns';
import { AttemptsQueryRepository } from '../../features/auth/infrastructure/attempts.query-repository';
import { HTTP_STATUSES } from '../../utils';
import { AttemptModel } from '../../features/auth/api/models/attempt.model';
import { AddAttemptCommand } from '../../features/auth/application/use-cases/add-attempt-ip.use-case';
import { CommandBus } from '@nestjs/cqrs';

@Injectable()
export class AttemptsGuard implements CanActivate {
  constructor(
    private readonly attemptsQueryRepository: AttemptsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const limitDate = sub(new Date(), {
      seconds: 10,
    });

    const ip = req.ip! || 'unknown';
    const url = req.originalUrl;

    const amount = await this.attemptsQueryRepository.getAmountOfAttempts({
      ip,
      url,
      date: limitDate,
    });

    if (amount >= 5) {
      throw new HttpException(
        'Too Many Requests',
        HTTP_STATUSES.TOO_MANY_REQUESTS_429,
      );
    }

    const attempt: AttemptModel = {
      ip: ip,
      url: url,
      date: new Date(),
    };

    await this.commandBus.execute(new AddAttemptCommand(attempt));

    return true;
  }
}
