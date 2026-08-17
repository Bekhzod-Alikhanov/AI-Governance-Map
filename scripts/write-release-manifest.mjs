import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const RELEASE_ID = "2026-08-17";
export const RELEASE_FILES = ["full-dataset.json", "schema.json", "release-package.json"];

function normalizeRelativePath(filePath) {
  return filePath.replaceAll("\\", "/").replace(/^\.\//, "");
}

function resolveReleaseFile(baseDir, relativePath) {
  const normalized = normalizeRelativePath(relativePath);
  const resolvedBase = path.resolve(baseDir);
  const resolvedFile = path.resolve(resolvedBase, ...normalized.split("/"));
  if (resolvedFile !== resolvedBase && !resolvedFile.startsWith(`${resolvedBase}${path.sep}`)) {
    throw new Error(`Release path escapes its base directory: ${relativePath}`);
  }
  return { normalized, resolvedFile };
}

export async function sha256File(filePath) {
  const contents = await readFile(filePath);
  return createHash("sha256").update(contents).digest("hex");
}

export async function buildManifest({ releaseId, baseDir, files }) {
  const normalizedFiles = files.map(normalizeRelativePath).sort((a, b) => a.localeCompare(b));
  if (normalizedFiles.some((file) => ["manifest.json", "release-manifest.json"].includes(path.posix.basename(file)))) {
    throw new Error("A release manifest cannot include itself in its digest list");
  }

  const entries = [];
  for (const relativePath of normalizedFiles) {
    const { normalized, resolvedFile } = resolveReleaseFile(baseDir, relativePath);
    const fileStats = await stat(resolvedFile);
    entries.push({
      path: normalized,
      bytes: fileStats.size,
      sha256: await sha256File(resolvedFile),
    });
  }

  return {
    releaseId,
    algorithm: "sha256",
    generatedFrom: "deterministic public data build",
    files: entries,
  };
}

export async function writeReleaseManifest({ releaseId = RELEASE_ID, dataDir = path.join(process.cwd(), "public", "data") } = {}) {
  const versionedDir = path.join(dataDir, "releases", releaseId);
  await mkdir(versionedDir, { recursive: true });

  for (const filename of RELEASE_FILES) {
    await copyFile(path.join(dataDir, filename), path.join(versionedDir, filename));
  }

  const manifest = await buildManifest({ releaseId, baseDir: dataDir, files: RELEASE_FILES });
  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
  await writeFile(path.join(dataDir, "release-manifest.json"), serialized, "utf8");
  await writeFile(path.join(versionedDir, "manifest.json"), serialized, "utf8");
  return manifest;
}

export async function verifyManifest(manifestPath, baseDir = path.dirname(manifestPath)) {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (manifest.algorithm !== "sha256" || !Array.isArray(manifest.files)) {
    throw new Error(`Invalid release manifest: ${manifestPath}`);
  }

  const paths = manifest.files.map((entry) => entry.path);
  const sortedPaths = [...paths].sort((a, b) => a.localeCompare(b));
  if (JSON.stringify(paths) !== JSON.stringify(sortedPaths)) {
    throw new Error(`Manifest file paths are not sorted: ${manifestPath}`);
  }

  for (const entry of manifest.files) {
    if (!/^[a-f0-9]{64}$/.test(entry.sha256)) {
      throw new Error(`Invalid SHA-256 for ${entry.path}`);
    }
    const { resolvedFile } = resolveReleaseFile(baseDir, entry.path);
    const digest = await sha256File(resolvedFile);
    if (digest !== entry.sha256) throw new Error(`Digest mismatch for ${entry.path}`);
    const fileStats = await stat(resolvedFile);
    if (fileStats.size !== entry.bytes) throw new Error(`Byte count mismatch for ${entry.path}`);
  }

  return manifest;
}

async function main() {
  const dataDir = path.join(process.cwd(), "public", "data");
  if (process.argv.includes("--verify")) {
    const versionedDir = path.join(dataDir, "releases", RELEASE_ID);
    await verifyManifest(path.join(dataDir, "release-manifest.json"), dataDir);
    await verifyManifest(path.join(versionedDir, "manifest.json"), versionedDir);
    process.stdout.write(`Verified SHA-256 manifests for release ${RELEASE_ID}.\n`);
    return;
  }
  await writeReleaseManifest({ releaseId: RELEASE_ID, dataDir });
  process.stdout.write(`Wrote deterministic manifests for release ${RELEASE_ID}.\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
