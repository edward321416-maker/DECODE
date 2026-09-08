import { randomUUID } from "node:crypto";

export type IdNamespace = "permit" | "job" | "command";

export function generateId(namespace: IdNamespace): string {
  return `${namespace}_${randomUUID()}`;
}

export function isNamespacedId(id: string, namespace: IdNamespace): boolean {
  return id.startsWith(`${namespace}_`);
}
