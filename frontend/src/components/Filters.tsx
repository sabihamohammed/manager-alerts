import React from 'react'

type Props = {
  managerId: string
  setManagerId: (v: string) => void
  scope: 'direct' | 'subtree'
  setScope: (v: 'direct' | 'subtree') => void
  severity: string
  setSeverity: (v: string) => void
  q: string
  setQ: (v: string) => void
}

export default function Filters({
  managerId, setManagerId,
  scope, setScope,
  severity, setSeverity,
  q, setQ
}: Props) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
      <label>
        Manager ID<br />
        <input value={managerId} onChange={e => setManagerId(e.target.value)} />
      </label>

      <label>
        Scope<br />
        <select value={scope} onChange={e => setScope(e.target.value as any)}>
          <option value="direct">direct</option>
          <option value="subtree">subtree</option>
        </select>
      </label>

      <label>
        Severity
        <br />
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          <option value="">all</option>
          <option value="high">high</option>

          {/* Hide medium/low when high is selected */}
          {severity !== "high" && <option value="medium">medium</option>}
          {severity !== "high" && <option value="low">low</option>}
        </select>
      </label>


      <label>
        Search employee<br />
        <input value={q} onChange={e => setQ(e.target.value)} />
      </label>
    </div>
  )
}
