import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../../application/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(
    loginOrEmail: string,
    password: string,
  ): Promise<{ userId: string }> {
    const user = await this.authService.checkCredentials({
      loginOrEmail,
      password,
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return { userId: user._id.toString() };
  }
}
