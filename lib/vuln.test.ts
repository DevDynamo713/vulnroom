import { describe, it, expect } from 'vitest';
import { cvssToSeverity, priorityScore, formatVuln } from './vuln';
describe('vuln', () => {
  it('cvss 9.5 → critical', () => { expect(cvssToSeverity(9.5)).toBe('critical'); });
  it('cvss 7.5 → high', () => { expect(cvssToSeverity(7.5)).toBe('high'); });
  it('cvss 5.0 → medium', () => { expect(cvssToSeverity(5.0)).toBe('medium'); });
  it('cvss 2.0 → low', () => { expect(cvssToSeverity(2.0)).toBe('low'); });
  it('priority unfixed > fixed', () => {
    const unfixed = { id: '1', title: 't', component: 'c', severity: 'high', cvss: 7.5, fixed: false };
    const fixed = { id: '2', title: 't', component: 'c', severity: 'high', cvss: 7.5, fixed: true };
    expect(priorityScore(unfixed)).toBeGreaterThan(priorityScore(fixed));
  });
  it('priority caps at 100', () => {
    const v = { id: '1', title: 't', component: 'c', severity: 'critical', cvss: 10.0, fixed: false };
    expect(priorityScore(v)).toBe(100);
  });
  it('formats with cve', () => {
    const v = { id: '1', cveId: 'CVE-2026-1234', title: 'RCE', component: 'libx', severity: 'critical', cvss: 9.8, fixed: false };
    expect(formatVuln(v)).toBe('CVE-2026-1234: RCE in libx [CVSS 9.8] priority:100');
  });
  it('formats without cve', () => {
    const v = { id: '2', title: 'XSS', component: 'ui', severity: 'medium', cvss: 5.0, fixed: true };
    expect(formatVuln(v)).toBe('N/A: XSS in ui [CVSS 5] priority:50');
  });
});