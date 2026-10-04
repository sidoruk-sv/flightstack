import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const REPO_ENV_PATH = resolve(import.meta.dirname, '../../../.env');
const DEFAULT_PORT = 14552;
const DEFAULT_HOST = '0.0.0.0';

type MavlinkConfig = {
  port: number;
  host: string;
};

type LoadConfigOptions = {
  envFilePath?: string;
};

class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

function loadEnvFileIfPresent(envFilePath: string): void {
  if (existsSync(envFilePath)) {
    process.loadEnvFile(envFilePath);
  }
}

function loadPort(): number {
  const raw = process.env['MAVLINK_PORT']?.trim();

  if (!raw) {
    return DEFAULT_PORT;
  }

  const port = Number(raw);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ConfigError(
      `Invalid MAVLINK_PORT "${raw}". MAVLINK_PORT must be an integer between 1 and 65535.`,
    );
  }

  return port;
}

function loadHost(): string {
  const host = process.env['MAVLINK_HOST']?.trim();

  if (!host) {
    return DEFAULT_HOST;
  }

  return host;
}

function loadConfig(options: LoadConfigOptions = {}): MavlinkConfig {
  const envFilePath = options.envFilePath ?? REPO_ENV_PATH;
  loadEnvFileIfPresent(envFilePath);

  return {
    port: loadPort(),
    host: loadHost(),
  };
}

export { ConfigError, loadConfig, type LoadConfigOptions, type MavlinkConfig };
