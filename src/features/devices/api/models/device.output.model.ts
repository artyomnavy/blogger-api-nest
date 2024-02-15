export class DeviceSessionModel {
  iat: Date;
  exp: Date;
  ip: string;
  deviceId: string;
  deviceName: string;
  userId: string;
}

export class DeviceSessionOutputModel {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
}

export class DeviceSession {
  constructor(
    public iat: Date,
    public exp: Date,
    public ip: string,
    public deviceId: string,
    public deviceName: string,
    public userId: string,
  ) {}
}
