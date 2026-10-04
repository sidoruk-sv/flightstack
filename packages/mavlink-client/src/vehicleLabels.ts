import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_FLEET_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../scripts/sitl-fleet.json',
);

type FleetVehicle = {
  id: string;
  label: string;
  sysid: number;
};

function loadFleetLabels(fleetPath = DEFAULT_FLEET_PATH): Map<number, string> {
  const labels = new Map<number, string>();

  try {
    const raw = readFileSync(fleetPath, 'utf8');
    const fleet = JSON.parse(raw) as FleetVehicle[];

    for (const entry of fleet) {
      labels.set(entry.sysid, entry.label);
    }
  } catch {
    // Optional file — sysid-only tagging still works without it.
  }

  return labels;
}

function formatVehicleTag(sysid: number, labels: Map<number, string>): string {
  const label = labels.get(sysid);

  if (label) {
    return label;
  }

  return `sysid ${sysid}`;
}

export { formatVehicleTag, loadFleetLabels };
