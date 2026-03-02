'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Zap, Brain, Puzzle, Users, Sun, Moon, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTheme } from '@/components/theme-provider'

function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let mouseX = 0
    let mouseY = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const nodes: { x: number; y: number; vx: number; vy: number }[] = []
    for (let i = 0; i < 50; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      nodes.forEach(node => {
        const dx = mouseX - node.x
        const dy = mouseY - node.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150) {
          node.vx += dx * 0.00005
          node.vy += dy * 0.00005
        }

        node.x += node.vx
        node.y += node.vy

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1

        ctx.beginPath()
        ctx.arc(node.x, node.y, 3, 0, Math.PI * 2)
        ctx.fillStyle = '#6366F1'
        ctx.fill()
      })

      nodes.forEach((a, i) => {
        nodes.slice(i + 1).forEach(b => {
          const dist = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)'
            ctx.lineWidth = 1
            ctx.stroke()
          }
        })
      })

      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 -z-10"
    />
  )
}

export default function LandingPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="relative min-h-svh bg-background text-foreground transition-colors duration-200">
      <AnimatedBackground />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 lg:px-12">
        <span className="text-lg font-semibold">Resonate</span>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <a href="#features" className="text-muted-foreground transition-colors hover:text-foreground">Features</a>
          <a href="#how-it-works" className="text-muted-foreground transition-colors hover:text-foreground">How it works</a>
          <a href="#vision" className="text-muted-foreground transition-colors hover:text-foreground">Vision</a>
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button asChild className="ai-glow">
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pt-24 pb-16 text-center">
        <h1 className="text-5xl font-bold leading-tight text-balance mb-4">
          Your next cofounder is already out there.
          <br />
          <span className="text-primary">Resonate finds them.</span>
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-muted-foreground text-pretty mb-8">
          Most partnerships fail before they start — not because of bad skills, but because of misaligned purpose. Resonate matches you on what actually matters: your Ikigai.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" asChild className="ai-glow">
            <Link href="/auth/sign-up">Find Your Match</Link>
          </Button>
          <Button size="lg" variant="ghost" asChild>
            <a href="#how-it-works">See How It Works</a>
          </Button>
        </div>
      </section>

      {/* Value Props */}
      <section id="features" className="mx-auto max-w-5xl px-6 mt-24">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Plain English Search</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Tell us who you need in your own words. No filters, no checkboxes.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Purpose-First Matching</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Every match comes with an AI explanation — not just a score.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Built for Builders</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                The right person changes everything. Resonate is for founders who refuse to leave that to chance.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mx-auto max-w-5xl px-6 mt-24">
        <h2 className="mb-2 text-center text-3xl font-bold">How it works</h2>
        <p className="text-center text-muted-foreground mb-6">Four steps to finding your people</p>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { step: '1', title: 'Discover your Ikigai', desc: 'Answer guided questions about your passion, mission, vocation, and profession.' },
            { step: '2', title: 'Define who you need', desc: 'Describe your ideal cofounder, teammate, or client in plain English.' },
            { step: '3', title: 'Get AI-ranked matches', desc: 'Our AI scores and explains why each person is a great fit.' },
            { step: '4', title: 'Connect and build', desc: 'Send connection requests and start collaborating.' },
          ].map(item => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {item.step}
              </div>
              <h3 className="mb-2 font-semibold">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vision Teaser */}
      <section id="vision" className="mx-auto max-w-5xl px-6 mt-24">
        <h2 className="mb-2 text-center text-3xl font-bold">We're just getting started</h2>
        <p className="mx-auto mb-6 max-w-2xl text-center text-muted-foreground">
          Resonate is building the infrastructure for purpose-driven professional relationships.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="mb-2 flex items-center justify-between">
                <Puzzle className="h-6 w-6 text-primary" />
                <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-500">Coming Soon</span>
              </div>
              <h3 className="mb-2 mt-4 font-semibold">Collaboration Layer</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                30-day Build Together engine. AI task breakdown. Shared workspace.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="mb-2 flex items-center justify-between">
                <Users className="h-6 w-6 text-primary" />
                <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-500">Coming Soon</span>
              </div>
              <h3 className="mb-2 mt-4 font-semibold">Community Layer</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Ikigai Circles. Goal-based pods. Skill tribes. AI news feed.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="mb-2 flex items-center justify-between">
                <Brain className="h-6 w-6 text-primary" />
                <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-500">Vision</span>
              </div>
              <h3 className="mb-2 mt-4 font-semibold">Ikigai OS</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Predictive partnership scoring. AI networking avatar. Life planning dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8 text-center">
          <Link href="/vision" className="text-sm text-primary transition-colors hover:underline">
            Explore the full Resonate vision &rarr;
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 mt-24">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Resonate</span>
            <span className="text-sm text-muted-foreground">— Find your people.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/vision" className="transition-colors hover:text-foreground">Vision</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
