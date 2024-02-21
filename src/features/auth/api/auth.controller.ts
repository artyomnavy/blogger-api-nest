import { AuthService } from '../application/auth.service';
import { UsersQueryRepository } from '../../users/infrastructure/users.query-repository';
import {
  Controller,
  HttpCode,
  Post,
  Body,
  Req,
  UseGuards,
  Res,
  HttpException,
  Get,
} from '@nestjs/common';
import { HTTP_STATUSES } from '../../../utils';
import {
  AuthLoginModel,
  ConfirmCodeModel,
  RegistrationEmailResendModel,
  NewPasswordRecoveryModel,
  PasswordRecoveryModel,
} from './models/auth.input.model';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AttemptsGuard } from '../../../common/guards/attempts.guard';
import { RecoveryPasswordAuthGuard } from '../../../common/guards/recovery-password-auth.guard';
import { RefreshTokenAuthGuard } from '../../../common/guards/refresh-token-auth.guard';
import { CreateUserModel } from '../../users/api/models/user.input.model';
import { DevicesService } from '../../devices/application/devices.service';
import { JwtService } from '../../../application/jwt.service';
import { LocalAuthGuard } from '../../../common/guards/local-auth.gurad';
import { JwtBearerAuthGuard } from '../../../common/guards/jwt-bearer-auth-guard.service';
import { CurrentUserId } from '../../../common/decorators/current-user-id.param.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    protected authService: AuthService,
    protected usersQueryRepository: UsersQueryRepository,
    protected devicesService: DevicesService,
    protected jwtService: JwtService,
  ) {}

  @Post('login')
  // @UseGuards(AttemptsGuard)
  @UseGuards(LocalAuthGuard)
  @HttpCode(HTTP_STATUSES.OK_200)
  async loginUser(
    @Body() authData: AuthLoginModel,
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const deviceId = uuidv4();
    const ip = req.ip! || 'unknown';
    const deviceName = req.headers['user-agent'] || 'unknown';

    const userId = req.user._id.toString();

    const accessToken = await this.jwtService.createAccessJWT(userId);

    const refreshToken = await this.jwtService.createRefreshJWT(
      deviceId,
      userId,
    );

    const payloadRefreshToken =
      await this.jwtService.getPayloadByToken(refreshToken);

    const iat = new Date(payloadRefreshToken.iat * 1000);
    const exp = new Date(payloadRefreshToken.exp * 1000);

    await this.devicesService.createDeviceSession({
      iat,
      exp,
      ip,
      deviceId,
      deviceName,
      userId,
    });

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    return { accessToken: accessToken };
  }

  @Post('password-recovery')
  // @UseGuards(AttemptsGuard)
  @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
  async sendEmailForRecoveryPassword(
    @Body() recoveryData: PasswordRecoveryModel,
  ) {
    const user = await this.usersQueryRepository.getUserByEmail(
      recoveryData.email,
    );

    if (!user) return;

    const newCode = await this.authService.updateConfirmationCode(
      recoveryData.email,
    );

    if (newCode) {
      const isSend = await this.authService.sendEmailForPasswordRecovery(
        recoveryData.email,
        newCode,
      );

      if (!isSend) {
        throw new HttpException(
          "Recovery code don't sending to passed email address, try later",
          HTTP_STATUSES.IM_A_TEAPOT_418,
        );
      }

      return;
    }
  }

  @Post('new-password')
  // @UseGuards(AttemptsGuard)
  @UseGuards(RecoveryPasswordAuthGuard)
  @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
  async changePasswordForRecovery(
    @Body() recoveryData: NewPasswordRecoveryModel,
  ) {
    const isUpdate = await this.authService.updatePasswordForRecovery(
      recoveryData.recoveryCode,
      recoveryData.newPassword,
    );

    if (isUpdate) return;
  }

  @Post('refresh-token')
  @UseGuards(RefreshTokenAuthGuard)
  @HttpCode(HTTP_STATUSES.OK_200)
  async getNewPairTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.userId!;
    const deviceId = req.deviceId!;

    const newIp = req.ip! || 'unknown';
    const newDeviceName = req.headers['user-agent'] || 'unknown';

    const newAccessToken = await this.jwtService.createAccessJWT(userId);

    const newRefreshToken = await this.jwtService.createRefreshJWT(
      deviceId,
      userId,
    );

    const newPayloadRefreshToken =
      await this.jwtService.getPayloadByToken(newRefreshToken);

    const newIat = new Date(newPayloadRefreshToken.iat * 1000);
    const newExp = new Date(newPayloadRefreshToken.exp * 1000);

    const isUpdateDeviceSession = await this.devicesService.updateDeviceSession(
      {
        iat: newIat,
        exp: newExp,
        ip: newIp,
        deviceId: deviceId,
        deviceName: newDeviceName,
        userId: userId,
      },
    );

    if (isUpdateDeviceSession) {
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
      });
      return { accessToken: newAccessToken };
    }
  }
  @Post('logout')
  @UseGuards(RefreshTokenAuthGuard)
  @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
  async logoutUser(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.userId!;
    const deviceId = req.deviceId!;

    const isTerminateDeviceSession =
      await this.devicesService.terminateDeviceSessionByLogout(
        deviceId,
        userId,
      );

    if (isTerminateDeviceSession) {
      res.clearCookie('refreshToken');
      return;
    }
  }
  @Post('registration')
  // @UseGuards(AttemptsGuard)
  @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
  async createUserByRegistration(@Body() createData: CreateUserModel) {
    const user = await this.authService.createUserByRegistration(createData);

    if (!user)
      throw new HttpException(
        "Recovery code don't sending to passed email address, try later",
        HTTP_STATUSES.IM_A_TEAPOT_418,
      );

    return;
  }
  @Post('registration-confirmation')
  // @UseGuards(AttemptsGuard)
  @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
  async sendEmailForConfirmRegistration(@Body() confirmData: ConfirmCodeModel) {
    await this.authService.confirmEmail(confirmData.code);

    return;
  }
  @Post('registration-email-resending')
  // @UseGuards(AttemptsGuard)
  @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
  async resendEmailForConfirmRegistration(
    @Body() confirmData: RegistrationEmailResendModel,
  ) {
    const newCode = await this.authService.updateConfirmationCode(
      confirmData.email,
    );

    if (newCode) {
      const isResend = await this.authService.resendingEmail(
        confirmData.email,
        newCode,
      );

      if (!isResend)
        throw new HttpException(
          "Recovery code don't sending to passed email address, try later",
          HTTP_STATUSES.IM_A_TEAPOT_418,
        );

      return;
    }
  }
  @Get('me')
  @UseGuards(JwtBearerAuthGuard)
  async getInfoAboutSelf(@CurrentUserId() currentUserId: string) {
    const authMe =
      await this.usersQueryRepository.getUserByIdForAuthMe(currentUserId);

    return authMe;
  }
}
