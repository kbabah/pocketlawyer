"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Users, Mail, FileText, Settings, Activity, ArrowLeft, BellRing, BarChart } from "lucide-react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/sign-in")
      return
    }

    const checkAdminStatus = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.id))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          const hasAdminAccess = userData?.role === "admin" || userData?.isAdmin === true
          
          setIsAdmin(hasAdminAccess)
          
          if (!hasAdminAccess) {
            // Redirect non-admin users after a short delay
            setTimeout(() => {
              router.push("/")
            }, 1500)
          }
        } else {
          setIsAdmin(false)
          setTimeout(() => {
            router.push("/")
          }, 1500)
        }
      } catch (err) {
        console.error("Error checking admin status:", err)
        setError("Error verifying admin access")
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pattern-light dark:bg-pattern-dark">
        <div className="text-center">
          <Shield className="h-10 w-10 text-primary mx-auto animate-pulse" />
          <h1 className="text-2xl font-bold mt-4">Verifying admin access...</h1>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pattern-light dark:bg-pattern-dark">
        <div className="w-full max-w-md">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              You don't have permission to access this area. Redirecting...
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => router.push("/")}
            variant="outline"
            className="w-full"
          >
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pattern-light dark:bg-pattern-dark">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                +-- from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                +-- from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Email Campaigns</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                +-- from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="emails" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email Campaigns</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage system users, permissions, and accounts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm">User management functionality coming soon.</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => router.push("/admin/users")} disabled>
                  Manage Users
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="emails" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Campaigns</CardTitle>
                <CardDescription>
                  Create and manage email campaigns and templates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm">Email campaign management available.</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => router.push("/admin/email")}>
                  Manage Email Campaigns
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>
                  Manage legal content, templates, and documents.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm">Content management functionality coming soon.</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => router.push("/admin/content")} disabled>
                  Manage Content
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  View system analytics and performance metrics.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm">Analytics functionality coming soon.</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => router.push("/admin/analytics")} disabled>
                  View Analytics
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure global system settings and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm">System setup available.</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => router.push("/admin/setup")}>
                  Manage Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}