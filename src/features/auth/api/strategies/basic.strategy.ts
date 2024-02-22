import { Injectable, UnauthorizedException } from '@nestjs/common';
import { BasicStrategy as Strategy } from 'passport-http';
import { PassportStrategy } from '@nestjs/passport';
import { basicLogin, basicPassword } from '../auth.constants';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super();
  }

  public validate = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    if (basicLogin === username && basicPassword === password) {
      console.log('authorized');
      return true;
    }
    console.log(username, password);
    throw new UnauthorizedException();
  };
}
