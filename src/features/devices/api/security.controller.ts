import { DevicesService } from '../application/devices.service';
import { DevicesQueryRepository } from '../infrastrucure/devices.query-repository';
import { Controller, Delete, Get, HttpCode, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { HTTP_STATUSES } from '../../../utils';
import { ObjectIdPipe } from '../../../common/pipes/object-id.pipe';

@Controller('security')
export class DevicesController {
  constructor(
    protected devicesService: DevicesService,
    protected devicesQueryRepository: DevicesQueryRepository,
  ) {}

  @Get('devices')
  async getAllDevicesSessionsForUser(@Req() req: Request) {
    const userId = req.userId!;

    const devicesSessions =
      await this.devicesQueryRepository.getAllDevicesSessionsForUser(userId);

    return devicesSessions;
  }
  @Delete('devices')
  @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
  async terminateSessionsForAllOthersDevices(@Req() req: Request) {
    const userId = req.userId!;
    const deviceId = req.deviceId!;

    const isTerminateDevicesSessions =
      await this.devicesService.terminateAllOthersDevicesSessions(
        userId,
        deviceId,
      );

    if (isTerminateDevicesSessions) return;
  }
  @Delete('devices/:id')
  @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
  async terminateSessionForDevice(@Param('id', ObjectIdPipe) deviceId: string) {
    const isTerminateDeviceSessionById =
      await this.devicesService.terminateDeviceSessionById(deviceId);

    if (isTerminateDeviceSessionById) return;
  }
}
