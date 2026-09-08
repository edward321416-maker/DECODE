import { test } from "node:test";
import assert from "node:assert/strict";
import { generateId, isNamespacedId } from "../src/shared/ids.js";

// Invariant 2: Permit and Job IDs use separate namespaces.
test("invariant 2: permit and job ids use separate, distinguishable namespaces", () => {
  const permitId = generateId("permit");
  const jobId = generateId("job");
  assert.ok(isNamespacedId(permitId, "permit"));
  assert.ok(!isNamespacedId(permitId, "job"));
  assert.ok(isNamespacedId(jobId, "job"));
  assert.ok(!isNamespacedId(jobId, "permit"));
  assert.notEqual(permitId, jobId);
});

test("generateId produces unique ids", () => {
  const a = generateId("command");
  const b = generateId("command");
  assert.notEqual(a, b);
});
