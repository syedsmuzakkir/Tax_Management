"use client"

import { createContext, useContext, useState, useEffect } from "react"

const TaxationContext = createContext()

export { TaxationContext }

export const useTaxation = () => {
  const context = useContext(TaxationContext)
  if (!context) {
    throw new Error("useTaxation must be used within a TaxationProvider")
  }
  return context
}

export const TaxationProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [authToken, setAuthToken] = useState(null)

  const normalizeUser = (u) => {
    if (!u || typeof u !== "object") return null
    const id = u.id === 0 || u.id === "0" || (u.id != null && !Number.isNaN(Number(u.id))) ? Number(u.id) : undefined
    return {
      ...u,
      id, // coerce to number when possible
      role: u?.role ?? "user",
      name: u?.name || u?.email || "User",
    }
  }

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const savedUser = localStorage.getItem("taxPro_currentUser")
        const authStatus = localStorage.getItem("taxPro_isAuthenticated")
        const savedToken = localStorage.getItem("taxPro_authToken")

        if (savedUser && authStatus === "true" && savedToken) {
          const parsed = JSON.parse(savedUser)
          const normalized = normalizeUser(parsed)
          if (normalized && normalized.id != null) {
            setCurrentUser(normalized)
            setAuthToken(savedToken)
            setIsAuthenticated(true)
          } else {
            // corrupted entry, clear storage
            localStorage.removeItem("taxPro_currentUser")
            localStorage.removeItem("taxPro_authToken")
            localStorage.removeItem("taxPro_isAuthenticated")
          }
        }
      } catch (error) {
        console.error("Error checking auth status:", error)
        localStorage.removeItem("taxPro_currentUser")
        localStorage.removeItem("taxPro_authToken")
        localStorage.removeItem("taxPro_isAuthenticated")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = (apiResponse) => {
    try {
      const { user, token } = apiResponse || {}
      const normalizedUser = normalizeUser(user)

      if (!normalizedUser || normalizedUser.id == null || !token) {
        // guard against invalid payloads
        throw new Error("Invalid login response")
      }

      setCurrentUser(normalizedUser)
      setAuthToken(token)
      setIsAuthenticated(true)

      localStorage.setItem("taxPro_currentUser", JSON.stringify(normalizedUser))
      localStorage.setItem("taxPro_authToken", token)
      localStorage.setItem("taxPro_isAuthenticated", "true")
    } catch (error) {
      console.error("Error saving auth data:", error)
    }
  }

  const logout = () => {
    setCurrentUser(null)
    setAuthToken(null)
    setIsAuthenticated(false)

    localStorage.removeItem("taxPro_currentUser")
    localStorage.removeItem("taxPro_authToken")
    localStorage.removeItem("taxPro_isAuthenticated")
  }

  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@email.com",
      role: "user",
      status: "active",
      joinDate: "2024-01-15",
      phone: "+1 (555) 123-4567",
      address: "123 Main St, Anytown, ST 12345",
      totalReturns: 3,
      totalPaid: 750.0,
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@email.com",
      role: "user",
      status: "active",
      joinDate: "2024-02-20",
      phone: "+1 (555) 987-6543",
      address: "456 Oak Ave, Another City, ST 67890",
      totalReturns: 2,
      totalPaid: 500.0,
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.johnson@email.com",
      role: "preparer",
      status: "active",
      joinDate: "2023-11-10",
      phone: "+1 (555) 456-7890",
      address: "789 Pine St, Tax City, ST 11111",
      totalReturns: 15,
      totalPaid: 0.0,
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah.wilson@email.com",
      role: "reviewer",
      status: "active",
      joinDate: "2023-12-05",
      phone: "+1 (555) 321-0987",
      address: "321 Elm St, Review Town, ST 22222",
      totalReturns: 8,
      totalPaid: 0.0,
    },
  ])

  const [taxReturns, setTaxReturns] = useState([
    {
      id: 1,
      userId: 1,
      userName: "John Doe",
      type: "1040",
      year: "2023",
      status: "Filed",
      dateCreated: "2024-01-20",
      dateUpdated: "2024-02-15",
      assignedTo: "Mike Johnson",
      documents: [
        {
          id: 1,
          name: "W-2 Form.pdf",
          type: "pdf",
          size: "245 KB",
          uploadDate: "2024-01-20",
          comments: "Primary W-2 from employer",
        },
        {
          id: 2,
          name: "1099-DIV.pdf",
          type: "pdf",
          size: "156 KB",
          uploadDate: "2024-01-22",
          comments: "Dividend income statement",
        },
      ],
      comments: [
        { id: 1, author: "John Doe", date: "2024-01-20", text: "Initial filing for 2023 tax year" },
        { id: 2, author: "Mike Johnson", date: "2024-02-10", text: "Review completed, ready to file" },
      ],
    },
    {
      id: 2,
      userId: 1,
      userName: "John Doe",
      type: "1065",
      year: "2023",
      status: "Review",
      dateCreated: "2024-02-01",
      dateUpdated: "2024-02-28",
      assignedTo: "Sarah Wilson",
      documents: [
        {
          id: 3,
          name: "Partnership Agreement.pdf",
          type: "pdf",
          size: "1.2 MB",
          uploadDate: "2024-02-01",
          comments: "Partnership formation documents",
        },
        {
          id: 4,
          name: "Business Receipts.pdf",
          type: "pdf",
          size: "890 KB",
          uploadDate: "2024-02-05",
          comments: "Q4 business expenses",
        },
      ],
      comments: [
        { id: 3, author: "John Doe", date: "2024-02-01", text: "Partnership return for new business" },
        { id: 4, author: "Sarah Wilson", date: "2024-02-25", text: "Need additional documentation for Schedule K-1" },
      ],
    },
    {
      id: 3,
      userId: 2,
      userName: "Jane Smith",
      type: "1040",
      year: "2023",
      status: "Preparation started",
      dateCreated: "2024-02-15",
      dateUpdated: "2024-03-01",
      assignedTo: "Mike Johnson",
      documents: [
        {
          id: 5,
          name: "W-2 Form.pdf",
          type: "pdf",
          size: "198 KB",
          uploadDate: "2024-02-15",
          comments: "Employment income",
        },
      ],
      comments: [{ id: 5, author: "Jane Smith", date: "2024-02-15", text: "Standard deduction filing" }],
    },
  ])

  const [invoices, setInvoices] = useState([
    {
      id: 1,
      userId: 1,
      userName: "John Doe",
      returnId: 1,
      amount: 250.0,
      status: "Paid",
      dateIssued: "2024-02-10",
      datePaid: "2024-02-12",
      dueDate: "2024-02-25",
      description: "Tax Return Preparation - Form 1040",
      paymentMethod: "Credit Card",
    },
    {
      id: 2,
      userId: 1,
      userName: "John Doe",
      returnId: 2,
      amount: 500.0,
      status: "Pending",
      dateIssued: "2024-02-28",
      datePaid: null,
      dueDate: "2024-03-15",
      description: "Tax Return Preparation - Form 1065",
      paymentMethod: null,
    },
    {
      id: 3,
      userId: 2,
      userName: "Jane Smith",
      returnId: 3,
      amount: 200.0,
      status: "Overdue",
      dateIssued: "2024-02-20",
      datePaid: null,
      dueDate: "2024-03-05",
      description: "Tax Return Preparation - Form 1040",
      paymentMethod: null,
    },
  ])

  const [activityLogs, setActivityLogs] = useState([
    {
      id: 1,
      userId: 1,
      userName: "John Doe",
      action: "Document Uploaded",
      details: "Uploaded W-2 Form.pdf for 2023 Tax Return",
      timestamp: "2024-01-20 10:30:00",
      returnId: 1,
    },
    {
      id: 2,
      userId: 1,
      userName: "John Doe",
      action: "Comment Added",
      details: "Added comment to 2023 Tax Return",
      timestamp: "2024-01-20 10:35:00",
      returnId: 1,
    },
    {
      id: 3,
      userId: 3,
      userName: "Mike Johnson",
      action: "Status Updated",
      details: 'Changed status from "Review" to "Filed" for John Doe\'s 2023 Tax Return',
      timestamp: "2024-02-15 14:20:00",
      returnId: 1,
    },
    {
      id: 4,
      userId: 1,
      userName: "John Doe",
      action: "Payment Made",
      details: "Paid invoice #1 - $250.00",
      timestamp: "2024-02-12 09:15:00",
      returnId: 1,
    },
  ])

  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@email.com",
      documents: 5,
      returns: 2,
      status: "Active",
      mobile: "+1 (555) 111-2222",
      ssn: "123-45-6789",
      returnType: "1040",
      pricingModel: "lump",
      price: 250,
      createdAt: "2024-01-15T09:30:00Z",
      updatedAt: "2024-02-20T11:00:00Z",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@email.com",
      documents: 3,
      returns: 1,
      status: "Pending",
      mobile: "+1 (555) 333-4444",
      ssn: "987-65-4321",
      returnType: "1040",
      pricingModel: "hourly",
      price: 100,
      createdAt: "2024-02-05T12:00:00Z",
      updatedAt: "2024-03-01T08:00:00Z",
    },
  ])

  const [payments, setPayments] = useState([
    { id: 1, customerId: 1, customerName: "John Doe", amount: 250, status: "Received", date: "2024-02-12T09:15:00Z" },
    { id: 2, customerId: 2, customerName: "Jane Smith", amount: 200, status: "Pending", date: "2024-03-06T13:45:00Z" },
    { id: 3, customerId: 1, customerName: "John Doe", amount: 150, status: "Received", date: "2024-04-01T10:10:00Z" },
  ])

  const addTaxReturn = (returnData) => {
    const newReturn = {
      id: taxReturns.length + 1,
      userId: currentUser?.id || 1,
      userName: currentUser?.name || "Unknown User",
      status: "Uploaded documents",
      dateCreated: new Date().toISOString().split("T")[0],
      dateUpdated: new Date().toISOString().split("T")[0],
      assignedTo: null,
      documents: [],
      comments: [],
      ...returnData,
    }
    setTaxReturns((prev) => [...prev, newReturn])
    addActivityLog("Tax Return Created", `Created new ${returnData.type} return for ${returnData.year}`, newReturn.id)
    return newReturn
  }

  const updateTaxReturn = (returnId, updates) => {
    setTaxReturns((prev) =>
      prev.map((ret) =>
        ret.id === returnId ? { ...ret, ...updates, dateUpdated: new Date().toISOString().split("T")[0] } : ret,
      ),
    )
    addActivityLog("Tax Return Updated", `Updated tax return #${returnId}`, returnId)
  }

  const addDocument = (returnId, document) => {
    const newDoc = {
      id: Date.now(),
      uploadDate: new Date().toISOString().split("T")[0],
      comments: "",
      ...document,
    }

    setTaxReturns((prev) =>
      prev.map((ret) => (ret.id === returnId ? { ...ret, documents: [...ret.documents, newDoc] } : ret)),
    )
    addActivityLog("Document Uploaded", `Uploaded ${document.name}`, returnId)
    return newDoc
  }

  const addComment = (returnId, comment) => {
    const newComment = {
      id: Date.now(),
      author: currentUser?.name || "Unknown User",
      date: new Date().toISOString().split("T")[0],
      text: comment,
    }

    setTaxReturns((prev) =>
      prev.map((ret) => (ret.id === returnId ? { ...ret, comments: [...ret.comments, newComment] } : ret)),
    )
    addActivityLog("Comment Added", `Added comment to tax return #${returnId}`, returnId)
    return newComment
  }

  const addUser = (userData) => {
    const newUser = {
      id: users.length + 1,
      joinDate: new Date().toISOString().split("T")[0],
      status: "active",
      totalReturns: 0,
      totalPaid: 0.0,
      ...userData,
    }
    setUsers((prev) => [...prev, newUser])
    addActivityLog("User Created", `Created new user: ${userData.name}`)
    return newUser
  }

  const updateUser = (userId, updates) => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, ...updates } : user)))
    addActivityLog("User Updated", `Updated user information for user #${userId}`)
  }

  const generateInvoice = (userId, returnId, amount, description) => {
    const user = users.find((u) => u.id === userId)
    const newInvoice = {
      id: invoices.length + 1,
      userId,
      userName: user?.name || "Unknown User",
      returnId,
      amount,
      status: "Pending",
      dateIssued: new Date().toISOString().split("T")[0],
      datePaid: null,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      description,
      paymentMethod: null,
    }
    setInvoices((prev) => [...prev, newInvoice])
    addActivityLog("Invoice Generated", `Generated invoice #${newInvoice.id} for $${amount}`, returnId)
    return newInvoice
  }

  const processPayment = (invoiceId, paymentMethod) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: "Paid",
              datePaid: new Date().toISOString().split("T")[0],
              paymentMethod,
            }
          : inv,
      ),
    )
    const invoice = invoices.find((inv) => inv.id === invoiceId)
    if (invoice) {
      addActivityLog(
        "Payment Processed",
        `Payment of $${invoice.amount} processed for invoice #${invoiceId}`,
        invoice.returnId,
      )
    }
  }

  const addActivityLog = (action, details, returnId = null) => {
    const newLog = {
      id: activityLogs.length + 1,
      userId: currentUser?.id || 1,
      userName: currentUser?.name || "Unknown User",
      action,
      details,
      timestamp: new Date().toLocaleString(),
      returnId,
    }
    setActivityLogs((prev) => [newLog, ...prev])
  }

  const switchUserRole = (role) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, role }
      setCurrentUser(updatedUser)
      localStorage.setItem("taxPro_currentUser", JSON.stringify(updatedUser))
    }
  }

  const updateCustomerStatus = (customerId, status) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, status, updatedAt: new Date().toISOString() } : c)),
    )
    addActivityLog("Customer Updated", `Updated status for customer #${customerId}`)
  }

  const updateCustomerPricing = (customerId, { pricingModel, price }) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, pricingModel, price, updatedAt: new Date().toISOString() } : c)),
    )
    addActivityLog("Customer Pricing Updated", `Updated pricing for customer #${customerId}`)
  }

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    authToken,

    currentUser,
    currentUserId: currentUser?.id ?? null, // convenience and null-safe
    users,
    taxReturns,
    invoices,
    activityLogs,

    customers,
    payments,
    updateCustomerStatus,
    updateCustomerPricing,

    addTaxReturn,
    updateTaxReturn,
    addDocument,
    addComment,
    addUser,
    updateUser,
    generateInvoice,
    processPayment,
    addActivityLog,
    switchUserRole,

    setUsers,
    setTaxReturns,
    setInvoices,
    setActivityLogs,
    setCustomers,
    setPayments,
  }

  return <TaxationContext.Provider value={value}>{children}</TaxationContext.Provider>
}
