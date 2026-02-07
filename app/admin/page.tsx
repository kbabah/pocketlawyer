"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { MainLayout } from "@/components/layout/main-layout"
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
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Shield className="h-10 w-10 text-primary mx-auto animate-pulse" />
            <h1 className="text-2xl font-bold mt-4">Verifying admin access...</h1>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
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
      </MainLayout>
    )
  }

  return (
    <MainLayout>
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
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="lawyers" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Lawyers</span>
            </TabsTrigger>
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

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription>
                    Overview of key system metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Users</span>
                    <span className="font-bold">--</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Lawyers</span>
                    <span className="font-bold">--</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pending Approvals</span>
                    <span className="font-bold">--</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest system activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Activity log coming soon...</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="lawyers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lawyer Management</CardTitle>
                <CardDescription>
                  Approve, manage, and monitor lawyer registrations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm">Review pending lawyer registrations, approve or reject applications, and manage active lawyers.</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => router.push("/admin/lawyers")}>
                  Manage Lawyers
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

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
                  <p className="text-sm">View and manage all registered users, assign roles, and control access permissions.</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => router.push("/admin/users")}>
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
                <CardTitle>Blog Management</CardTitle>
                <CardDescription>
                  Create and manage blog posts for your website.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm">Manage your blog content, publish new articles, and edit existing posts.</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => router.push("/admin/blog")}>
                  Manage Blog
                </Button>
              </CardFooter>
            </Card>
            
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
    </MainLayout>
  )
}