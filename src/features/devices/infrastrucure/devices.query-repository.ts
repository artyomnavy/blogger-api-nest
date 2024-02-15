import { DeviceSessionModel } from '../api/models/device.output.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeviceSession, DeviceSessionDocument } from '../domain/device.entity';
import { Model } from 'mongoose';
import { WithId } from 'mongodb';

@Injectable()
export class DevicesQueryRepository {
  constructor(
    @InjectModel(DeviceSession.name)
    private deviceModel: Model<DeviceSessionDocument>,
  ) {}
  async checkDeviceSession(
    userId: string,
    deviceId: string,
  ): Promise<WithId<DeviceSessionModel> | null> {
    const deviceSession: WithId<DeviceSessionModel> | null =
      await this.deviceModel.findOne({
        userId: userId,
        deviceId: deviceId,
      });

    if (deviceSession) {
      return deviceSession;
    } else {
      return null;
    }
  }
}
