'use client'

import Link from 'next/link'
import { Sun, Moon, Brain, Shield, Lightbulb, Network } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTheme } from '@/components/theme-provider'

const STACK_LAYERS = [
  { name: 'Ikigai OS', tag: 'Vision', tagColor: 'bg-purple-500/20 text-purple-500', highlight: false },
  { name: 'Intelligence Layer', tag: 'Vision', tagColor: 'bg-purple-500/20 text-purple-500', highlight: false },
  { name: 'Community Layer', tag: 'Roadmap', tagColor: 'bg-yellow-500/20 text-yellow-500', highlight: false },
  { name: 'Collaboration Layer', tag: 'Roadmap', tagColor: 'bg-yellow-500/20 text-yellow-500', highlight: false },
  { name: 'Connection Layer', tag: 'Live Now', tagColor: 'bg-green-500/20 text-green-500', highlight: true },
  { name: 'Identity Layer', tag: 'Live Now', tagColor: 'bg-green-500/20 text-green-500', highlight: false },
]

const SPRINTS = [
  {
    name: 'Sprint 1 — Polish & Trust',
    tag: 'In Progress',
    tagColor: 'bg-primary/20 text-primary',
    items: ['Resonate rebrand', 'AI intro message', 'Dark/light mode', 'Profile enhancements']
  },
  {
    name: 'Sprint 2 — Collaboration Layer',
    tag: 'Coming Soon',
    tagColor: 'bg-yellow-500/20 text-yellow-500',
    items: ['30-day Build Together engine', 'AI task breakdown', 'Shared workspace']
  },
  {
    name: 'Sprint 3 — Community Layer',
    tag: 'Planned',
    tagColor: 'bg-muted text-muted-foreground',
    items: ['Ikigai Circles', 'Goal-based pods', 'Skill tribes', 'AI news feed']
  },
  {
    name: 'Sprint 4 — Intelligence Layer',
    tag: 'Planned',
    tagColor: 'bg-muted text-muted-foreground',
    items: ['Predictive partnership scoring', 'Focus pattern analysis', 'Icebreaker prompts']
  },
  {
    name: 'Sprint 5 — Mentorship Layer',
    tag: 'Planned',
    tagColor: 'bg-muted text-muted-foreground',
    items: ['Purpose-matched mentoring', 'Reverse mentorship', 'AI meeting summarizer']
  },
  {
    name: 'Sprint 6 — Safety & Trust',
    tag: 'Planned',
    tagColor: 'bg-muted text-muted-foreground',
    items: ['Identity verification', 'Credibility scoring', 'NDA-lite generator']
  },
]

const MOATS = [
  {
    icon: Network,
    title: 'Network Effect Moat',
    desc: 'Every new member makes every existing member\'s matches better.'
  },
  {
    icon: Brain,
    title: 'Ikigai Moat',
    desc: 'Nobody else is building on Ikigai. You cannot copy purpose-based matching.'
  },
  {
    icon: Shield,
    title: 'Data Moat',
    desc: 'The most valuable professional dataset — not just what people do, but why.'
  },
]

export default function VisionPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-svh bg-background text-foreground transition-colors duration-200">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 lg:px-12">
        <Link href="/">
          <span className="text-lg font-semibold">Resonate</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Button asChild className="ai-glow">
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <span className="mb-4 inline-block rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          Last updated March 2026
        </span>
        <h1 className="text-4xl font-bold leading-tight text-balance sm:text-5xl">
          The Resonate Vision
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
          We started with one question: why do two people who are perfect for each other never meet? Today we answer it. Here is what we are building next.
        </p>
      </section>

      {/* The Resonate Stack */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold">The Resonate Stack</h2>
        <div className="space-y-3">
          {STACK_LAYERS.map((layer, i) => (
            <div
              key={layer.name}
              className={"flex items-center justify-between rounded-lg border px-6 py-4 transition-colors " + (
                layer.highlight
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Layer {5 - i}</span>
                <span className={"font-medium " + (layer.highlight ? 'text-primary' : '')}>{layer.name}</span>
              </div>
              <span className={"rounded-full px-2.5 py-0.5 text-xs font-medium " + layer.tagColor}>
                {layer.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Sprints Timeline */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold">Sprints Timeline</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SPRINTS.map(sprint => (
            <Card key={sprint.name} className="border-border/50">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight">{sprint.name}</h3>
                  <span className={"shrink-0 rounded-full px-2 py-0.5 text-xs font-medium " + sprint.tagColor}>
                    {sprint.tag}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {sprint.items.map(item => (
                    <li key={item} className="text-sm text-muted-foreground">• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* The Big Idea */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <div className="rounded-2xl bg-card/50 p-8 backdrop-blur sm:p-12">
          <Lightbulb className="mx-auto mb-6 h-10 w-10 text-primary" />
          <blockquote className="space-y-4 text-lg leading-relaxed sm:text-xl">
            <p>LinkedIn was built for the resume economy.</p>
            <p className="font-semibold text-primary">Resonate is built for the purpose economy.</p>
            <p>The shift from credentials to purpose is the defining career transition of our generation.</p>
            <p>Resonate is the infrastructure for that shift.</p>
          </blockquote>
        </div>
      </section>

      {/* Three Moats */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold">Our Moats</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {MOATS.map(moat => (
            <Card key={moat.title} className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-6">
                <moat.icon className="mb-4 h-8 w-8 text-primary" />
                <h3 className="mb-2 font-semibold">{moat.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{moat.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <div className="space-y-4 text-lg leading-relaxed text-muted-foreground">
          <p>The best partnerships were not found through job boards.</p>
          <p>They happened when two people with aligned purpose were in the same room.</p>
          <p className="font-semibold text-foreground">Resonate makes that room infinite.</p>
        </div>
        <Button size="lg" asChild className="mt-10 ai-glow">
          <Link href="/auth/sign-up">Find Your Match</Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Resonate</span>
            <span className="text-sm text-muted-foreground">— Find your people.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
