"use client"
import { useRouter } from "next/navigation"
import { useContext, useMemo, useState } from "react"
import { TaxationContext } from "@/contexts/TaxationContext"
import { cn } from "@/lib/utils"

const statuses = ["Active", "Inactive", "Pending"]
const returnTypes = ["1040", "1120", "1065", "1041", "709"]
const pricingTypes = ["Hourly", "Lumpsum"]
const documentTypes = ["W-2", "1099", "Receipts", "Invoices", "Bank Statements"]
const paymentStatuses = ["Paid", "Pending", "Overdue", "Partial"]

// Generate dummy documents for demo
const generateDummyDocuments = () => {
  return [
    {
      id: 1,
      name: "W-2 Form 2023",
      type: "W-2",
      uploadedAt: "2024-02-15",
      size: "2.4 MB",
      url: "#"
    },
    {
      id: 2,
      name: "Investment Statement",
      type: "Bank Statements",
      uploadedAt: "2024-02-18",
      size: "1.8 MB",
      url: "#"
    },
    {
      id: 3,
      name: "Business Expense Receipts",
      type: "Receipts",
      uploadedAt: "2024-02-20",
      size: "3.2 MB",
      url: "#"
    }
  ]
}

// Generate dummy payment history
const generateDummyPayments = () => {
  return [
    {
      id: 1,
      date: "2024-02-28",
      description: "Tax Preparation Fee - 1040",
      amount: 450.00,
      status: "Paid",
      method: "Credit Card"
    },
    {
      id: 2,
      date: "2024-02-15",
      description: "Consultation Fee",
      amount: 150.00,
      status: "Paid",
      method: "Bank Transfer"
    }
  ]
}

// Generate dummy returns with proper price values
const generateDummyReturns = (customerId) => {
  return [
    {
      id: 1,
      name: "2023 Individual Tax Return",
      documentType: "1040",
      pricing: "Lumpsum",
      createdAt: "2024-02-10",
      status: "Completed",
      price: 450.00
    },
    {
      id: 2,
      name: "2022 Amendment",
      documentType: "1040X",
      pricing: "Hourly",
      createdAt: "2024-01-15",
      status: "In Progress",
      price: 200.00
    }
  ]
}

// Fallback function for updateReturnPricing
const fallbackUpdateReturnPricing = async (returnId, pricing) => {
  console.log(`Fallback: Updating return ${returnId} to ${pricing}`);
  // Simulate API call
  return new Promise(resolve => setTimeout(resolve, 300));
};

export default function CustomersSection() {
  const router = useRouter()
  const taxationContext = useContext(TaxationContext)
  
  // Safely extract values from context with fallbacks
  const customers = taxationContext?.customers || []
  const updateCustomerStatus = taxationContext?.updateCustomerStatus || (() => {})
  
  // Check if updateReturnPricing exists, otherwise use fallback
  const updateReturnPricing = taxationContext?.updateReturnPricing 
    ? taxationContext.updateReturnPricing 
    : fallbackUpdateReturnPricing

  const [editing, setEditing] = useState(null)
  const [statusDraft, setStatusDraft] = useState("")
  const [expandedRows, setExpandedRows] = useState({})
  const [editingReturn, setEditingReturn] = useState(null)
  const [pricingDraft, setPricingDraft] = useState("")
  const [updatedReturns, setUpdatedReturns] = useState({})

  const columns = useMemo(() => ["", "Name", "Email", "Documents", "Returns", "Status", "Actions"], [])

  function toggleRowExpansion(id) {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  async function onSave(id) {
    try {
      await updateCustomerStatus(id, statusDraft || "Active")
      setEditing(null)
    } catch (error) {
      console.error("Failed to update customer status:", error)
    }
  }

  // Generate returns - check if we have updated pricing first
  const generateReturns = (customerId) => {
    const defaultReturns = generateDummyReturns(customerId);
    
    // If we have updated returns for this customer, use them
    if (updatedReturns[customerId]) {
      return defaultReturns.map(returnItem => {
        const updatedReturn = updatedReturns[customerId].find(r => r.id === returnItem.id);
        // Make sure we have all required properties
        return updatedReturn ? {...returnItem, ...updatedReturn} : returnItem;
      });
    }
    
    return defaultReturns;
  }

  async function onSavePricing(returnId, customerId) {
    if (!pricingDraft) {
      console.error("No pricing value selected");
      return;
    }
    
    try {
      console.log(`Updating return ${returnId} to ${pricingDraft}`);
      
      // Update in the backend (or fallback)
      await updateReturnPricing(returnId, pricingDraft);
      
      // Update local state to reflect the change in UI
      setUpdatedReturns(prev => {
        const customerReturns = prev[customerId] || [];
        const existingReturnIndex = customerReturns.findIndex(r => r.id === returnId);
        
        if (existingReturnIndex >= 0) {
          // Update existing return
          const updated = [...customerReturns];
          updated[existingReturnIndex] = {
            ...updated[existingReturnIndex],
            pricing: pricingDraft
          };
          return {
            ...prev,
            [customerId]: updated
          };
        } else {
          // Add new return with updated pricing
          return {
            ...prev,
            [customerId]: [
              ...customerReturns,
              { id: returnId, pricing: pricingDraft }
            ]
          };
        }
      });
      
      setEditingReturn(null);
      setPricingDraft("");
    } catch (error) {
      console.error("Failed to update pricing:", error);
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Customer Management</h2>
        <p className="text-sm text-gray-500 mt-1">View and manage all customer accounts</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                {columns.map((c) => (
                  <th key={c} className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((c) => {
                const documentList = generateDummyDocuments()
                const paymentHistory = generateDummyPayments()
                const returnsList = generateReturns(c.id)
                
                // Calculate total paid amount
                const totalPaid = paymentHistory
                  .filter(payment => payment.status === "Paid")
                  .reduce((sum, payment) => sum + payment.amount, 0)

                // Calculate pending amount
                const totalPending = paymentHistory
                  .filter(payment => payment.status !== "Paid")
                  .reduce((sum, payment) => sum + payment.amount, 0)
                  
                return (
                  <>
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => toggleRowExpansion(c.id)}
                          className="transition-transform duration-200 p-1 rounded-md hover:bg-gray-100"
                          style={{
                            transform: expandedRows[c.id] ? 'rotate(180deg)' : 'rotate(0deg)'
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-left font-medium text-gray-800 hover:text-blue-600 transition-colors" onClick={() => toggleRowExpansion(c.id)}>
                          {c.name}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                          {documentList.length}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                          {returnsList.length}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {editing === c.id ? (
                          <select
                            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                              c.status === "Active" ? "bg-green-100 text-green-800" : 
                              c.status === "Inactive" ? "bg-gray-100 text-gray-800" : 
                              "bg-yellow-100 text-yellow-800"
                            )}
                          >
                            {c.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editing === c.id ? (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => onSave(c.id)} 
                              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setEditing(null)} 
                              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50 focus:outline-none focus:ring-极速2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditing(c.id)
                              setStatusDraft(c.status)
                            }}
                            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                    
                    {/* Expanded details row */}
                    {expandedRows[c.id] && (
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="px-4 py-6">
                          <div className="grid grid-cols-1 gap-8 md:极速grid-cols-2">
                            <div>
                              <h3 className="mb-4 text-base font-semibold text-gray-800 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 极速0H3z" clipRule="evenodd" />
                                </svg>
                                Personal Information
                              </h3>
                              <div className="space-y-4 text-sm">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Name</p>
                                  <p className="font-medium text-gray-800">{c.name}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Email</p>
                                  <p className="font-medium text-gray-800">{c.email}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">SSN</p>
                                  <p className="font-medium text-gray-800">XXX-XX-1234</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Mobile Number</p>
                                  <p className="font-medium text-gray-800">(555) 123-4567</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Return Type</p>
                                  <p className="font-medium text-gray-800">1040</p>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="mb-4 text-base font-semibold text-gray-800 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                System Information
                              </h3>
                              <div className="space-y-4 text-sm">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Customer Since</p>
                                  <p className="font-medium text-gray-800">Jan 15, 2023</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                                  <p className="font-medium text-gray-800">Feb 28, 2024</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Total Documents</p>
                                  <p className="font-medium text-gray-800">{documentList.length}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Total Returns</p>
                                  <p className="font-medium text-gray-800">{returnsList.length}</p>
                                </div>
                              </div>
                              
                              <h3 className="mb-4 mt-6 text-base font-semibold text-gray-800 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                  <path fillRule="evenodd" d="M18 9H极速2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1极速h1a1 1 0 110 2H5a1 1 极速0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                                </svg>
                                Payment Summary
                              </h3>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
                                  <p className="text-xs text-blue-700 mb-1">Total Paid</p>
                                  <p className="font-bold text-blue-900 text-lg">${totalPaid.toFixed(2)}</p>
                                </div>
                                <div className="rounded-lg bg-amber-50 p-4 border border-amber-100">
                                  <p className="text-xs text-amber-700 mb-1">Pending</p>
                                  <p className="font-bold text-amber-900 text-lg">${totalPending.toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-8">
                            <h3 className="mb-4 text-base font-semibold text-gray-800 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" viewBox="0 0 20 20" fill="current极速Color">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2极速H4a1 1 0 01-1-1z" clipRule="evenodd" />
                              </svg>
                              Returns
                            </h3>
                            {returnsList.length > 0 ? (
                              <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="w-full text-xs">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-3 py-2.5 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">Return Name</th>
                                      <th className="px-3 py-2.5 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">Document Type</th>
                                      <th className="px-3 py-2.5 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">Pricing</th>
                                      <th className="px-3 py-2.5 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">Amount</th>
                                      <th className="px-3 py-2.5 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">Created</th>
                                      <th className="px-3 py-2.5 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">Status</th>
                                      <th className="px-3 py-2.5 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200 bg-white">
                                    {returnsList.map((r) => {
                                      // Ensure price is always a valid number
                                      const price = r.price || 0;
                                      return (
                                        <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                          <td className="px-3 py-2.5 font-medium text-gray-800">{r.name}</td>
                                          <td className="px-3 py-2.5 text-gray-600">{r.documentType}</td>
                                          <td className="px-3 py-2.5">
                                            {editingReturn === r.id ? (
                                              <select
                                                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                value={pricingDraft || r.pricing}
                                                onChange={(e) => setPricingDraft(e.target.value)}
                                              >
                                                {pricingTypes.map((p) => (
                                                  <option key={p} value={p}>
                                                    {p}
                                                  </option>
                                                ))}
                                              </select>
                                            ) : (
                                              <span className="text-gray-600">{r.pricing}</span>
                                            )}
                                          </td>
                                          <td className="px-3 py-2.5 font-medium text-gray-800">${price.toFixed(2)}</td>
                                          <td className="px-3 py-2.5 text-gray-600">
                                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A"}
                                          </td>
                                          <td className="px-3 py-2.5">
                                            <span
                                              className={cn(
                                                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                                r.status === "Completed" 
                                                  ? "bg-green-100 text-green-800" 
                                                  : r.status === "In Progress"
                                                  ? "bg-blue-100 text-blue-800"
                                                  : "bg-yellow-100 text-yellow-800",
                                              )}
                                            >
                                              {r.status}
                                            </span>
                                          </td>
                                          <td className="px-3 py-2.5">
                                            {editingReturn === r.id ? (
                                              <div className="flex items-center gap-1.5">
                                                <button 
                                                  onClick={() => onSavePricing(r.id, c.id)} 
                                                  className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white shadow-xs hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                                                >
                                                  Save
                                                </button>
                                                <button 
                                                  onClick={() => {
                                                    setEditingReturn(null)
                                                    setPricingDraft("")
                                                  }} 
                                                  className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                                                >
                                                  Cancel
                                                </button>
                                              </div>
                                            ) : (
                                              <button
                                                onClick={() => {
                                                  setEditingReturn(r.id)
                                                  setPricingDraft(r.pricing)
                                                }}
                                                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                                              >
                                                Edit Pricing
                                              </button>
                                            )}
                                          </td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="极速h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="mt-2 text-sm text-gray-500">No returns filed yet.</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-8">
                            <h3 className="mb-4 text-base font-semibold text-gray-800 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                              Documents
                            </h3>
                            {documentList.length > 0 ? (
                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {documentList.map((doc) => (
                                  <div key={doc.id} className="rounded-lg border border-gray-200 p-4 transition-all hover:shadow-sm">
                                    <div className="mb-3 flex items-center justify-between">
                                      <span className="font-medium text-gray-800 truncate">{doc.name}</span>
                                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                                        {doc.type}
                                      </span>
                                    </div>
                                    <p className="mb-4 text-xs text-gray-500">
                                      Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()} • {doc.size}
                                    </p>
                                    <div className="flex gap-2">
                                      <button className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white shadow-xs hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 transition-colors">
                                        View
                                      </button>
                                      <button className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs极速 font-medium text-gray-700 shadow-xs hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 transition-colors">
                                        Download
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="rounded-lg border border-dashed border-gray-300 p-极速6 text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16极速h10M7 8h3m-3 4h10M7 12h6m4-6v6m3-3v6m-3-3h6M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" />
                                </svg>
                                <p className="mt-2 text-sm text-gray-500">No documents uploaded yet.</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2极速c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 极速3 3 0 016 0zm6 3a2 2 0 11-4 极速0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="mt-4 text-sm text-gray-500">No customers yet.</p>
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