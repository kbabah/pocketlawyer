"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { useRoleCheck } from "@/hooks/use-role-check"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  Users,
  Search,
  Shield,
  UserX,
  UserCheck,
  Loader2,
  ChevronLeft,
  Edit,
  Trash2,
  MoreVertical,
  Filter,
  Download,
  UserPlus,
  Activity
} from "lucide-react"
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  orderBy,
  limit,
  where
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { format } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface User {
  id: string
  name: string | null
  email: string
  role?: string
  isAdmin?: boolean
  provider: string
  createdAt: any
  lastLogin?: any
  isAnonymous?: boolean
  trialConversationsUsed?: number
  trialConversationsLimit?: number
  profileImage?: string
}

export default function UserManagementPage() {
  const { user: currentUser } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const { isAdmin, loading: roleLoading } = useRoleCheck()
  
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    role: "user",
    isAdmin: false
  })
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      router.push("/sign-in")
      return
    }
    
    if (!roleLoading && !isAdmin) {
      toast.error("Admin access required")
      router.push("/")
      return
    }
    
    if (!roleLoading && isAdmin) {
      loadUsers()
    }
  }, [currentUser, isAdmin, roleLoading, router])

  useEffect(() => {
    // Filter users based on search query and role filter
    let filtered = users
    
    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.id.toLowerCase().includes(query)
      )
    }
    
    // Apply role filter
    if (filterRole !== "all") {
      if (filterRole === "admin") {
        filtered = filtered.filter(u => u.isAdmin || u.role === "admin")
      } else if (filterRole === "guest") {
        filtered = filtered.filter(u => u.isAnonymous)
      } else if (filterRole === "user") {
        filtered = filtered.filter(u => !u.isAnonymous && !u.isAdmin && u.role !== "admin")
      }
    }
    
    setFilteredUsers(filtered)
  }, [searchQuery, filterRole, users])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const usersQuery = query(
        collection(db, "users"),
        orderBy("createdAt", "desc")
      )
      
      const snapshot = await getDocs(usersQuery)
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[]
      
      setUsers(usersData)
      setFilteredUsers(usersData)
    } catch (error: any) {
      console.error("Error loading users:", error)
      if (error?.code === "permission-denied") {
        toast.error("Firestore permission denied — deploy updated rules")
      } else {
        toast.error("Failed to load users")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      name: user.name || "",
      role: user.role || "user",
      isAdmin: user.isAdmin || false
    })
    setShowEditDialog(true)
  }

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user)
    setShowDeleteDialog(true)
  }

  const confirmEdit = async () => {
    if (!selectedUser) return

    setActionLoading(true)
    try {
      const userRef = doc(db, "users", selectedUser.id)
      await updateDoc(userRef, {
        name: editForm.name,
        role: editForm.role,
        isAdmin: editForm.isAdmin
      })
      
      toast.success("User updated successfully")
      setShowEditDialog(false)
      await loadUsers()
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("Failed to update user")
    } finally {
      setActionLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!selectedUser) return

    // Prevent deleting yourself
    if (selectedUser.id === currentUser?.id) {
      toast.error("You cannot delete your own account")
      return
    }

    setActionLoading(true)
    try {
      await deleteDoc(doc(db, "users", selectedUser.id))
      
      toast.success("User deleted successfully")
      setShowDeleteDialog(false)
      await loadUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user")
    } finally {
      setActionLoading(false)
    }
  }

  const toggleAdminStatus = async (user: User) => {
    if (user.id === currentUser?.id) {
      toast.error("You cannot change your own admin status")
      return
    }

    try {
      const userRef = doc(db, "users", user.id)
      const newAdminStatus = !user.isAdmin
      
      await updateDoc(userRef, {
        isAdmin: newAdminStatus,
        role: newAdminStatus ? "admin" : "user"
      })
      
      toast.success(`User ${newAdminStatus ? "promoted to" : "removed from"} admin`)
      await loadUsers()
    } catch (error) {
      console.error("Error updating admin status:", error)
      toast.error("Failed to update admin status")
    }
  }

  const getRoleBadge = (user: User) => {
    if (user.isAdmin || user.role === "admin") {
      return (
        <Badge className="bg-primary/20 text-primary border-primary/30 font-mono">
          ADMIN
        </Badge>
      )
    }
    if (user.isAnonymous) {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 font-mono">
          GUEST
        </Badge>
      )
    }
    return (
      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 font-mono">
        USER
      </Badge>
    )
  }

  const formatDate = (date: any) => {
    if (!date) return "N/A"
    try {
      const d = date.toDate ? date.toDate() : new Date(date)
      return format(d, "MMM d, yyyy")
    } catch {
      return "N/A"
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-slate-400 font-mono">LOADING USERS...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white font-mono">USER.MANAGEMENT</h1>
            <p className="text-slate-400 font-mono mt-1">
              System user administration
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.push("/admin")}
            className="text-slate-400 hover:text-white font-mono"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            BACK TO ADMIN
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-blue-400 font-mono font-bold">TOTAL USERS</span>
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-400 font-mono">
              {users.length}
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-primary font-mono font-bold">ADMINS</span>
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary font-mono">
              {users.filter(u => u.isAdmin || u.role === "admin").length}
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-yellow-400 font-mono font-bold">GUESTS</span>
              <UserX className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-yellow-400 font-mono">
              {users.filter(u => u.isAnonymous).length}
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-purple-400 font-mono font-bold">VERIFIED</span>
              <UserCheck className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-purple-400 font-mono">
              {users.filter(u => !u.isAnonymous && u.provider !== "anonymous").length}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white font-mono"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
          <div className="border-b border-slate-800 p-4">
            <h3 className="font-mono text-primary font-bold">USER DATABASE</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-slate-800/50">
                  <TableHead className="font-mono text-slate-400">USER</TableHead>
                  <TableHead className="font-mono text-slate-400">EMAIL</TableHead>
                  <TableHead className="font-mono text-slate-400">ROLE</TableHead>
                  <TableHead className="font-mono text-slate-400">PROVIDER</TableHead>
                  <TableHead className="font-mono text-slate-400">JOINED</TableHead>
                  <TableHead className="font-mono text-slate-400">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-slate-500 font-mono">No users found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/30">
                      <TableCell className="font-mono text-white">
                        {user.name || "Anonymous"}
                      </TableCell>
                      <TableCell className="font-mono text-slate-300">
                        {user.email}
                      </TableCell>
                      <TableCell>{getRoleBadge(user)}</TableCell>
                      <TableCell className="font-mono text-slate-400 uppercase text-xs">
                        {user.provider}
                      </TableCell>
                      <TableCell className="font-mono text-slate-400 text-sm">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              disabled={user.id === currentUser?.id}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                            <DropdownMenuItem
                              onClick={() => handleEditUser(user)}
                              className="font-mono"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleAdminStatus(user)}
                              className="font-mono"
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              {user.isAdmin ? "Remove Admin" : "Make Admin"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user)}
                              className="font-mono text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="font-mono text-primary">EDIT USER</DialogTitle>
            <DialogDescription className="font-mono text-slate-400">
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-mono text-slate-300">Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="font-mono text-slate-300">Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(value) => setEditForm({ ...editForm, role: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="user" className="font-mono">User</SelectItem>
                  <SelectItem value="admin" className="font-mono">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAdmin"
                checked={editForm.isAdmin}
                onChange={(e) => setEditForm({ ...editForm, isAdmin: e.target.checked })}
                className="rounded border-slate-700"
              />
              <Label htmlFor="isAdmin" className="font-mono text-slate-300">
                Admin Privileges
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowEditDialog(false)}
              className="font-mono"
              disabled={actionLoading}
            >
              CANCEL
            </Button>
            <Button
              onClick={confirmEdit}
              disabled={actionLoading}
              className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-mono"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "SAVE"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="font-mono text-red-400">DELETE USER</DialogTitle>
            <DialogDescription className="font-mono text-slate-400">
              This action cannot be undone. The user will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="font-mono text-white mb-1">{selectedUser.name || "Anonymous"}</p>
              <p className="font-mono text-slate-400 text-sm">{selectedUser.email}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteDialog(false)}
              className="font-mono"
              disabled={actionLoading}
            >
              CANCEL
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={actionLoading}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-mono"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "DELETE"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
