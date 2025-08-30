"use client"
import { useRouter } from "next/navigation"
import { useContext, useMemo, useState } from "react"
import { TaxationContext } from "@/contexts/TaxationContext"
import { cn } from "@/lib/utils"

const statuses = ["Active", "Inactive", "Pending"]

export default function CustomersSection() {
  const router = useRouter()
  const { customers, updateCustomerStatus } = useContext(TaxationContext)
  const [editing, setEditing] = useState(null)
  const [statusDraft, setStatusDraft] = useState("")

  const columns = useMemo(() => ["Name", "Email", "Documents", "Returns", "Status", "Actions"], [])

  function onRowClick(id) {
    router.push(`/dashboard/customers/${id}`)
  }

  async function onSave(id) {
    await updateCustomerStatus(id, statusDraft || "Active")
    setEditing(null)
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-semibold">Customers</h2>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((c) => (
                <th key={c} className="px-3 py-2 text-left font-medium text-muted-foreground">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t hover:bg-accent/50">
                <td className="px-3 py-2">
                  <button className="text-left hover:underline" onClick={() => onRowClick(c.id)}>
                    {c.name}
                  </button>
                </td>
                <td className="px-3 py-2">{c.email}</td>
                <td className="px-3 py-2">{c.documents}</td>
                <td className="px-3 py-2">{c.returns}</td>
                <td className="px-3 py-2">
                  {editing === c.id ? (
                    <select
                      className="rounded border bg-background px-2 py-1"
                      value={statusDraft || c.status}
                      onChange={(e) => setStatusDraft(e.target.value)}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-xs",
                        c.status === "Active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700",
                      )}
                    >
                      {c.status}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {editing === c.id ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => onSave(c.id)} className="rounded bg-foreground px-2 py-1 text-background">
                        Save
                      </button>
                      <button onClick={() => setEditing(null)} className="rounded border px-2 py-1">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditing(c.id)
                        setStatusDraft(c.status)
                      }}
                      className="rounded border px-2 py-1"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-sm text-muted-foreground">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
