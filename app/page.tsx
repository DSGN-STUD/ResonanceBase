import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Sparkles, Users, Search, MessageSquare, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">SuperNetworkAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/sign-up">Get started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            AI-Powered Networking
          </div>
          <h1 className="text-4xl font-bold leading-tight text-balance sm:text-5xl lg:text-6xl">
            Find your perfect cofounder, teammate, or client
          </h1>
          <p className="mx-auto max-w-lg text-lg leading-relaxed text-muted-foreground text-pretty">
            SuperNetworkAI uses Ikigai philosophy and AI matching to connect you with the people who complement your skills, share your vision, and accelerate your journey.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" asChild className="gap-2">
              <Link href="/auth/sign-up">
                Start matching <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto mt-24 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl bg-card p-6 text-left">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold text-card-foreground">AI-Powered Search</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Describe who you need in plain English. Our AI analyzes profiles, skills, and Ikigai to find your best matches.
            </p>
          </div>
          <div className="rounded-xl bg-card p-6 text-left">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold text-card-foreground">Smart Connections</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Connect with cofounders, teammates, and clients scored by compatibility. Every match comes with an AI explanation.
            </p>
          </div>
          <div className="rounded-xl bg-card p-6 text-left">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold text-card-foreground">Real-time Chat</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Once connected, chat in real-time. Build relationships and turn matches into meaningful collaborations.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
        SuperNetworkAI &mdash; Find your people, faster.
      </footer>
    </div>
  )
}
