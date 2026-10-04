import {
  ardupilotmega,
  common,
  minimal,
  type MavLinkData,
} from 'node-mavlink';

const INVALID_CELL_VOLTAGE = 65535;

function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

function formatCoordinate(value: number): string {
  return (value / 1e7).toFixed(6);
}

function formatGpsFixType(fixType: common.GpsFixType | number | string): string {
  if (typeof fixType === 'string') {
    return fixType;
  }

  return common.GpsFixType[fixType] ?? String(fixType);
}

function resolveCopterMode(customMode: number): string {
  return ardupilotmega.CopterMode[customMode] ?? `mode-${customMode}`;
}

function formatHeartbeat(data: minimal.Heartbeat): string {
  const armed = (Number(data.baseMode) & minimal.MavModeFlag.SAFETY_ARMED) !== 0;
  const mode = resolveCopterMode(data.customMode);

  return `HEARTBEAT armed=${armed} mode=${mode} status=${data.systemStatus}`;
}

function formatGlobalPositionInt(data: common.GlobalPositionInt): string {
  const speedCmS = Math.hypot(data.vx, data.vy, data.vz);
  const heading = data.hdg === 65535 ? 'n/a' : `${(data.hdg / 100).toFixed(1)}°`;

  return [
    'GLOBAL_POSITION',
    `lat=${formatCoordinate(data.lat)}`,
    `lon=${formatCoordinate(data.lon)}`,
    `alt=${(data.relativeAlt / 1000).toFixed(2)}m`,
    `hdg=${heading}`,
    `spd=${(speedCmS / 100).toFixed(2)}m/s`,
  ].join(' ');
}

function formatAttitude(data: common.Attitude): string {
  return [
    'ATTITUDE',
    `roll=${radiansToDegrees(data.roll).toFixed(1)}°`,
    `pitch=${radiansToDegrees(data.pitch).toFixed(1)}°`,
    `yaw=${radiansToDegrees(data.yaw).toFixed(1)}°`,
  ].join(' ');
}

function formatGpsRawInt(data: common.GpsRawInt): string {
  return [
    'GPS',
    `fix=${formatGpsFixType(data.fixType)}`,
    `sats=${data.satellitesVisible}`,
    `lat=${formatCoordinate(data.lat)}`,
    `lon=${formatCoordinate(data.lon)}`,
    `alt=${(data.alt / 1000).toFixed(1)}m`,
  ].join(' ');
}

function formatBatteryStatus(data: common.BatteryStatus): string {
  const cellMv = data.voltages[0];
  const voltage =
    cellMv !== undefined && cellMv !== INVALID_CELL_VOLTAGE
      ? `${(cellMv / 1000).toFixed(2)}V`
      : 'n/a';

  return `BATTERY ${voltage} remaining=${data.batteryRemaining}%`;
}

function formatTelemetry(msgid: number, data: MavLinkData): string | null {
  switch (msgid) {
    case minimal.Heartbeat.MSG_ID:
      return formatHeartbeat(data as minimal.Heartbeat);
    case common.GlobalPositionInt.MSG_ID:
      return formatGlobalPositionInt(data as common.GlobalPositionInt);
    case common.Attitude.MSG_ID:
      return formatAttitude(data as common.Attitude);
    case common.GpsRawInt.MSG_ID:
      return formatGpsRawInt(data as common.GpsRawInt);
    case common.BatteryStatus.MSG_ID:
      return formatBatteryStatus(data as common.BatteryStatus);
    default:
      return null;
  }
}

export { formatTelemetry };
