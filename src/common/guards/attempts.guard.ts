import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { sub } from 'date-fns';
import { AttemptsQueryRepository } from '../../features/auth/infrastructure/attempts.query-repository';
import { AuthService } from '../../features/auth/application/auth.service';
import { HTTP_STATUSES } from '../../utils';
import { AttemptModel } from '../../features/auth/api/models/attempt.model';

@Injectable()
export class AttemptsGuard implements CanActivate {
  constructor(
    protected attemptsQueryRepository: AttemptsQueryRepository,
    protected authService: AuthService,
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

    await this.authService.addAttempt(attempt);

    return true;
  }
}
