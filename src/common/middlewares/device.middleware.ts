import {
  ForbiddenException,
  Injectable,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { DevicesQueryRepository } from '../../features/devices/infrastrucure/devices.query-repository';

@Injectable()
export class DeviceMiddleware implements NestMiddleware {
  constructor(
    private readonly devicesQueryRepository: DevicesQueryRepository,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const deviceId = req.params.id;
    const userId = req.userId;

    const deviceSession =
      await this.devicesQueryRepository.getDeviceSessionById(deviceId);

    if (!deviceSession) throw new NotFoundException('Device session not found');

    if (userId !== deviceSession.userId)
      throw new ForbiddenException("Device session other user's");

    next();
  }
}
