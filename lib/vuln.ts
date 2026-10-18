export type Severity = 'low' | 'medium' | 'high' | 'critical';
export interface Vulnerability { id: string; cveId?: string; title: string; component: string; severity: Severity; cvss: number; fixed: boolean }
export function cvssToSeverity(cvss: number): Severity {
  if (cvss >= 9.0) return 'critical';
  if (cvss >= 7.0) return 'high';
  if (cvss >= 4.0) return 'medium';
  return 'low';
}
export function priorityScore(v: Vulnerability): number {
  const base = v.cvss * 10;
  const unfixedBonus = v.fixed ? 0 : 20;
  return Math.min(100, base + unfixedBonus);
}
export function formatVuln(v: Vulnerability): string { return `${v.cveId || 'N/A'}: ${v.title} in ${v.component} [CVSS ${v.cvss}] priority:${priorityScore(v)}`; }