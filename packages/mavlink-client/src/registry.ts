import { common, minimal, type MavLinkPacketRegistry } from 'node-mavlink';

const REGISTRY: MavLinkPacketRegistry = {
  [minimal.Heartbeat.MSG_ID]: minimal.Heartbeat,
  [common.GlobalPositionInt.MSG_ID]: common.GlobalPositionInt,
  [common.Attitude.MSG_ID]: common.Attitude,
  [common.GpsRawInt.MSG_ID]: common.GpsRawInt,
  [common.BatteryStatus.MSG_ID]: common.BatteryStatus,
};

export { REGISTRY };
