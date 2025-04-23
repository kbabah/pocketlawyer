'use server'

import { adminDb as db } from "@/lib/firebase-admin"

export async function handleApprove(id: string) {
  const lawyerRef = db.collection('lawyers').doc(id)
  await lawyerRef.update({
    verified: true,
    active: true,
    updatedAt: new Date().toISOString()
  })
}

export async function handleReject(id: string) {
  const lawyerRef = db.collection('lawyers').doc(id)
  await lawyerRef.update({
    verified: true,
    active: false,
    updatedAt: new Date().toISOString()
  })
}