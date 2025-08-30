"use client"
import { useContext, useMemo, useState } from "react"
import { TaxationContext } from "@/contexts/TaxationContext"

export default function PaymentsSection() {
  const { payments } = useContext(TaxationContext)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("All")

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const okStatus = status === "All" ? true : p.status === status
      const q = query.toLowerCase()
      const okQuery = !q || p.customerName.toLowerCase().includes(q)
      return okStatus && okQuery
    })
  }, [payments, query, status])

  const total = useMemo(() => filtered.reduce((sum, p) => sum + (Number(p.amount) || 0), 0), [filtered])

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Payments</h2>
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="w-64 rounded border bg-background px-2 py-1 text-sm"
          placeholder="Search by customer..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="rounded border bg-background px-2 py-1 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>All</option>
          <option>Received</option>
          <option>Failed</option>
          <option>Pending</option>
        </select>
        <div className="ml-auto text-sm">
          Total Received: <span className="font-semibold">${total.toLocaleString()}</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Customer</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Amount</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-3 py-2">{p.customerName}</td>
                <td className="px-3 py-2">${Number(p.amount).toLocaleString()}</td>
                <td className="px-3 py-2">{p.status}</td>
                <td className="px-3 py-2">{new Date(p.date).toLocaleString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-sm text-muted-foreground" colSpan={4}>
                  No payments match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
