import { Injectable } from '@nestjs/common';
import { DeviceSessionModel } from '../api/models/device.output.model';
import { InjectModel } from '@nestjs/mongoose';
import { DeviceSession, DeviceSessionDocument } from '../domain/device.entity';
import { Model } from 'mongoose';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(DeviceSession.name)
    private deviceModel: Model<DeviceSessionDocument>,
  ) {}
  async createDeviceSession(
    newDeviceSession: DeviceSessionModel,
  ): Promise<DeviceSessionModel> {
    await this.deviceModel.create(newDeviceSession);
    return newDeviceSession;
  }
  async updateDeviceSession(updateData: DeviceSessionModel): Promise<boolean> {
    const resultUpdateDeviceSession = await this.deviceModel.updateOne(
      {
        deviceId: updateData.deviceId,
        userId: updateData.userId,
      },
      {
        $set: {
          iat: updateData.iat,
          exp: updateData.exp,
          ip: updateData.ip,
          deviceName: updateData.deviceName,
        },
      },
    );

    return resultUpdateDeviceSession.matchedCount === 1;
  }
  async terminateDeviceSessionByLogout(
    deviceId: string,
    userId: string,
  ): Promise<boolean> {
    const resultTerminateDeviceSession = await this.deviceModel.deleteOne({
      deviceId: deviceId,
      userId: userId,
    });
    return resultTerminateDeviceSession.deletedCount === 1;
  }
}
