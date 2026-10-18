"use client";
import { useState, useEffect, useRef } from 'react';
export default function Room({ params }: { params: { id: string } }) {
  const [vulns, setVulns] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [component, setComponent] = useState('');
  const [cvss, setCvss] = useState('');
  const [cveId, setCveId] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const ws = new WebSocket(`wss://vulnroom.devdynamo713.com/room/${params.id}/ws`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'vuln') {
        setVulns(prev => [...prev, data.data]);
      }
    };
    wsRef.current = ws;
    const poll = setInterval(async () => {
      const res = await fetch(`https://vulnroom.devdynamo713.com/room/${params.id}/vulns`);
      if (res.ok) setVulns(await res.json());
    }, 3000);
    return () => { ws.close(); clearInterval(poll); };
  }, [params.id]);
  const addVuln = async () => {
    const cvssNum = parseFloat(cvss);
    const severity = cvssNum >= 9 ? 'critical' : cvssNum >= 7 ? 'high' : cvssNum >= 4 ? 'medium' : 'low';
    const data = { id: Date.now().toString(), title, component, cvss: cvssNum, severity, cveId: cveId || undefined };
    await fetch(`https://vulnroom.devdynamo713.com/room/${params.id}/vuln`, { method: 'POST', body: JSON.stringify(data) });
    setTitle(''); setComponent(''); setCvss(''); setCveId('');
  };
  const colorMap: Record<string, string> = { critical: '#f87171', high: '#fb923c', medium: '#fbbf24', low: '#60a5fa' };
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', background: '#0a0a0a', color: '#e5e5e5', minHeight: '100vh' }}>
      <h1>VulnRoom: {params.id}</h1>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="vulnerability title" className="title-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <input value={component} onChange={(e) => setComponent(e.target.value)} placeholder="component" className="component-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <input value={cvss} onChange={(e) => setCvss(e.target.value)} placeholder="CVSS (0-10)" className="cvss-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa', width: 100 }} />
        <input value={cveId} onChange={(e) => setCveId(e.target.value)} placeholder="CVE ID (optional)" className="cve-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <button className="add-btn" onClick={addVuln} disabled={!title.trim() || !component.trim() || !cvss} style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Log Vuln</button>
      </div>
      <div className="vuln-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {vulns.map(v => (
          <div key={v.id} style={{ padding: 16, border: `1px solid ${colorMap[v.severity] || '#27272a'}`, borderRadius: 12, background: '#09090b' }}>
            <strong style={{ fontSize: 18, color: colorMap[v.severity] }}>{v.title}</strong>
            <div style={{ marginTop: 4, color: '#a1a1aa', fontSize: 13 }}>Component: {v.component}</div>
            {v.cveId && <div style={{ marginTop: 4, color: '#60a5fa', fontSize: 13 }}>{v.cveId}</div>}
            <div style={{ marginTop: 4, color: '#a1a1aa', fontSize: 13 }}>CVSS: {v.cvss}</div>
            <div style={{ marginTop: 4, fontWeight: 'bold', color: colorMap[v.severity] }}>{v.severity.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}