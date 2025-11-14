import React, { useEffect, useMemo, useState } from 'react'
import Filters from './components/Filters'
import AlertsTable from './components/AlertsTable'
import { fetchAlerts, dismissAlert, type Alert } from './api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export default function App() {
  const url = new URL(window.location.href)

  const [managerId, setManagerId] = useState(url.searchParams.get("manager_id") || "E2")
  const [scope, setScope] = useState<'direct' | 'subtree'>(
    (url.searchParams.get("scope") as any) || "direct"
  )
  const [severity, setSeverity] = useState(url.searchParams.get("severity") || "")
  const [q, setQ] = useState(url.searchParams.get("q") || "")

  // keep URL in sync
  useEffect(() => {
    const sp = new URLSearchParams()
    sp.set("manager_id", managerId)
    sp.set("scope", scope)
    if (severity) sp.set("severity", severity)
    if (q) sp.set("q", q)
    history.replaceState(null, "", `?${sp.toString()}`)
  }, [managerId, scope, severity, q])

  const params = useMemo(
    () => ({
      manager_id: managerId,
      scope,
      severity,
      q
    }),
    [managerId, scope, severity, q]
  )

  const key = ["alerts", managerId, scope, severity, q]
  const qc = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: key,
    queryFn: () => fetchAlerts(params),
    retry: false
  })

  const mutation = useMutation({
    mutationFn: (id: string) => dismissAlert(id),

    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: key })

      const previous = qc.getQueryData<Alert[]>(key)

      qc.setQueryData<Alert[]>(key, old =>
        old?.map(a =>
          a.id === id ? { ...a, status: "dismissed" } : a
        )
      )

      return { previous }
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(key, ctx.previous)
      }
    }

    // we **don't** refetch here because the mock backend never
    // actually returns "dismissed", and we want the optimistic state
    // to be the source of truth in this kata
    // onSettled: () => {
    //   qc.invalidateQueries({ queryKey: key })
    // }
  })

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>Manager Alerts</h1>

      <Filters
        managerId={managerId}
        setManagerId={setManagerId}
        scope={scope}
        setScope={setScope}
        severity={severity}
        setSeverity={setSeverity}
        q={q}
        setQ={setQ}
      />

      {isLoading && <p>Loading…</p>}
      {error && <p style={{ color: "red" }}>Error loading alerts</p>}

      {data && (
        <AlertsTable
          alerts={data}
          onDismiss={id => mutation.mutate(id)}
        />
      )}
    </div>
  )
}
