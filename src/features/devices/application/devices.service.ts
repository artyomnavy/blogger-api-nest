import { Injectable } from '@nestjs/common';
import {
  DeviceSession,
  DeviceSessionModel,
} from '../api/models/device.output.model';
import { DevicesRepository } from '../infrastrucure/devices.repository';

@Injectable()
export class DevicesService {
  constructor(protected devicesRepository: DevicesRepository) {}
  async createDeviceSession(inputData: DeviceSessionModel) {
    const newDeviceSession = new DeviceSession(
      inputData.iat,
      inputData.exp,
      inputData.ip,
      inputData.deviceId,
      inputData.deviceName,
      inputData.userId,
    );

    const createdDeviceSession =
      await this.devicesRepository.createDeviceSession(newDeviceSession);

    return createdDeviceSession;
  }
  async updateDeviceSession(updateData: DeviceSessionModel): Promise<boolean> {
    return await this.devicesRepository.updateDeviceSession(updateData);
  }
  async terminateDeviceSessionByLogout(
    deviceId: string,
    userId: string,
  ): Promise<boolean> {
    return await this.devicesRepository.terminateDeviceSessionByLogout(
      deviceId,
      userId,
    );
  }
  async terminateDeviceSessionById(deviceId: string): Promise<boolean> {
    return await this.devicesRepository.terminateDeviceSessionById(deviceId);
  }
  async terminateAllOthersDevicesSessions(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    return await this.devicesRepository.terminateAllOthersDevicesSessions(
      userId,
      deviceId,
    );
  }
}
