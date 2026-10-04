type LogMavlinkReadyOptions = {
  host: string;
  port: number;
};

function logMavlinkReady({ host, port }: LogMavlinkReadyOptions): void {
  console.log(`MAVLink UDP listening on ${host}:${port}`);
}

export { logMavlinkReady };
