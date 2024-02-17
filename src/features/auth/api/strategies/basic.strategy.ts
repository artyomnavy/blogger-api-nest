import { Injectable, UnauthorizedException } from '@nestjs/common';
import { BasicStrategy as Strategy } from 'passport-http';
import { PassportStrategy } from '@nestjs/passport';

const login = process.env.BASIC_AUTH_LOGIN || 'admin';
const pass = process.env.BASIC_AUTH_PASSWORD || 'qwerty';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super();
  }

  public validate = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    if (login === username && pass === password) {
      return true;
    }
    throw new UnauthorizedException();
  };
}
