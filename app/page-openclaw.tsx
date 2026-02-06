"use client"

import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { OpenClawLayout } from "@/components/layout/openclaw-layout"
import ChatInterface from "@/components/chat-interface-optimized"
import { Button } from "@/components/ui/button"
import { 
  Scale, 
  MessageCircle, 
  FileText, 
  Shield, 
  Zap,
  TrendingUp,
  Users,
  Calendar,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user } = useAuth()
  const { t } = useLanguage()

  if (!user) {
    return <WelcomeView />
  }

  return (
    <OpenClawLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white font-mono mb-2">
                WELCOME.BACK
              </h1>
              <p className="text-slate-400 font-mono">
                {user.name || user.email}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-mono"
                asChild
              >
                <Link href="/lawyers">
                  <Scale className="h-4 w-4 mr-2" />
                  FIND LAWYER
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<MessageCircle className="h-5 w-5" />}
            label="CONVERSATIONS"
            value="12"
            color="text-blue-400"
            bgColor="bg-blue-500/10"
            borderColor="border-blue-500/30"
          />
          <StatCard
            icon={<Calendar className="h-5 w-5" />}
            label="BOOKINGS"
            value="3"
            color="text-purple-400"
            bgColor="bg-purple-500/10"
            borderColor="border-purple-500/30"
          />
          <StatCard
            icon={<FileText className="h-5 w-5" />}
            label="DOCUMENTS"
            value="8"
            color="text-emerald-400"
            bgColor="bg-emerald-500/10"
            borderColor="border-emerald-500/30"
          />
        </div>

        {/* Chat Interface */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
          <div className="border-b border-slate-800 p-4">
            <h2 className="font-mono text-emerald-400 font-bold flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              AI.ASSISTANT
            </h2>
          </div>
          <div className="p-6">
            <ChatInterface />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionCard
            title="FIND A LAWYER"
            description="Connect with verified legal professionals"
            icon={<Scale className="h-6 w-6" />}
            href="/lawyers"
            color="emerald"
          />
          <ActionCard
            title="UPLOAD DOCUMENT"
            description="Analyze legal documents with AI"
            icon={<FileText className="h-6 w-6" />}
            href="/documents"
            color="blue"
          />
        </div>
      </div>
    </OpenClawLayout>
  )
}

function WelcomeView() {
  const { t } = useLanguage()

  const features = [
    {
      icon: Scale,
      title: "Legal Expertise",
      description: "Professional legal guidance powered by AI"
    },
    {
      icon: MessageCircle,
      title: "24/7 Availability",
      description: "Access legal assistance anytime"
    },
    {
      icon: FileText,
      title: "Document Analysis",
      description: "Upload and analyze legal documents"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is protected"
    },
    {
      icon: Zap,
      title: "Instant Responses",
      description: "Get immediate answers"
    },
    {
      icon: Users,
      title: "Expert Network",
      description: "Connect with real lawyers"
    }
  ]

  return (
    <OpenClawLayout>
      <div className="space-y-12">
        {/* Hero */}
        <div className="text-center py-12">
          <div className="mb-6">
            <Scale className="h-20 w-20 text-emerald-400 mx-auto mb-4" />
          </div>
          <h1 className="text-5xl font-bold text-white font-mono mb-4">
            POCKETLAWYER.AI
          </h1>
          <p className="text-xl text-slate-400 font-mono mb-8">
            Your Intelligent Legal Assistant
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-mono"
              asChild
            >
              <Link href="/sign-up">
                GET STARTED
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 font-mono"
              asChild
            >
              <Link href="/sign-in">
                SIGN IN
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white font-mono mb-6 text-center">
            FEATURES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-colors"
              >
                <div className="h-12 w-12 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white font-mono mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 font-mono">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-white font-mono mb-4">
            READY TO START?
          </h2>
          <p className="text-slate-400 font-mono mb-6">
            Join thousands of users getting instant legal assistance
          </p>
          <Button
            size="lg"
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-mono"
            asChild
          >
            <Link href="/sign-up">
              CREATE FREE ACCOUNT
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </OpenClawLayout>
  )
}

function StatCard({ icon, label, value, color, bgColor, borderColor }: any) {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`${color} font-mono text-xs font-bold`}>{label}</span>
        <div className={color}>{icon}</div>
      </div>
      <div className={`${color} text-3xl font-bold font-mono`}>{value}</div>
    </div>
  )
}

function ActionCard({ title, description, icon, href, color }: any) {
  const colors = {
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      hover: "hover:bg-emerald-500/20"
    },
    blue: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      text: "text-blue-400",
      hover: "hover:bg-blue-500/20"
    }
  }[color]

  return (
    <Link href={href}>
      <div className={`${colors.bg} border ${colors.border} rounded-lg p-6 ${colors.hover} transition-colors cursor-pointer group`}>
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 ${colors.bg} border ${colors.border} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <div className={colors.text}>{icon}</div>
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-bold font-mono mb-2 ${colors.text}`}>
              {title}
            </h3>
            <p className="text-sm text-slate-400 font-mono">
              {description}
            </p>
          </div>
          <ArrowRight className={`h-5 w-5 ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
        </div>
      </div>
    </Link>
  )
}
