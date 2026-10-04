import {
  MavLinkPacketParser,
  MavLinkPacketSplitter,
  type MavLinkPacket,
} from 'node-mavlink';
import { formatTelemetry } from './formatters.js';
import { REGISTRY } from './registry.js';

type MavlinkPipeline = {
  splitter: MavLinkPacketSplitter;
  parser: MavLinkPacketParser;
};

function createMavlinkPipeline(): MavlinkPipeline {
  const splitter = new MavLinkPacketSplitter();
  const parser = new MavLinkPacketParser();

  splitter.pipe(parser);

  return { splitter, parser };
}

function attachTelemetryLogger(parser: MavLinkPacketParser): void {
  parser.on('data', (packet: MavLinkPacket) => {
    const clazz = REGISTRY[packet.header.msgid];

    if (!clazz) {
      return;
    }

    const data = packet.protocol.data(packet.payload, clazz);
    const line = formatTelemetry(packet.header.msgid, data);

    if (line) {
      console.log(line);
    }
  });
}

export { attachTelemetryLogger, createMavlinkPipeline, type MavlinkPipeline };
