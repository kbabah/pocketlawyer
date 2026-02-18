"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  CheckCircle2, 
  AlertCircle,
  Settings,
  Zap,
  Target
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ResponsiveTestPage() {
  return (
    <MainLayout>
      <div className="container-mobile space-y-8 py-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-mono tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
            RESPONSIVE TEST PAGE
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Test all responsive improvements across different screen sizes
          </p>
        </div>

        {/* Screen Size Indicators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Current Screen Size
            </CardTitle>
            <CardDescription>
              Resize your browser to see responsive breakpoints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <Smartphone className="h-8 w-8 mb-2 text-primary" />
                <span className="text-sm font-medium">Mobile</span>
                <span className="text-xs text-muted-foreground">&lt; 640px</span>
                <Badge variant="outline" className="mt-2 sm:hidden">Active</Badge>
              </div>
              
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <Smartphone className="h-8 w-8 mb-2 text-blue-500" />
                <span className="text-sm font-medium">Tablet</span>
                <span className="text-xs text-muted-foreground">640px - 1024px</span>
                <Badge variant="outline" className="mt-2 hidden sm:block lg:hidden">Active</Badge>
              </div>
              
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <Monitor className="h-8 w-8 mb-2 text-purple-500" />
                <span className="text-sm font-medium">Desktop</span>
                <span className="text-xs text-muted-foreground">1024px - 1440px</span>
                <Badge variant="outline" className="mt-2 hidden lg:block xl:hidden">Active</Badge>
              </div>
              
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <Monitor className="h-8 w-8 mb-2 text-orange-500" />
                <span className="text-sm font-medium">Wide</span>
                <span className="text-xs text-muted-foreground">&gt; 1440px</span>
                <Badge variant="outline" className="mt-2 hidden xl:block">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Touch Targets Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Touch Target Test (44x44px minimum)
            </CardTitle>
            <CardDescription>
              All buttons should be easily tappable on mobile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="stack-mobile gap-4">
              <Button size="default">Default Button</Button>
              <Button size="sm">Small Button</Button>
              <Button size="lg">Large Button</Button>
              <Button size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </CardContent>
        </Card>

        {/* Form Inputs Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Form Inputs (16px font, no iOS zoom)
            </CardTitle>
            <CardDescription>
              Test keyboard input on mobile devices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="test-input">Text Input</Label>
              <Input id="test-input" placeholder="Type here..." />
            </div>
            
            <div>
              <Label htmlFor="test-email">Email Input</Label>
              <Input id="test-email" type="email" placeholder="email@example.com" />
            </div>
            
            <div>
              <Label htmlFor="test-textarea">Textarea</Label>
              <Textarea id="test-textarea" placeholder="Enter multiple lines..." rows={4} />
            </div>
          </CardContent>
        </Card>

        {/* Grid Responsive Test */}
        <Card>
          <CardHeader>
            <CardTitle>Responsive Grid</CardTitle>
            <CardDescription>
              1 column mobile → 2 tablet → 3 desktop → 4 wide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid-mobile">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <div
                  key={num}
                  className="p-6 border rounded-lg bg-primary/5 flex items-center justify-center"
                >
                  <span className="text-2xl font-bold text-primary">{num}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Responsive Features Status</CardTitle>
            <CardDescription>
              All improvements implemented and working
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">Hamburger menu on mobile</span>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">44x44px touch targets (WCAG compliant)</span>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">16px input font (no iOS zoom)</span>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">Responsive padding and spacing</span>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">Touch-friendly active states</span>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">Safe area insets (notched devices)</span>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">Smooth momentum scrolling</span>
              </div>
              
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <span className="text-sm">Real device testing pending</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Desktop:</strong> Resize your browser window to test breakpoints
            </p>
            <p>
              <strong>Mobile:</strong> Open DevTools responsive mode or test on actual device
            </p>
            <p>
              <strong>Touch:</strong> All buttons should feel responsive when tapped
            </p>
            <p>
              <strong>Forms:</strong> Typing should not cause zoom on iOS devices
            </p>
            <p>
              <strong>Menu:</strong> Hamburger menu should appear on screens &lt; 1024px
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
