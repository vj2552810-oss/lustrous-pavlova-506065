/**
 * Environment helpers shared by server code.
 *
 * Placeholder values copied from `.env.example` (for example `YOUR_API_KEY`)
 * are treated as *not configured*, so optional integrations stay disabled and
 * clearly labelled instead of making doomed outbound calls.
 */

const PLACEHOLDER = /^(your|changeme|replace|xxxx+|todo|<|""|'')/i;

/** Returns the value only when it is present and not an obvious placeholder. */
export function envValue(name: string): string | undefined {
  const raw = process.env[name];
  if (typeof raw !== "string") return undefined;
  const value = raw.trim().replace(/^["']|["']$/g, "");
  if (!value) return undefined;
  if (PLACEHOLDER.test(value)) return undefined;
  return value;
}

export function envFlag(name: string): boolean {
  const value = envValue(name);
  return value === "true" || value === "1";
}

export function envList(names: string[]): Record<string, boolean> {
  return Object.fromEntries(names.map((n) => [n, Boolean(envValue(n))]));
}
