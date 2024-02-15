import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '../../application/jwt.service';

@Injectable()
export class BearerAuthGuard implements CanActivate {
  constructor(protected jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const auth = req.headers.authorization;

    if (!auth) throw new UnauthorizedException();

    const accessToken = auth.split(' ')[1];

    const payloadToken = await this.jwtService.checkToken(accessToken);

    if (payloadToken) {
      req.userId = payloadToken.userId;
      return true;
    }

    throw new UnauthorizedException();
  }
}
