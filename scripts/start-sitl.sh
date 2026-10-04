#!/usr/bin/env bash

set -euo pipefail

###############################################################################
# FlightStack SITL Fleet Launcher
#
# Fleet:
#   - Copter x3
#   - Plane x1
#   - Rover x2
#   - Boat x1
#
# MAVLink:
#   QGroundControl -> UDP 14550
#   FlightStack    -> UDP 14552
#
# All vehicles share the same MAVLink destinations.
# MAVLink SYSID identifies the individual vehicle.
###############################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FLEET_FILE="${SCRIPT_DIR}/sitl-fleet.json"

CONTAINER="ardupilot-dev"
IMAGE="localhost/ardupilot-dev:latest"

# Host path to the ArduPilot checkout.
ARDUPILOT_DIR="${HOME}/projects/ardupilot"

# Podman machine.
PODMAN_MACHINE="podman-machine-default"

# Container paths.
AP_DIR="/ardupilot"
RUNTIME_DIR="/tmp/flightstack-sitl"

# MAVLink UDP targets on the host, as seen from inside the container.
# host.containers.internal is Podman's DNS name for the macOS/Linux host.
QGC_ENDPOINT="host.containers.internal:14550"
FLIGHTSTACK_ENDPOINT="host.containers.internal:14552"

# This script has two layers:
#   1. Host (below): Podman machine, container lifecycle, podman exec wrapper.
#   2. Container (INNER heredoc): waf build, sim_vehicle fleet, MAVProxy outputs.


###############################################################################
# Helpers
###############################################################################

log() {
    printf '\033[1;36m[FlightStack]\033[0m %s\n' "$*"
}

warn() {
    printf '\033[1;33m[FlightStack]\033[0m %s\n' "$*" >&2
}

die() {
    printf '\033[1;31m[FlightStack ERROR]\033[0m %s\n' "$*" >&2
    exit 1
}


###############################################################################
# Stop command
###############################################################################

if [[ "${1:-}" == "stop" ]]; then
    if ! podman container exists "${CONTAINER}" 2>/dev/null; then
        log "Container '${CONTAINER}' does not exist."
        exit 0
    fi

    log "Stopping FlightStack SITL fleet..."

    # bash -s runs the heredoc as a script; set +e so a missing process does not abort stop.
    podman exec "${CONTAINER}" bash -s <<'INNER'
set +e

pkill -f "sim_vehicle.py" 2>/dev/null || true
pkill -f "arducopter" 2>/dev/null || true
pkill -f "arduplane" 2>/dev/null || true
pkill -f "ardurover" 2>/dev/null || true
pkill -f "mavproxy.py" 2>/dev/null || true

rm -rf /tmp/flightstack-sitl
INNER

    log "Fleet stopped."
    exit 0
fi


###############################################################################
# Host checks
###############################################################################

command -v podman >/dev/null 2>&1 \
    || die "podman is not installed"

[[ -d "${ARDUPILOT_DIR}" ]] \
    || die "ArduPilot checkout not found at ${ARDUPILOT_DIR}"

[[ -f "${FLEET_FILE}" ]] \
    || die "Fleet manifest not found at ${FLEET_FILE}"


###############################################################################
# Podman machine
###############################################################################

log "Checking Podman machine..."

# On macOS, containers run inside a Podman VM — start it if needed.
MACHINE_STATE="$(
    podman machine inspect "${PODMAN_MACHINE}" \
        --format '{{.State}}' 2>/dev/null || true
)"

if [[ "${MACHINE_STATE}" != "running" ]]; then
    log "Starting Podman machine: ${PODMAN_MACHINE}"
    podman machine start "${PODMAN_MACHINE}"
else
    log "Podman machine already running."
fi


###############################################################################
# Container
###############################################################################

log "Checking container: ${CONTAINER}"

if ! podman container exists "${CONTAINER}" 2>/dev/null; then

    log "Creating container '${CONTAINER}'..."

    # sleep infinity keeps the container alive; SITL is started later via podman exec.
    podman run \
        --name "${CONTAINER}" \
        -d \
        -v "${ARDUPILOT_DIR}:${AP_DIR}" \
        "${IMAGE}" \
        sleep infinity

else

    RUNNING="$(
        podman inspect \
            --format '{{.State.Running}}' \
            "${CONTAINER}"
    )"

    if [[ "${RUNNING}" != "true" ]]; then
        log "Starting existing container..."

        podman start "${CONTAINER}" >/dev/null

        sleep 1
    fi
fi


###############################################################################
# Verify container
###############################################################################

RUNNING="$(
    podman inspect \
        --format '{{.State.Running}}' \
        "${CONTAINER}"
)"

[[ "${RUNNING}" == "true" ]] \
    || die "Container '${CONTAINER}' is not running."


###############################################################################
# Clean previous fleet
###############################################################################

log "Cleaning previous SITL fleet..."

# pkill by process name fragment; 2>/dev/null || true ignores "not found" and set -e on host.
podman exec "${CONTAINER}" bash -s <<'INNER'
set +e

pkill -f "sim_vehicle.py" 2>/dev/null || true
pkill -f "arducopter" 2>/dev/null || true
pkill -f "arduplane" 2>/dev/null || true
pkill -f "ardurover" 2>/dev/null || true
pkill -f "mavproxy.py" 2>/dev/null || true

rm -rf /tmp/flightstack-sitl
mkdir -p /tmp/flightstack-sitl
INNER


###############################################################################
# Start fleet inside the container
###############################################################################

log "Starting SITL fleet..."

# Fleet manifest is the single source of truth for ids, labels, and sysids.
podman cp "${FLEET_FILE}" "${CONTAINER}:/tmp/sitl-fleet.json"

# -it: allocate a TTY so the interactive container shell at the end works.
# -i keeps stdin open for the heredoc. Arguments before << become $1, $2, … inside.
# Quoted 'INNER' prevents host-side variable expansion — everything runs in the container.
podman exec -it "${CONTAINER}" bash -s \
    "${QGC_ENDPOINT}" \
    "${FLIGHTSTACK_ENDPOINT}" \
    "${AP_DIR}" \
    "${RUNTIME_DIR}" \
    "/tmp/sitl-fleet.json" <<'INNER'

set -euo pipefail


###############################################################################
# Arguments
###############################################################################

QGC_ENDPOINT="$1"
FLIGHTSTACK_ENDPOINT="$2"

AP_DIR="$3"
RUNTIME_DIR="$4"
FLEET_FILE="$5"


###############################################################################
# Paths
###############################################################################

cd "${AP_DIR}"

###############################################################################
# Python environment (ArduPilot venv inside the container)
###############################################################################

# ArduPilot prereqs install pip, empy, MAVProxy, etc. into this venv — not system python3.
VENV_DIR="${HOME}/venv-ardupilot"

if [[ -f "${VENV_DIR}/bin/activate" ]]; then
    # shellcheck disable=SC1091
    source "${VENV_DIR}/bin/activate"
    echo "Using Python venv: ${VENV_DIR}"
else
    echo
    echo "WARNING: ArduPilot venv not found at ${VENV_DIR}"
    echo "Run inside the container:"
    echo "  ${AP_DIR}/Tools/environment_install/install-prereqs-ubuntu.sh -y"
fi

SIM_VEHICLE="${AP_DIR}/Tools/autotest/sim_vehicle.py"

[[ -x "${SIM_VEHICLE}" ]] \
    || {
        echo "ERROR: ${SIM_VEHICLE} not found or not executable."
        exit 1
    }


###############################################################################
# Verify available vehicle types
###############################################################################

echo
echo "=== Available SITL vehicles ==="

# sim_vehicle prints a space-separated vehicle list; it may exit non-zero on --list-*.
# || true keeps set -e from aborting — we only need the captured output.
VEHICLES="$(
    "${SIM_VEHICLE}" --list-vehicle 2>&1 || true
)"

echo "${VEHICLES}"

for VEHICLE in ArduCopter ArduPlane Rover; do
    # Match whole tokens only (e.g. "Rover" must not match inside "ArduRover").
    # <<< feeds the string as stdin; grep -E uses extended regex, -q suppresses output.
    if ! grep -Eq "(^|[[:space:]])${VEHICLE}([[:space:]]|$)" <<<"${VEHICLES}"; then
        echo
        echo "ERROR: '${VEHICLE}' is not available."
        exit 1
    fi
done


###############################################################################
# Verify boat frame
###############################################################################

echo
echo "=== Checking Rover boat frame ==="

# Same pattern as --list-vehicle: capture frame names, tolerate non-zero exit.
ROVER_FRAMES="$(
    "${SIM_VEHICLE}" --list-frame Rover 2>&1 || true
)"

echo "${ROVER_FRAMES}"

# boat-107 uses -f sailboat-motor; fail early if this frame is not in the build.
if ! grep -Eq "(^|[[:space:]])sailboat-motor([[:space:]]|$)" <<<"${ROVER_FRAMES}"; then
    echo
    echo "ERROR: Rover frame 'sailboat-motor' is not available."
    exit 1
fi


###############################################################################
# Build SITL binaries (skip when already present)
###############################################################################

# Binaries live on the mounted ArduPilot tree — shared between host and container.
SITL_BIN_DIR="${AP_DIR}/build/sitl/bin"
NEEDS_BUILD=0

for BIN in arducopter arduplane ardurover; do
    if [[ ! -x "${SITL_BIN_DIR}/${BIN}" ]]; then
        NEEDS_BUILD=1
        break
    fi
done

if [[ "${NEEDS_BUILD}" == "1" ]]; then

    if [[ -z "${VIRTUAL_ENV:-}" ]]; then
        echo
        echo "ERROR: SITL binaries missing and no Python venv at ${VENV_DIR}."
        echo "Inside the container, run:"
        echo "  ${AP_DIR}/Tools/environment_install/install-prereqs-ubuntu.sh -y"
        exit 1
    fi

    echo
    echo "============================================================"
    echo "Checking Python build dependencies"
    echo "============================================================"

    # waf embed steps import empy as "em" (not "empy").
    if ! python3 -c "import em" 2>/dev/null; then
        echo "Installing empy==3.3.4..."
        python3 -m pip install empy==3.3.4
    fi

    if ! python3 -c "import pexpect" 2>/dev/null; then
        echo "Installing pexpect..."
        python3 -m pip install pexpect
    fi

    echo
    echo "============================================================"
    echo "Building SITL binaries"
    echo "============================================================"

    ./waf configure --board sitl

    for TARGET in \
        bin/arducopter \
        bin/arduplane \
        bin/ardurover
    do
        echo
        echo "--- Building ${TARGET} ---"

        ./waf build \
            --target "${TARGET}"
    done

else

    echo
    echo "SITL binaries already built — skipping waf build."

fi


###############################################################################
# Runtime setup
###############################################################################

mkdir -p "${RUNTIME_DIR}"

PIDS=()


###############################################################################
# Start one vehicle
###############################################################################

start_vehicle() {
    local NAME="$1"
    local LABEL="$2"
    local VEHICLE="$3"
    local INSTANCE="$4"
    local SYSID="$5"
    local LOCATION="$6"
    # Remaining args (e.g. -f sailboat-motor) are passed through to sim_vehicle.
    shift 6

    # Per-vehicle state and logs — avoids collisions when running multiple SITLs.
    local DIR="${RUNTIME_DIR}/${NAME}"
    local LOGFILE="${DIR}/sim.log"

    mkdir -p "${DIR}"

    echo
    echo "------------------------------------------------------------"
    echo "Starting ${LABEL}"
    echo "  id      : ${NAME}"
    echo "  vehicle : ${VEHICLE}"
    echo "  instance: ${INSTANCE}"
    echo "  sysid   : ${SYSID}"
    echo "  location: ${LOCATION}"
    echo "  runtime : ${DIR}"
    echo "  log     : ${LOGFILE}"
    echo "------------------------------------------------------------"

    # --no-rebuild: use existing waf binaries (built above or from a prior session).
    # --no-extra-ports: do not open per-vehicle UDP ports — all traffic goes to --out.
    # --out: MAVProxy forwards MAVLink to the same host ports for every vehicle.
    # --aircraft: names MAVProxy state dirs (matches id, e.g. copter-101).
    # --mavproxy-args --daemon: headless container has no TTY; without this MAVProxy
    #   exits on EOF stdin, sim_vehicle kills the vehicle, and the watchdog returns.
    # --custom-location format: lat,lon,alt,heading (degrees).
    "${SIM_VEHICLE}" \
        -v "${VEHICLE}" \
        -I "${INSTANCE}" \
        --sysid "${SYSID}" \
        --aircraft "${NAME}" \
        --custom-location "${LOCATION}" \
        --no-rebuild \
        --no-extra-ports \
        --use-dir "${DIR}" \
        --mavproxy-args "--daemon" \
        --out "${QGC_ENDPOINT}" \
        --out "${FLIGHTSTACK_ENDPOINT}" \
        "$@" \
        >"${LOGFILE}" 2>&1 &

    # Track the background sim_vehicle wrapper; it spawns arducopter/MAVProxy children.
    PIDS+=("$!")

    # Let SITL/MAVProxy initialize before starting the next vehicle.
    sleep 2
}


###############################################################################
# Fleet
#
# Instance numbers are deliberately separated from SYSIDs.
#
# Instance:
#   identifies the local SITL process/ports.
#
# SYSID:
#   identifies the MAVLink vehicle.
###############################################################################

echo
echo "============================================================"
echo "Starting FlightStack fleet"
echo "============================================================"

cp "${FLEET_FILE}" "${RUNTIME_DIR}/fleet.json"

# Read scripts/sitl-fleet.json — one row per vehicle for start_vehicle.
while IFS=$'\t' read -r NAME LABEL VEHICLE INSTANCE SYSID LOCATION FRAME; do
    EXTRA_ARGS=()

    if [[ -n "${FRAME}" ]]; then
        EXTRA_ARGS=(-f "${FRAME}")
    fi

    start_vehicle \
        "${NAME}" \
        "${LABEL}" \
        "${VEHICLE}" \
        "${INSTANCE}" \
        "${SYSID}" \
        "${LOCATION}" \
        "${EXTRA_ARGS[@]}"
done < <(
    python3 - "${FLEET_FILE}" <<'PY'
import json
import sys

for entry in json.load(open(sys.argv[1], encoding="utf-8")):
    print(
        "\t".join(
            [
                entry["id"],
                entry["label"],
                entry["vehicle"],
                str(entry["instance"]),
                str(entry["sysid"]),
                entry["location"],
                entry.get("frame", ""),
            ]
        )
    )
PY
)


###############################################################################
# Summary
###############################################################################

echo
echo "============================================================"
echo "FlightStack SITL fleet started"
echo "============================================================"

echo
printf '%-16s %-14s %-18s %-10s %-8s\n' \
    "LABEL" "ID" "TYPE" "INSTANCE" "SYSID"

python3 - "${FLEET_FILE}" <<'PY' | while IFS=$'\t' read -r LABEL NAME VEHICLE INSTANCE SYSID; do
import json
import sys

for entry in json.load(open(sys.argv[1], encoding="utf-8")):
    vehicle = entry["vehicle"]
    if entry.get("frame") == "sailboat-motor":
        vehicle = "Rover/Boat"
    print(
        "\t".join(
            [
                entry["label"],
                entry["id"],
                vehicle,
                str(entry["instance"]),
                str(entry["sysid"]),
            ]
        )
    )
PY
    printf '%-16s %-14s %-18s %-10s %-8s\n' \
        "${LABEL}" "${NAME}" "${VEHICLE}" "${INSTANCE}" "${SYSID}"
done

echo
echo "MAVLink:"
echo
echo "  QGroundControl : ${QGC_ENDPOINT}"
echo "  FlightStack    : ${FLIGHTSTACK_ENDPOINT}"

echo
echo "Fleet manifest:"
echo "  ${RUNTIME_DIR}/fleet.json"

echo
echo "Logs:"
echo "  ${RUNTIME_DIR}/"

echo
echo "PIDs:"
printf '  %s\n' "${PIDS[@]}"

echo
echo "Fleet is running."
echo "============================================================"

echo
echo "Dropping into container shell (fleet keeps running in background)."
echo "  exit          — leave shell; fleet stays up"
echo "  stop (host)   — ./scripts/start-sitl.sh stop"
echo

# Prevent SIGHUP from killing sim_vehicle children when this shell is replaced/exits.
disown -a 2>/dev/null || true

exec bash

INNER


###############################################################################
# Host-side message
###############################################################################

echo
log "Left container shell (fleet may still be running)."

echo
log "QGroundControl:"
echo "  UDP 14550"

echo
log "FlightStack:"
echo "  UDP 14552"

echo
log "Stop fleet:"
echo "  ${0} stop"

echo
log "Inspect container:"
echo "  podman exec -it ${CONTAINER} bash"

echo
log "Inspect logs:"
echo "  podman exec -it ${CONTAINER} ls -lah ${RUNTIME_DIR}"
