import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Buffer } from 'node:buffer';

const login = process.env.BASIC_AUTH_LOGIN || 'admin';
const password = process.env.BASIC_AUTH_PASSWORD || 'qwerty';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();

    const auth = req.headers['authorization'];

    if (!auth) {
      throw new UnauthorizedException();
    }

    const [basic, token] = auth.split(' ');

    if (basic !== 'Basic') {
      throw new UnauthorizedException();
    }

    const decodedData = Buffer.from(token, 'base64').toString();

    const [decodedLogin, decodedPassword] = decodedData.split(':');

    if (decodedLogin !== login || decodedPassword !== password) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
