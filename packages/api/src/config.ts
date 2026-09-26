import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const REPO_ENV_PATH = resolve(import.meta.dirname, '../../../.env');

type AppConfig = {
  port: number;
  databaseUrl: string;
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

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new ConfigError(
      `Missing required environment variable ${name}. Copy .env.example to .env and set database connection settings.`,
    );
  }

  return value;
}

function loadPort(): number {
  const raw = process.env['PORT']?.trim();

  if (!raw) {
    return 3000;
  }

  const port = Number(raw);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ConfigError(
      `Invalid PORT "${raw}". PORT must be an integer between 1 and 65535.`,
    );
  }

  return port;
}

function loadConfig(options: LoadConfigOptions = {}): AppConfig {
  const envFilePath = options.envFilePath ?? REPO_ENV_PATH;
  loadEnvFileIfPresent(envFilePath);

  return {
    port: loadPort(),
    databaseUrl: requireEnv('DATABASE_URL'),
  };
}

export { ConfigError, loadConfig, type AppConfig, type LoadConfigOptions };
