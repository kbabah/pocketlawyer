"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface SimpleUser {
  uid: string;
  email: string | undefined;
  displayName: string | null;
  disabled: boolean;
  customClaims?: { admin?: boolean };
}

export function UserActions({ user }: { user: SimpleUser }) {
  const updateUserRole = async (isAdmin: boolean) => {
    try {
      const response = await fetch('/api/admin/users/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, isAdmin })
      })
      
      if (!response.ok) throw new Error('Failed to update user role')
      
      toast.success('User role updated successfully')
      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Failed to update user role')
    }
  }

  const updateUserStatus = async (disabled: boolean) => {
    try {
      const response = await fetch('/api/admin/users/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, disabled })
      })
      
      if (!response.ok) throw new Error('Failed to update user status')
      
      toast.success('User status updated successfully')
      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error('Error updating user status:', error)
      toast.error('Failed to update user status')
    }
  }

  return (
    <div className="space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => updateUserRole(!user.customClaims?.admin)}
      >
        {user.customClaims?.admin ? 'Remove Admin' : 'Make Admin'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => updateUserStatus(!user.disabled)}
      >
        {user.disabled ? 'Enable' : 'Disable'}
      </Button>
    </div>
  )
}