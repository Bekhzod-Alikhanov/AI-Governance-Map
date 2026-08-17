import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  buildManifest,
  sha256File,
  verifyManifest,
  writeReleaseManifest,
} from "./write-release-manifest.mjs";

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-regulations-release-"));
  const dataDir = path.join(root, "public", "data");
  await mkdir(dataDir, { recursive: true });
  await writeFile(path.join(dataDir, "schema.json"), '{"schema":true}\n', "utf8");
  await writeFile(path.join(dataDir, "full-dataset.json"), '{"dataset":true}\n', "utf8");
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

test("writeReleaseManifest creates immutable copies and both manifests deterministically", async (t) => {
  const { root, dataDir } = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));

  await writeReleaseManifest({ releaseId: "2026-08-17", dataDir });
  const latestPath = path.join(dataDir, "release-manifest.json");
  const versionedDir = path.join(dataDir, "releases", "2026-08-17");
  const first = await readFile(latestPath, "utf8");
  await writeReleaseManifest({ releaseId: "2026-08-17", dataDir });

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

test("verifyManifest rejects a mutated release file", async (t) => {
  const { root, dataDir } = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));

  await writeReleaseManifest({ releaseId: "2026-08-17", dataDir });
  await writeFile(path.join(dataDir, "schema.json"), '{"schema":"mutated"}\n', "utf8");

  await assert.rejects(
    verifyManifest(path.join(dataDir, "release-manifest.json"), dataDir),
    /Digest mismatch for schema\.json/
  );
});
