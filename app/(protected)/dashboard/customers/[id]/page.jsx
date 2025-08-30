"use client"
import { useContext, useMemo, useState } from "react"
import { TaxationContext } from "@/contexts/TaxationContext"

export default function CustomerDetailPage({ params }) {
  const id = Number(params.id)
  const { customers, taxReturns, updateCustomerPricing } = useContext(TaxationContext)
  const customer = customers.find((c) => c.id === id)
  const custReturns = useMemo(() => taxReturns.filter((r) => r.userId === id), [taxReturns, id])

  const [pricingModel, setPricingModel] = useState(customer?.pricingModel || "lump")
  const [price, setPrice] = useState(customer?.price || 0)
  const [saving, setSaving] = useState(false)

  if (!customer) {
    return <div className="p-4">Customer not found.</div>
  }

  async function onSave() {
    setSaving(true)
    await updateCustomerPricing(customer.id, { pricingModel, price: Number(price) || 0 })
    setSaving(false)
  }

  return (
    <div className="space-y-6 p-4">
      <div className="rounded-md border p-4">
        <h2 className="text-lg font-semibold">Customer Info</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <div className="text-xs text-muted-foreground">Name</div>
            <div className="font-medium">{customer.name}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Email</div>
            <div className="font-medium">{customer.email}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Mobile</div>
            <div className="font-medium">{customer.mobile}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">SSN</div>
            <div className="font-medium">{customer.ssn}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Return Type</div>
            <div className="font-medium">{customer.returnType}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Status</div>
            <div className="font-medium">{customer.status}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Created</div>
            <div className="font-medium">{new Date(customer.createdAt).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Updated</div>
            <div className="font-medium">{new Date(customer.updatedAt).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="rounded-md border p-4">
        <h3 className="text-base font-semibold">Pricing</h3>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="text-sm">Model</label>
          <select
            className="rounded border bg-background px-2 py-1"
            value={pricingModel}
            onChange={(e) => setPricingModel(e.target.value)}
          >
            <option value="lump">Lump Sum</option>
            <option value="hourly">Hourly</option>
          </select>
          <label className="text-sm">Amount</label>
          <input
            className="w-28 rounded border bg-background px-2 py-1"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <button disabled={saving} onClick={onSave} className="rounded bg-foreground px-3 py-1 text-background">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="rounded-md border p-4">
        <h3 className="text-base font-semibold">Returns</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Return</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Year</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Documents</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {custReturns.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{r.name || `${r.type}-${r.id}`}</td>
                  <td className="px-3 py-2">{r.type}</td>
                  <td className="px-3 py-2">{r.year}</td>
                  <td className="px-3 py-2">{r.documents?.length ?? 0}</td>
                  <td className="px-3 py-2">{r.status}</td>
                </tr>
              ))}
              {custReturns.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-sm text-muted-foreground" colSpan={5}>
                    No returns found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
