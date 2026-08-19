import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const RELEASE_FILES = ["full-dataset.json", "schema.json", "release-package.json"];
export const GENERATED_FROM = "deterministic public data build";

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
    generatedFrom: GENERATED_FROM,
    files: entries,
  };
}

async function readFileIfPresent(filePath) {
  try {
    return await readFile(filePath);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

async function readReleaseId(dataDir) {
  const dataset = JSON.parse(await readFile(path.join(dataDir, "full-dataset.json"), "utf8"));
  if (typeof dataset.releaseId !== "string" || !dataset.releaseId.trim()) {
    throw new Error(`Missing releaseId in ${path.join(dataDir, "full-dataset.json")}`);
  }
  return dataset.releaseId;
}

export async function writeReleaseManifest({ dataDir = path.join(process.cwd(), "public", "data"), migrateRelease = false } = {}) {
  const releaseId = await readReleaseId(dataDir);
  const versionedDir = path.join(dataDir, "releases", releaseId);
  await mkdir(versionedDir, { recursive: true });

  const manifest = await buildManifest({ releaseId, baseDir: dataDir, files: RELEASE_FILES });
  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
  const serializedBytes = Buffer.from(serialized, "utf8");
  const archivedFiles = await Promise.all(
    RELEASE_FILES.map(async (filename) => ({
      filename,
      source: await readFile(path.join(dataDir, filename)),
      archived: await readFileIfPresent(path.join(versionedDir, filename)),
    }))
  );
  const archivedManifestPath = path.join(versionedDir, "manifest.json");
  const archivedManifest = await readFileIfPresent(archivedManifestPath);
  const archiveExists = archivedManifest !== null || archivedFiles.some(({ archived }) => archived !== null);

  if (archiveExists) {
    let differs = false;
    for (const { filename, source, archived } of archivedFiles) {
      if (archived === null || !archived.equals(source)) {
        if (!migrateRelease) {
          throw new Error(`Refusing to overwrite immutable release ${releaseId}: ${filename} differs`);
        }
        differs = true;
      }
    }
    if (archivedManifest === null || !archivedManifest.equals(serializedBytes)) {
      if (!migrateRelease) {
        throw new Error(`Refusing to overwrite immutable release ${releaseId}: manifest.json differs`);
      }
      differs = true;
    }
    if (differs) {
      const migrationTargets = [...RELEASE_FILES, "manifest.json"].map((filename) => path.resolve(versionedDir, filename));
      for (const target of migrationTargets) {
        if (path.dirname(target) !== path.resolve(versionedDir)) {
          throw new Error(`Release migration target is not a direct child of ${versionedDir}: ${target}`);
        }
      }
      for (const filename of RELEASE_FILES) {
        await copyFile(path.join(dataDir, filename), path.join(versionedDir, filename));
      }
      await writeFile(archivedManifestPath, serializedBytes);
    }
  } else {
    for (const filename of RELEASE_FILES) {
      await copyFile(path.join(dataDir, filename), path.join(versionedDir, filename));
    }
    await writeFile(archivedManifestPath, serializedBytes);
  }

  await writeFile(path.join(dataDir, "release-manifest.json"), serialized, "utf8");
  return manifest;
}

export async function verifyManifest(manifestPath, baseDir = path.dirname(manifestPath)) {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const expectedReleaseId = await readReleaseId(baseDir);
  if (manifest.releaseId !== expectedReleaseId) throw new Error(`Invalid releaseId in ${manifestPath}`);
  if (manifest.generatedFrom !== GENERATED_FROM) throw new Error(`Invalid generatedFrom in ${manifestPath}`);
  if (manifest.algorithm !== "sha256" || !Array.isArray(manifest.files)) {
    throw new Error(`Invalid release manifest: ${manifestPath}`);
  }

  const paths = manifest.files.map((entry) => entry.path);
  const requiredPaths = RELEASE_FILES.map(normalizeRelativePath).sort((a, b) => a.localeCompare(b));
  if (JSON.stringify(paths) !== JSON.stringify(requiredPaths)) {
    throw new Error(`Manifest must list exactly: ${requiredPaths.join(", ")}`);
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
  const verifyIndex = process.argv.indexOf("--verify");
  if (verifyIndex >= 0) {
    const suppliedDir = process.argv[verifyIndex + 1];
    if (suppliedDir) {
      const versionedDir = path.resolve(suppliedDir);
      const manifest = await verifyManifest(path.join(versionedDir, "manifest.json"), versionedDir);
      process.stdout.write(`Verified SHA-256 manifest for release ${manifest.releaseId}.\n`);
      return;
    }
    const releaseId = await readReleaseId(dataDir);
    const versionedDir = path.join(dataDir, "releases", releaseId);
    await verifyManifest(path.join(dataDir, "release-manifest.json"), dataDir);
    await verifyManifest(path.join(versionedDir, "manifest.json"), versionedDir);
    process.stdout.write(`Verified SHA-256 manifests for release ${releaseId}.\n`);
    return;
  }
  const migrateRelease = process.argv.includes("--migrate-release");
  const manifest = await writeReleaseManifest({ dataDir, migrateRelease });
  process.stdout.write(`Wrote deterministic manifests for release ${manifest.releaseId}.\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
