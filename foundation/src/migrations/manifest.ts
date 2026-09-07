export interface MigrationManifestEntry {
  migrationId: string;
  fromVersion: string;
  toVersion: string;
  backwardReadCompatible: boolean;
  forwardReadCompatible: boolean;
  minimumCodeVersion: string;
  rollbackCodeVersionMin: string;
  destructive: boolean;
  status: string;
}

export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
}

export class MigrationManifestError extends Error {}

const SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)$/;

export function parseSemver(version: string): ParsedVersion {
  const match = SEMVER_RE.exec(version);
  if (!match) {
    throw new MigrationManifestError(`malformed semver: ${version}`);
  }
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

export function compareSemver(a: string, b: string): number {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  if (pa.major !== pb.major) return pa.major - pb.major;
  if (pa.minor !== pb.minor) return pa.minor - pb.minor;
  return pa.patch - pb.patch;
}

export function assertRollbackSafe(currentCodeVersion: string, rollbackCodeVersionMin: string): void {
  if (compareSemver(currentCodeVersion, rollbackCodeVersionMin) < 0) {
    throw new MigrationManifestError(
      `unsafe rollback: current code version ${currentCodeVersion} is below rollback minimum ${rollbackCodeVersionMin}`,
    );
  }
}

export function assertNonDestructive(entry: MigrationManifestEntry): void {
  if (entry.destructive) {
    throw new MigrationManifestError(
      `migration ${entry.migrationId} is destructive and is rejected by the non-destructive guard`,
    );
  }
}

export function validateManifestEntry(entry: MigrationManifestEntry): void {
  parseSemver(entry.fromVersion);
  parseSemver(entry.toVersion);
  parseSemver(entry.minimumCodeVersion);
  parseSemver(entry.rollbackCodeVersionMin);
  assertNonDestructive(entry);
}
