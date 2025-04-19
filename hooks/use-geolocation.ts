import { useState, useEffect } from 'react'

interface Coordinates {
  latitude: number
  longitude: number
}

export function useGeolocation() {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
        setIsLoading(false)
      },
      (error) => {
        setError(error.message)
        setIsLoading(false)
      }
    )
  }, [])

  return { coordinates, error, isLoading }
}