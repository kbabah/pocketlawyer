"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import MainLayout from "@/components/layout/main-layout"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      // Here you would implement the contact form submission
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated API call
      setName("")
      setEmail("")
      setMessage("")
      alert("Your message has been sent successfully!")
    } catch (error) {
      alert("Failed to send message. Please try again later.")
    } finally {
      setSubmitting(false)
    }
  }
  
  return (
    <MainLayout>
      <div className="max-w-md mx-auto">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
              <CardTitle>Contact Us</CardTitle>
              <CardDescription>Have questions or feedback? Send us a message below.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                  />
                </div>
                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Sending..." : "Send Message"}
                  </Button>
                  <Link href="/">
                    <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">Back to Home</Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
    </MainLayout>
  )
}