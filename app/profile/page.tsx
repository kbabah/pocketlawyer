"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Scale, Loader2, Shield } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function Profile() {
  const { user, updateProfile, updatePassword } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)

  // Profile form state
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/sign-in")
    } else {
      // Check if the user is an admin
      const checkAdminStatus = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.id));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData?.role === "admin" || userData?.isAdmin === true);
          }
        } catch (err) {
          console.error("Error checking admin status:", err);
        }
      };
      
      checkAdminStatus();
    }
  }, [user, router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      await updateProfile({ name, email })
      setSuccess("Profile updated successfully")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (newPassword !== confirmNewPassword) {
      setError("New passwords don't match")
      setLoading(false)
      return
    }

    try {
      await updatePassword(currentPassword, newPassword)
      setSuccess("Password updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-pattern-light dark:bg-pattern-dark p-4">
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Scale className="h-6 w-6" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Update your profile information and password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAdmin && (
              <div className="mb-6">
                <Button 
                  onClick={() => router.push('/admin')}
                  className="w-full bg-primary hover:bg-primary/90 flex items-center justify-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Go To Admin
                </Button>
              </div>
            )}
            
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading || user.provider === "google"}
                    />
                    {user.provider === "google" && (
                      <p className="text-sm text-muted-foreground">
                        Email cannot be changed for Google accounts
                      </p>
                    )}
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert>
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Update Profile"
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="password">
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={loading || user.provider === "google"}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading || user.provider === "google"}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      disabled={loading || user.provider === "google"}
                      required
                    />
                  </div>
                  {user.provider === "google" && (
                    <Alert>
                      <AlertDescription>
                        Password management is handled by Google for Google accounts
                      </AlertDescription>
                    </Alert>
                  )}
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert>
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || user.provider === "google"}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}