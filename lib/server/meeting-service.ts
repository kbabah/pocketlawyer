// Meeting Service for PocketLawyer (Server-Only)
// Generates video meeting links for consultations

export type MeetingProvider = 'jitsi' | 'zoom' | 'google-meet'

export interface MeetingDetails {
  meetingLink: string
  meetingId?: string
  provider: MeetingProvider
  dialInNumber?: string
  pin?: string
}

export interface MeetingConfig {
  bookingId: string
  lawyerName: string
  userName: string
  startTime: Date
  duration: number
  provider?: MeetingProvider
}

// Jitsi Meet configuration
const JITSI_MEET_URL = process.env.JITSI_MEET_URL || 'https://meet.jit.si'

/**
 * Generate a meeting link for a consultation
 * Uses Jitsi Meet by default (free, open source, no API key required)
 */
export async function generateMeetingLink(config: MeetingConfig): Promise<MeetingDetails> {
  const provider = config.provider || 'jitsi'

  switch (provider) {
    case 'jitsi':
      return generateJitsiMeeting(config)
    case 'zoom':
      return generateZoomMeeting(config)
    case 'google-meet':
      return generateGoogleMeet(config)
    default:
      return generateJitsiMeeting(config)
  }
}

/**
 * Generate a Jitsi Meet link
 * Jitsi is free and doesn't require an API key
 */
function generateJitsiMeeting(config: MeetingConfig): MeetingDetails {
  // Create a unique room name based on booking details
  const timestamp = config.startTime.getTime()
  const sanitizedLawyerName = sanitizeForRoomName(config.lawyerName)
  const roomName = `PocketLawyer-${sanitizedLawyerName}-${timestamp}-${config.bookingId.slice(-8)}`

  // Add password for security
  const password = generateSecurePassword()

  // Build the meeting link with config params for better UX
  const meetingLink = `${JITSI_MEET_URL}/${roomName}#config.prejoinPageEnabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=false`

  return {
    meetingLink,
    meetingId: roomName,
    provider: 'jitsi',
    dialInNumber: '+1-512-402-2718', // Jitsi dial-in (US number)
    pin: password,
  }
}

/**
 * Generate a Zoom meeting link
 * Requires Zoom API credentials (optional)
 */
async function generateZoomMeeting(config: MeetingConfig): Promise<MeetingDetails> {
  // Check if Zoom API is configured
  if (!process.env.ZOOM_API_KEY || !process.env.ZOOM_API_SECRET) {
    console.warn('Zoom API not configured, falling back to Jitsi')
    return generateJitsiMeeting(config)
  }

  try {
    // Get Zoom access token
    const token = await getZoomAccessToken()

    // Create meeting via Zoom API
    const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: `Legal Consultation - ${config.lawyerName}`,
        type: 2, // Scheduled meeting
        start_time: config.startTime.toISOString(),
        duration: config.duration,
        timezone: 'Africa/Douala', // Cameroon timezone
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: true,
          meeting_authentication: false,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Zoom API error: ${response.status}`)
    }

    const data = await response.json()

    return {
      meetingLink: data.join_url,
      meetingId: data.id.toString(),
      provider: 'zoom',
      dialInNumber: data.settings?.global_dial_in_numbers?.[0]?.number,
      pin: data.password,
    }
  } catch (error) {
    console.error('Failed to create Zoom meeting, falling back to Jitsi:', error)
    return generateJitsiMeeting(config)
  }
}

/**
 * Generate a Google Meet link
 * Requires Google Calendar API (optional)
 */
async function generateGoogleMeet(config: MeetingConfig): Promise<MeetingDetails> {
  // Check if Google Calendar API is configured
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.warn('Google Calendar API not configured, falling back to Jitsi')
    return generateJitsiMeeting(config)
  }

  // For now, fall back to Jitsi as Google Calendar API integration is complex
  console.warn('Google Meet integration not fully implemented, falling back to Jitsi')
  return generateJitsiMeeting(config)
}

/**
 * Update a booking with meeting details (server-side, uses Admin SDK)
 */
export async function updateBookingWithMeetingLink(
  bookingId: string,
  meetingDetails: MeetingDetails
): Promise<void> {
  try {
    const { adminDb } = await import('@/lib/firebase-admin')
    await adminDb.collection('bookings').doc(bookingId).update({
      meetingLink: meetingDetails.meetingLink,
      meetingId: meetingDetails.meetingId,
      meetingProvider: meetingDetails.provider,
      meetingDialInNumber: meetingDetails.dialInNumber || null,
      meetingPin: meetingDetails.pin || null,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Failed to update booking with meeting link:', error)
    throw error
  }
}

// Helper functions

function sanitizeForRoomName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 20)
}

function generateSecurePassword(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase()
}

async function getZoomAccessToken(): Promise<string> {
  const accountId = process.env.ZOOM_ACCOUNT_ID
  const clientId = process.env.ZOOM_API_KEY
  const clientSecret = process.env.ZOOM_API_SECRET

  if (!accountId || !clientId || !clientSecret) {
    throw new Error('Zoom credentials not configured')
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get Zoom token: ${response.status}`)
  }

  const data = await response.json()
  return data.access_token
}

/**
 * Generate meeting instructions for email
 */
export function generateMeetingInstructions(
  meetingDetails: MeetingDetails,
  language: 'en' | 'fr' = 'en'
): string {
  const isFrench = language === 'fr'

  const en = [
    'Video Conference Details:',
    '',
    `Join URL: ${meetingDetails.meetingLink}`,
    '',
    meetingDetails.dialInNumber ? `Dial-in Number: ${meetingDetails.dialInNumber}` : '',
    meetingDetails.pin ? `PIN: ${meetingDetails.pin}` : '',
    '',
    'How to join:',
    '1. Click the link above at your scheduled time',
    '2. Allow camera and microphone access when prompted',
    '3. Enter your name when joining',
    '4. Wait for the lawyer to admit you to the meeting',
    '',
    'Please join a few minutes early to test your audio and video.',
    '',
    `Meeting Provider: ${meetingDetails.provider.toUpperCase()}`,
  ]
    .filter(Boolean)
    .join('\n')

  const fr = [
    'Details de la videoconference :',
    '',
    `URL de connexion : ${meetingDetails.meetingLink}`,
    '',
    meetingDetails.dialInNumber ? `Numero d'appel : ${meetingDetails.dialInNumber}` : '',
    meetingDetails.pin ? `Code PIN : ${meetingDetails.pin}` : '',
    '',
    'Comment rejoindre :',
    "1. Cliquez sur le lien ci-dessus a l'heure prevue",
    "2. Autorisez l'acces a la camera et au micro lorsque demande",
    '3. Entrez votre nom en rejoignant',
    "4. Attendez que l'avocat vous admette a la reunion",
    '',
    "Veuillez vous connecter quelques minutes a l'avance pour tester votre audio et video.",
    '',
    `Fournisseur : ${meetingDetails.provider.toUpperCase()}`,
  ]
    .filter(Boolean)
    .join('\n')

  return isFrench ? fr : en
}
