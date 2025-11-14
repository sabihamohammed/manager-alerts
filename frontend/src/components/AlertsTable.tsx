import React from 'react'
import type { Alert } from '../api'

export default function AlertsTable({
  alerts,
  onDismiss
}: {
  alerts: Alert[]
  onDismiss: (id: string) => void
}) {
  function chipColor(sev: Alert['severity']) {
    return sev === 'high'
      ? '#ef4444'
      : sev === 'medium'
      ? '#f59e0b'
      : '#10b981'
  }

  return (
    <table width="100%" cellPadding={8} style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>Employee</th>
          <th>Category</th>
          <th>Severity</th>
          <th>Status</th>
          <th>Created</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {alerts.map(a => (
          <tr key={a.id} style={{ borderTop: '1px solid #eee' }}>
            <td>{a.employee.name}</td>
            <td>{a.category}</td>

            <td>
              <span style={{
                background: chipColor(a.severity),
                color: 'white',
                padding: '2px 8px',
                borderRadius: 12
              }}>
                {a.severity}
              </span>
            </td>

            <td>{a.status}</td>
            <td>{new Date(a.created_at).toISOString()}</td>

            <td>
              <button
                disabled={a.status === 'dismissed'}
                onClick={() => onDismiss(a.id)}
              >
                Dismiss
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
