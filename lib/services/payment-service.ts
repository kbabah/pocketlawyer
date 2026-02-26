// Payment Service for PocketLawyer
// Supports MTN Mobile Money and Orange Money (Cameroon)

import { 
  doc, 
  updateDoc, 
  addDoc, 
  collection, 
  serverTimestamp,
  getDoc 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export type PaymentMethod = 'mtn' | 'orange'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

export interface PaymentData {
  bookingId: string
  amount: number
  currency: string
  method: PaymentMethod
  phoneNumber: string
  userId: string
  userEmail: string
  description: string
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  message: string
  paymentId?: string
}

/**
 * Initiate a payment for a booking
 */
export async function initiatePayment(data: PaymentData): Promise<PaymentResult> {
  try {
    // Validate phone number format (Cameroon)
    if (!isValidCameroonPhone(data.phoneNumber)) {
      return {
        success: false,
        message: 'Invalid phone number format. Use: 6XXXXXXXX or +2376XXXXXXXX'
      }
    }

    // Create payment record in Firestore
    const paymentRef = await addDoc(collection(db, 'payments'), {
      bookingId: data.bookingId,
      userId: data.userId,
      amount: data.amount,
      currency: data.currency,
      method: data.method,
      phoneNumber: formatPhoneNumber(data.phoneNumber),
      status: 'pending' as PaymentStatus,
      description: data.description,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    // Update booking status
    const bookingRef = doc(db, 'bookings', data.bookingId)
    await updateDoc(bookingRef, {
      paymentStatus: 'pending',
      paymentId: paymentRef.id,
      updatedAt: new Date(),
    })

    // Call payment gateway API
    let result: PaymentResult

    if (data.method === 'mtn') {
      result = await processMTNPayment({
        ...data,
        paymentId: paymentRef.id
      })
    } else {
      result = await processOrangePayment({
        ...data,
        paymentId: paymentRef.id
      })
    }

    // Update payment record with result
    await updateDoc(doc(db, 'payments', paymentRef.id), {
      status: result.success ? 'processing' : 'failed',
      transactionId: result.transactionId,
      message: result.message,
      updatedAt: serverTimestamp(),
    })

    return {
      ...result,
      paymentId: paymentRef.id
    }

  } catch (error: any) {
    console.error('Payment initiation error:', error)
    return {
      success: false,
      message: 'Payment initiation failed. Please try again.'
    }
  }
}

/**
 * Process MTN Mobile Money payment
 */
async function processMTNPayment(data: PaymentData & { paymentId: string }): Promise<PaymentResult> {
  try {
    // Check if MTN API credentials are configured
    if (!process.env.MTN_API_KEY || !process.env.MTN_API_SECRET) {
      console.error('MTN Mobile Money API not configured')
      return {
        success: false,
        message: 'Payment method temporarily unavailable. Please try again later.'
      }
    }

    // Call MTN MoMo API
    const response = await fetch(`${process.env.MTN_API_URL}/collection/v1_0/requesttopay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getMTNAccessToken()}`,
        'X-Reference-Id': data.paymentId,
        'X-Target-Environment': process.env.MTN_ENVIRONMENT || 'sandbox',
        'Ocp-Apim-Subscription-Key': process.env.MTN_API_KEY,
      },
      body: JSON.stringify({
        amount: data.amount.toString(),
        currency: data.currency,
        externalId: data.bookingId,
        payer: {
          partyIdType: 'MSISDN',
          partyId: data.phoneNumber
        },
        payerMessage: data.description,
        payeeNote: `PocketLawyer - Booking ${data.bookingId}`,
      })
    })

    if (response.ok) {
      return {
        success: true,
        transactionId: data.paymentId,
        message: 'Payment request sent. Please check your phone to complete the payment.'
      }
    } else {
      const error = await response.json()
      console.error('MTN API error:', error)
      return {
        success: false,
        message: 'Payment request failed. Please check your phone number and try again.'
      }
    }

  } catch (error: any) {
    console.error('MTN payment error:', error)
    return {
      success: false,
      message: 'MTN Mobile Money service unavailable. Please try again later.'
    }
  }
}

/**
 * Process Orange Money payment
 */
async function processOrangePayment(data: PaymentData & { paymentId: string }): Promise<PaymentResult> {
  try {
    // Check if Orange API credentials are configured
    if (!process.env.ORANGE_API_KEY || !process.env.ORANGE_API_SECRET) {
      console.error('Orange Money API not configured')
      return {
        success: false,
        message: 'Payment method temporarily unavailable. Please try again later.'
      }
    }

    // Call Orange Money API
    const response = await fetch(`${process.env.ORANGE_API_URL}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getOrangeAccessToken()}`,
      },
      body: JSON.stringify({
        amount: data.amount,
        currency: data.currency,
        order_id: data.bookingId,
        payment_id: data.paymentId,
        customer_msisdn: data.phoneNumber,
        merchant_key: process.env.ORANGE_MERCHANT_KEY,
        description: data.description,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/bookings`,
        notif_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
      })
    })

    if (response.ok) {
      const result = await response.json()
      return {
        success: true,
        transactionId: result.payment_token || data.paymentId,
        message: 'Payment request sent. Please check your phone to complete the payment.'
      }
    } else {
      const error = await response.json()
      console.error('Orange API error:', error)
      return {
        success: false,
        message: 'Payment request failed. Please check your phone number and try again.'
      }
    }

  } catch (error: any) {
    console.error('Orange payment error:', error)
    return {
      success: false,
      message: 'Orange Money service unavailable. Please try again later.'
    }
  }
}

/**
 * Verify payment status
 */
export async function verifyPayment(paymentId: string): Promise<PaymentResult> {
  try {
    const paymentDoc = await getDoc(doc(db, 'payments', paymentId))
    
    if (!paymentDoc.exists()) {
      return {
        success: false,
        message: 'Payment not found'
      }
    }

    const payment = paymentDoc.data()

    if (payment.status === 'completed') {
      return {
        success: true,
        transactionId: payment.transactionId,
        message: 'Payment completed successfully'
      }
    }

    // Check payment status with provider
    let status: PaymentStatus = payment.status

    if (payment.method === 'mtn') {
      status = await checkMTNPaymentStatus(payment.transactionId)
    } else {
      status = await checkOrangePaymentStatus(payment.transactionId)
    }

    // Update payment status
    await updateDoc(doc(db, 'payments', paymentId), {
      status,
      updatedAt: serverTimestamp(),
    })

    // If completed, update booking via API (so server can auto-generate meeting link)
    if (status === 'completed') {
      try {
        const { auth } = await import('@/lib/firebase')
        const user = auth.currentUser
        if (!user) {
          // Fallback to direct update if no auth context (should be rare in client flows)
          await updateDoc(doc(db, 'bookings', payment.bookingId), {
            paymentStatus: 'completed',
            status: 'confirmed',
            updatedAt: new Date(),
          })
        } else {
          const token = await user.getIdToken()
          // First, persist paymentStatus; then trigger confirm action which will generate meeting link if needed
          await updateDoc(doc(db, 'bookings', payment.bookingId), {
            paymentStatus: 'completed',
            updatedAt: new Date(),
          })
          await fetch(`/api/bookings/${payment.bookingId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ action: 'confirm' }),
          })
        }
      } catch (e) {
        console.error('Error confirming booking after payment:', e)
      }

      // TODO: Send confirmation email

      return {
        success: true,
        transactionId: payment.transactionId,
        message: 'Payment completed successfully!'
      }
    }

    return {
      success: status !== 'failed',
      message: status === 'failed' ? 'Payment failed' : 'Payment is being processed'
    }

  } catch (error: any) {
    console.error('Payment verification error:', error)
    return {
      success: false,
      message: 'Unable to verify payment status'
    }
  }
}

/**
 * Cancel a payment
 */
export async function cancelPayment(paymentId: string): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'payments', paymentId), {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error('Payment cancellation error:', error)
    return false
  }
}

// Helper functions

function isValidCameroonPhone(phone: string): boolean {
  // Cameroon phone formats: 6XXXXXXXX, +2376XXXXXXXX, 002376XXXXXXXX
  const cleaned = phone.replace(/\s+/g, '')
  return /^(6\d{8}|(\+237|00237)6\d{8})$/.test(cleaned)
}

function formatPhoneNumber(phone: string): string {
  // Normalize to international format: +2376XXXXXXXX
  const cleaned = phone.replace(/\s+/g, '')
  if (cleaned.startsWith('+237')) return cleaned
  if (cleaned.startsWith('00237')) return '+' + cleaned.slice(2)
  if (cleaned.startsWith('6')) return '+237' + cleaned
  return cleaned
}

async function getMTNAccessToken(): Promise<string> {
  // TODO: Implement OAuth token generation for MTN MoMo API
  // This should cache the token and refresh when expired
  return process.env.MTN_API_TOKEN || ''
}

async function getOrangeAccessToken(): Promise<string> {
  // TODO: Implement OAuth token generation for Orange Money API
  // This should cache the token and refresh when expired
  return process.env.ORANGE_API_TOKEN || ''
}

async function checkMTNPaymentStatus(transactionId: string): Promise<PaymentStatus> {
  try {
    const response = await fetch(
      `${process.env.MTN_API_URL}/collection/v1_0/requesttopay/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${await getMTNAccessToken()}`,
          'X-Target-Environment': process.env.MTN_ENVIRONMENT || 'sandbox',
          'Ocp-Apim-Subscription-Key': process.env.MTN_API_KEY!,
        }
      }
    )

    if (response.ok) {
      const data = await response.json()
      switch (data.status) {
        case 'SUCCESSFUL': return 'completed'
        case 'PENDING': return 'processing'
        case 'FAILED': return 'failed'
        default: return 'pending'
      }
    }

    return 'pending'
  } catch (error) {
    console.error('MTN status check error:', error)
    return 'pending'
  }
}

async function checkOrangePaymentStatus(transactionId: string): Promise<PaymentStatus> {
  try {
    const response = await fetch(
      `${process.env.ORANGE_API_URL}/payment/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${await getOrangeAccessToken()}`,
        }
      }
    )

    if (response.ok) {
      const data = await response.json()
      switch (data.status) {
        case 'SUCCESS': return 'completed'
        case 'INITIATED':
        case 'PENDING': return 'processing'
        case 'FAILED':
        case 'EXPIRED': return 'failed'
        default: return 'pending'
      }
    }

    return 'pending'
  } catch (error) {
    console.error('Orange status check error:', error)
    return 'pending'
  }
}

/**
 * Get payment by ID
 */
export async function getPayment(paymentId: string) {
  try {
    const paymentDoc = await getDoc(doc(db, 'payments', paymentId))
    if (!paymentDoc.exists()) return null
    
    return {
      id: paymentDoc.id,
      ...paymentDoc.data()
    }
  } catch (error) {
    console.error('Error fetching payment:', error)
    return null
  }
}

/**
 * Get payments for a booking
 */
export async function getBookingPayments(bookingId: string) {
  try {
    // Implementation depends on your query needs
    // This is a placeholder
    return []
  } catch (error) {
    console.error('Error fetching booking payments:', error)
    return []
  }
}
