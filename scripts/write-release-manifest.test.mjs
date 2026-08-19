import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  buildManifest,
  sha256File,
  verifyManifest,
  writeReleaseManifest,
} from "./write-release-manifest.mjs";

const execFileAsync = promisify(execFile);
const scriptPath = fileURLToPath(new URL("./write-release-manifest.mjs", import.meta.url));

async function fixture(releaseId = "2026-08-17") {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-regulations-release-"));
  const dataDir = path.join(root, "public", "data");
  await mkdir(dataDir, { recursive: true });
  await writeFile(path.join(dataDir, "schema.json"), '{"schema":true}\n', "utf8");
  await writeFile(
    path.join(dataDir, "full-dataset.json"),
    `${JSON.stringify({ releaseId, dataset: true })}\n`,
    "utf8"
  );
  await writeFile(path.join(dataDir, "release-package.json"), '{"release":true}\n', "utf8");
  return { root, dataDir };
}

test("buildManifest emits sorted, slash-normalized SHA-256 entries", async (t) => {
  const { root, dataDir } = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(dataDir, "nested"));
  await writeFile(path.join(dataDir, "nested", "full-dataset.json"), '{"dataset":true}\n', "utf8");

  const manifest = await buildManifest({
    releaseId: "2026-08-17",
    baseDir: dataDir,
    files: ["schema.json", "nested\\full-dataset.json"],
  });

  assert.deepEqual(manifest.files.map((entry) => entry.path), ["nested/full-dataset.json", "schema.json"]);
  for (const entry of manifest.files) {
    assert.match(entry.sha256, /^[a-f0-9]{64}$/);
    assert.ok(entry.bytes > 0);
  }
  assert.equal(manifest.algorithm, "sha256");
  assert.equal(manifest.generatedFrom, "deterministic public data build");
  assert.equal(await sha256File(path.join(dataDir, "schema.json")), manifest.files[1].sha256);
});

test("writeReleaseManifest reads the current release id and creates both manifests deterministically", async (t) => {
  const { root, dataDir } = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));

  const written = await writeReleaseManifest({ dataDir });
  const latestPath = path.join(dataDir, "release-manifest.json");
  const versionedDir = path.join(dataDir, "releases", "2026-08-17");
  const first = await readFile(latestPath, "utf8");
  await writeReleaseManifest({ dataDir });

  assert.equal(written.releaseId, "2026-08-17");

  assert.equal(await readFile(latestPath, "utf8"), first);
  assert.equal(await readFile(path.join(versionedDir, "manifest.json"), "utf8"), first);
  for (const filename of ["full-dataset.json", "schema.json", "release-package.json"]) {
    assert.equal(
      await readFile(path.join(versionedDir, filename), "utf8"),
      await readFile(path.join(dataDir, filename), "utf8")
    );
  }
  await verifyManifest(latestPath, dataDir);
  await verifyManifest(path.join(versionedDir, "manifest.json"), versionedDir);
});

test("writeReleaseManifest refuses to replace a published archive with different bytes", async (t) => {
  const { root, dataDir } = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));

  await writeReleaseManifest({ dataDir });
  const archivedSchemaPath = path.join(dataDir, "releases", "2026-08-17", "schema.json");
  const publishedSchema = await readFile(archivedSchemaPath, "utf8");
  await writeFile(path.join(dataDir, "schema.json"), '{"schema":"changed-after-publication"}\n', "utf8");

  await assert.rejects(
    writeReleaseManifest({ dataDir }),
    /Refusing to overwrite immutable release 2026-08-17: schema\.json differs/
  );
  assert.equal(await readFile(archivedSchemaPath, "utf8"), publishedSchema);
});

test("verifyManifest rejects a mutated release file", async (t) => {
  const { root, dataDir } = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));

  await writeReleaseManifest({ dataDir });
  await writeFile(path.join(dataDir, "schema.json"), '{"schema":"mutated"}\n', "utf8");

  await assert.rejects(
    verifyManifest(path.join(dataDir, "release-manifest.json"), dataDir),
    /Digest mismatch for schema\.json/
  );
});

test("verifyManifest rejects malformed release identity and provenance", async (t) => {
  const { root, dataDir } = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));

  await writeReleaseManifest({ dataDir });
  const manifestPath = path.join(dataDir, "release-manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

  await writeFile(manifestPath, `${JSON.stringify({ ...manifest, releaseId: "2026-08-18" }, null, 2)}\n`);
  await assert.rejects(verifyManifest(manifestPath, dataDir), /Invalid releaseId/);

  await writeFile(
    manifestPath,
    `${JSON.stringify({ ...manifest, generatedFrom: "unknown build" }, null, 2)}\n`
  );
  await assert.rejects(verifyManifest(manifestPath, dataDir), /Invalid generatedFrom/);
});

test("verifyManifest rejects omitted and duplicate required file entries", async (t) => {
  const { root, dataDir } = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));

  await writeReleaseManifest({ dataDir });
  const manifestPath = path.join(dataDir, "release-manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

  await writeFile(manifestPath, `${JSON.stringify({ ...manifest, files: manifest.files.slice(0, 2) }, null, 2)}\n`);
  await assert.rejects(verifyManifest(manifestPath, dataDir), /Manifest must list exactly/);

  await writeFile(
    manifestPath,
    `${JSON.stringify({ ...manifest, files: [manifest.files[0], manifest.files[0], manifest.files[2]] }, null, 2)}\n`
  );
  await assert.rejects(verifyManifest(manifestPath, dataDir), /Manifest must list exactly/);
});

test("writes and validates a synthetic historical release using its dataset release id", async (t) => {
  const releaseId = "2025-12-01";
  const { root, dataDir } = await fixture(releaseId);
  t.after(() => rm(root, { recursive: true, force: true }));

  const manifest = await writeReleaseManifest({ dataDir });
  const versionedDir = path.join(dataDir, "releases", releaseId);

  assert.equal(manifest.releaseId, releaseId);
  assert.equal(
    (await verifyManifest(path.join(versionedDir, "manifest.json"), versionedDir)).releaseId,
    releaseId
  );
});

test("CLI validates a supplied historical versioned directory", async (t) => {
  const releaseId = "2025-11-15";
  const { root, dataDir } = await fixture(releaseId);
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeReleaseManifest({ dataDir });
  const versionedDir = path.join(dataDir, "releases", releaseId);

  const { stdout } = await execFileAsync(
    process.execPath,
    [scriptPath, "--verify", versionedDir],
    { cwd: root }
  );

  assert.match(stdout, new RegExp(`Verified SHA-256 manifest for release ${releaseId}`));
});
