import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { auth } from "@/lib/firebase-admin"

async function getUser() {
  const cookieStore = await cookies()
  const session = cookieStore.get("firebase-session")
  if (!session) return null

  try {
    const decodedToken = await auth.verifySessionCookie(session.value)
    const user = await auth.getUser(decodedToken.uid)
    return user
  } catch (error) {
    console.error("Error verifying admin session:", error)
    return null
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user?.customClaims?.admin) {
    redirect("/")
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-background border-r">
        <div className="h-16 flex items-center px-6 border-b">
          <h2 className="text-lg font-semibold">Admin Dashboard</h2>
        </div>
        <nav className="p-4 space-y-2">
          <a href="/admin" className="block px-4 py-2 rounded-lg hover:bg-accent">
            Overview
          </a>
          <a href="/admin/lawyers" className="block px-4 py-2 rounded-lg hover:bg-accent">
            Lawyer Applications
          </a>
          <a href="/admin/users" className="block px-4 py-2 rounded-lg hover:bg-accent">
            User Management
          </a>
          <a href="/admin/reports" className="block px-4 py-2 rounded-lg hover:bg-accent">
            Reports
          </a>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="h-16 border-b flex items-center px-6">
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Signed in as {user.email}
            </span>
          </div>
        </div>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}