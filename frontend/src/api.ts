export type Alert = {
    id: string
    employee: { id: string; name: string }
    severity: 'low' | 'medium' | 'high'
    category: string
    created_at: string
    status: 'open' | 'dismissed'
  }
  
  export async function fetchAlerts(params: Record<string, string>) {
    const qs = new URLSearchParams(params)
    const res = await fetch(`http://localhost:8000/api/alerts?${qs.toString()}`)
    if (!res.ok) throw new Error(await res.text())
    return (await res.json()) as Alert[]
  }
  
  export async function dismissAlert(id: string) {
    const res = await fetch(`http://localhost:8000/api/alerts/${id}/dismiss`, {
      method: 'POST',
    })
    if (!res.ok) throw new Error(await res.text())
    return (await res.json()) as Alert
  }
  