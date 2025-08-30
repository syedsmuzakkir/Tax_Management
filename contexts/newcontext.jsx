"use client"
import { useState, useEffect } from "react"
import { useTaxation } from "@/contexts/TaxationContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { 
  Users, FileText, Shield, Calculator, Eye, Settings, Lock, Search, 
  Plus, Edit, Trash2, Save, X, Key, Activity
} from "lucide-react"

// Permission configuration - centralized authorization rules
const PERMISSIONS = {
  USER_MANAGEMENT: {
    VIEW: 'user_management.view',
    CREATE: 'user_management.create',
    EDIT: 'user_management.edit',
    DELETE: 'user_management.delete',
  },
  TAX_RETURNS: {
    VIEW: 'tax_returns.view',
    CREATE: 'tax_returns.create',
    EDIT: 'tax_returns.edit',
    SUBMIT: 'tax_returns.submit',
    APPROVE: 'tax_returns.approve',
  },
  DOCUMENTS: {
    UPLOAD: 'documents.upload',
    VIEW: 'documents.view',
    DELETE: 'documents.delete',
  },
  BILLING: {
    VIEW: 'billing.view',
    CREATE_INVOICE: 'billing.create_invoice',
    PROCESS_PAYMENT: 'billing.process_payment',
  },
  REPORTS: {
    VIEW: 'reports.view',
    GENERATE: 'reports.generate',
    EXPORT: 'reports.export',
  }
}

// Role definitions with permissions
const ROLE_PERMISSIONS = {
  admin: [
    PERMISSIONS.USER_MANAGEMENT.VIEW,
    PERMISSIONS.USER_MANAGEMENT.CREATE,
    PERMISSIONS.USER_MANAGEMENT.EDIT,
    PERMISSIONS.USER_MANAGEMENT.DELETE,
    PERMISSIONS.TAX_RETURNS.VIEW,
    PERMISSIONS.TAX_RETURNS.CREATE,
    PERMISSIONS.TAX_RETURNS.EDIT,
    PERMISSIONS.TAX_RETURNS.SUBMIT,
    PERMISSIONS.TAX_RETURNS.APPROVE,
    PERMISSIONS.DOCUMENTS.UPLOAD,
    PERMISSIONS.DOCUMENTS.VIEW,
    PERMISSIONS.DOCUMENTS.DELETE,
    PERMISSIONS.BILLING.VIEW,
    PERMISSIONS.BILLING.CREATE_INVOICE,
    PERMISSIONS.BILLING.PROCESS_PAYMENT,
    PERMISSIONS.REPORTS.VIEW,
    PERMISSIONS.REPORTS.GENERATE,
    PERMISSIONS.REPORTS.EXPORT,
  ],
  preparer: [
    PERMISSIONS.TAX_RETURNS.VIEW,
    PERMISSIONS.TAX_RETURNS.CREATE,
    PERMISSIONS.TAX_RETURNS.EDIT,
    PERMISSIONS.TAX_RETURNS.SUBMIT,
    PERMISSIONS.DOCUMENTS.UPLOAD,
    PERMISSIONS.DOCUMENTS.VIEW,
    PERMISSIONS.BILLING.VIEW,
    PERMISSIONS.REPORTS.VIEW,
  ],
  reviewer: [
    PERMISSIONS.TAX_RETURNS.VIEW,
    PERMISSIONS.TAX_RETURNS.APPROVE,
    PERMISSIONS.DOCUMENTS.VIEW,
    PERMISSIONS.BILLING.VIEW,
    PERMISSIONS.REPORTS.VIEW,
  ],
  user: [
    PERMISSIONS.TAX_RETURNS.VIEW,
    PERMISSIONS.DOCUMENTS.UPLOAD,
    PERMISSIONS.DOCUMENTS.VIEW,
    PERMISSIONS.BILLING.VIEW,
  ]
}

// Custom hook for authorization
const useAuthorization = () => {
  const { currentUser } = useTaxation()
  
  const hasPermission = (permission) => {
    if (!currentUser || !currentUser.role) return false
    return ROLE_PERMISSIONS[currentUser.role]?.includes(permission) || false
  }
  
  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => hasPermission(permission))
  }
  
  const hasAllPermissions = (permissions) => {
    return permissions.every(permission => hasPermission(permission))
  }
  
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    currentUser
  }
}

// Higher-Order Component for role-based access
const withAuthorization = (allowedPermissions, Component, FallbackComponent) => {
  return (props) => {
    const { hasAnyPermission } = useAuthorization()
    
    if (hasAnyPermission(allowedPermissions)) {
      return <Component {...props} />
    }
    
    return FallbackComponent ? <FallbackComponent /> : null
  }
}

// Protected component for enterprise applications
const ProtectedComponent = ({ children, requiredPermissions, fallback }) => {
  const { hasAllPermissions } = useAuthorization()
  
  if (hasAllPermissions(requiredPermissions)) {
    return children
  }
  
  return fallback || (
    <div className="flex items-center justify-center p-8 text-center">
      <div>
        <Lock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
          Insufficient Permissions
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          You don't have the required permissions to access this resource.
        </p>
      </div>
    </div>
  )
}

export default function EnterpriseAccessControl() {
  const { currentUser, switchUserRole, users } = useTaxation()
  const { hasPermission } = useAuthorization()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [rolePermissions, setRolePermissions] = useState(ROLE_PERMISSIONS)
  const [editingRole, setEditingRole] = useState(null)
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const handlePermissionChange = (role, permission, enabled) => {
    setRolePermissions(prev => {
      const newPermissions = { ...prev }
      
      if (enabled) {
        newPermissions[role] = [...(newPermissions[role] || []), permission]
      } else {
        newPermissions[role] = (newPermissions[role] || []).filter(p => p !== permission)
      }
      
      return newPermissions
    })
  }
  
  const saveRolePermissions = (role) => {
    // In a real application, you would make an API call here
    console.log(`Saving permissions for ${role}:`, rolePermissions[role])
    setEditingRole(null)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Enterprise Access Control
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Advanced role and permission management system
            </p>
          </div>
          <Badge className="bg-blue-100 text-blue-800">
            <Activity className="h-3 w-3 mr-1" />
            Logged in as: {currentUser?.role}
          </Badge>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="roles">Role Permissions</TabsTrigger>
            <TabsTrigger value="audit">Access Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    System Permissions
                  </CardTitle>
                  <CardDescription>
                    Current permission matrix across all roles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left p-2">Permission</th>
                          {Object.keys(ROLE_PERMISSIONS).map(role => (
                            <th key={role} className="text-center p-2 capitalize">{role}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.values(PERMISSIONS).flatMap(permissionGroup => 
                          Object.values(permissionGroup).map(permission => (
                            <tr key={permission} className="border-t">
                              <td className="p-2 text-xs font-mono">{permission}</td>
                              {Object.keys(ROLE_PERMISSIONS).map(role => (
                                <td key={`${role}-${permission}`} className="text-center p-2">
                                  {ROLE_PERMISSIONS[role].includes(permission) ? (
                                    <div className="inline-block h-3 w-3 rounded-full bg-green-500"></div>
                                  ) : (
                                    <div className="inline-block h-3 w-3 rounded-full bg-slate-300"></div>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="h-5 w-5 mr-2" />
                    Authorization Hook
                  </CardTitle>
                  <CardDescription>
                    Using the useAuthorization hook in components
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <h4 className="font-medium mb-2">Example Usage:</h4>
                      <pre className="text-xs font-mono bg-slate-200 dark:bg-slate-900 p-2 rounded overflow-x-auto">
                        {`const { hasPermission } = useAuthorization();

// Check for specific permission
if (hasPermission(PERMISSIONS.USER_MANAGEMENT.EDIT)) {
  // Show edit button
}

// Check for any of multiple permissions
if (hasAnyPermission([PERMISSIONS.TAX_RETURNS.EDIT, PERMISSIONS.TAX_RETURNS.APPROVE])) {
  // Show action buttons
}`}
                      </pre>
                    </div>
                    
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-medium mb-2">Your Current Permissions:</h4>
                      <ul className="space-y-1 text-sm">
                        {ROLE_PERMISSIONS[currentUser?.role]?.map(permission => (
                          <li key={permission} className="flex items-center">
                            <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                            {permission}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="users">
            <ProtectedComponent 
              requiredPermissions={[PERMISSIONS.USER_MANAGEMENT.VIEW]}
              fallback={
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center p-8 text-center">
                      <div>
                        <Lock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                          Access Denied
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          You need the <strong>user_management.view</strong> permission to access this section.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              }
            >
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage system users and their roles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-6">
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                      <Input
                        placeholder="Search users..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    {hasPermission(PERMISSIONS.USER_MANAGEMENT.CREATE) && (
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    )}
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge className="capitalize">{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              user.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-slate-100 text-slate-800'
                            }>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              {hasPermission(PERMISSIONS.USER_MANAGEMENT.EDIT) && (
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              )}
                              {hasPermission(PERMISSIONS.USER_MANAGEMENT.DELETE) && (
                                <Button variant="outline" size="sm" className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </ProtectedComponent>
          </TabsContent>
          
          <TabsContent value="roles">
            <ProtectedComponent 
              requiredPermissions={[PERMISSIONS.USER_MANAGEMENT.EDIT]}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Role Permissions</CardTitle>
                  <CardDescription>
                    Configure permissions for each system role
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => (
                      <Card key={role} className={
                        editingRole === role ? "ring-2 ring-blue-500" : ""
                      }>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg capitalize">{role}</CardTitle>
                              <p className="text-sm text-slate-500">
                                {permissions.length} permissions
                              </p>
                            </div>
                            <Button
                              variant={editingRole === role ? "default" : "outline"}
                              size="sm"
                              onClick={() => setEditingRole(editingRole === role ? null : role)}
                            >
                              {editingRole === role ? (
                                <>
                                  <Save className="h-4 w-4 mr-1" />
                                  Save
                                </>
                              ) : (
                                <>
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </>
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {Object.entries(PERMISSIONS).map(([category, perms]) => (
                              <div key={category}>
                                <h4 className="text-sm font-medium mb-2 capitalize">
                                  {category.replace('_', ' ')}
                                </h4>
                                <div className="space-y-2">
                                  {Object.entries(perms).map(([key, permission]) => (
                                    <div key={permission} className="flex items-center justify-between">
                                      <Label htmlFor={`${role}-${permission}`} className="text-xs font-mono flex-1">
                                        {key.toLowerCase()}
                                      </Label>
                                      <Switch
                                        id={`${role}-${permission}`}
                                        checked={rolePermissions[role]?.includes(permission)}
                                        onCheckedChange={(checked) => 
                                          handlePermissionChange(role, permission, checked)
                                        }
                                        disabled={editingRole !== role}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ProtectedComponent>
          </TabsContent>
          
          <TabsContent value="audit">
            <ProtectedComponent 
              requiredPermissions={[PERMISSIONS.REPORTS.VIEW]}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Access Audit Logs</CardTitle>
                  <CardDescription>
                    Review system access and permission changes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Resource</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-mono text-xs">2023-11-15 14:32:18</TableCell>
                          <TableCell>admin@taxpro.com</TableCell>
                          <TableCell>Permission Change</TableCell>
                          <TableCell>Role: Reviewer</TableCell>
                          <TableCell>Added tax_returns.approve permission</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-xs">2023-11-15 13:45:22</TableCell>
                          <TableCell>john.doe@email.com</TableCell>
                          <TableCell>View</TableCell>
                          <TableCell>Tax Return #1042</TableCell>
                          <TableCell>Accessed tax return documents</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-xs">2023-11-15 11:20:57</TableCell>
                          <TableCell>preparer@taxpro.com</TableCell>
                          <TableCell>Create</TableCell>
                          <TableCell>Tax Return #1043</TableCell>
                          <TableCell>Started new tax return preparation</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-xs">2023-11-15 09:15:34</TableCell>
                          <TableCell>admin@taxpro.com</TableCell>
                          <TableCell>Login</TableCell>
                          <TableCell>System</TableCell>
                          <TableCell>User logged in from IP 192.168.1.5</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </ProtectedComponent>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}