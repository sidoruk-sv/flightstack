import { styleText } from 'node:util';

type LogServerReadyOptions = {
  port: number;
  host?: string;
};

type ColorFormat = Parameters<typeof styleText>[0];

function shouldUseColors(): boolean {
  if (process.env['NO_COLOR']) {
    return false;
  }

  if (process.env['FORCE_COLOR'] === '0') {
    return false;
  }

  if (process.env['CI']) {
    return false;
  }

  // Cursor and pnpm pipe script output — stdout is often not a TTY even in the
  // integrated terminal, but ANSI colors still render. Opt out via NO_COLOR.
  return true;
}

function color(format: ColorFormat, text: string): string {
  if (!shouldUseColors()) {
    return text;
  }

  if (typeof format === 'string') {
    return styleText(format, text, { validateStream: false });
  }

  return styleText(format, text, { validateStream: false });
}

function terminalLink(url: string, label: string): string {
  if (!shouldUseColors()) {
    return label;
  }

  // Keep ANSI codes out of the hyperlink label — some terminals ignore them.
  return `\u001b]8;;${url}\u001b\\${label}\u001b]8;;\u001b\\`;
}

export function logServerReady({
  port,
  host = 'localhost',
}: LogServerReadyOptions): void {
  const healthUrl = `http://${host}:${port}/health`;
  const linkedHealth = terminalLink(healthUrl, color(['cyan', 'bold'], healthUrl));

  console.log();
  console.log(
    `  ${color('bold', 'FlightStack API')}  ${color('green', 'ready')}`,
  );
  console.log();
  console.log(
    `  ${color('green', '➜')}  ${color('dim', 'Local:   ')}${linkedHealth}`,
  );
  console.log();
}
