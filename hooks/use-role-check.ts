import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getLawyerByUserId } from "@/lib/services/lawyer-service"

interface RoleCheckResult {
  isAdmin: boolean
  isLawyer: boolean
  isApprovedLawyer: boolean
  loading: boolean
  error: string | null
}

export function useRoleCheck(): RoleCheckResult {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLawyer, setIsLawyer] = useState(false)
  const [isApprovedLawyer, setIsApprovedLawyer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkRoles = async () => {
      if (!user) {
        setIsAdmin(false)
        setIsLawyer(false)
        setIsApprovedLawyer(false)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Skip Firestore check for anonymous/guest users — they have no Firebase auth token
        if (user.isAnonymous) {
          setIsAdmin(false)
          setIsLawyer(false)
          setIsApprovedLawyer(false)
          setLoading(false)
          return
        }

        // Check admin status
        const userDoc = await getDoc(doc(db, "users", user.id))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          const hasAdminAccess = userData?.role === "admin" || userData?.isAdmin === true
          setIsAdmin(hasAdminAccess)
        } else {
          setIsAdmin(false)
        }

        // Check lawyer status
        try {
          const lawyerData = await getLawyerByUserId(user.id)
          if (lawyerData) {
            setIsLawyer(true)
            setIsApprovedLawyer(lawyerData.status === 'approved')
          } else {
            setIsLawyer(false)
            setIsApprovedLawyer(false)
          }
        } catch (err) {
          // User is not a lawyer
          setIsLawyer(false)
          setIsApprovedLawyer(false)
        }
      } catch (err) {
        console.error("Error checking roles:", err)
        setError(err instanceof Error ? err.message : "Failed to check user roles")
        setIsAdmin(false)
        setIsLawyer(false)
        setIsApprovedLawyer(false)
      } finally {
        setLoading(false)
      }
    }

    checkRoles()
  }, [user])

  return { isAdmin, isLawyer, isApprovedLawyer, loading, error }
}
