'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Search, Users, MessageSquare, Sparkles, ArrowRight } from 'lucide-react'

type Profile = {
  full_name: string | null
  avatar_url: string | null
}

type Match = {
  id: string
  matched_user_id: string
  match_score: number
  match_type: string | null
  ai_explanation: string | null
  profiles: Profile | null
}

type Message = {
  id: string
  sender_id: string
  content: string
  created_at: string
  profiles: Profile | null
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null)
  const [stats, setStats] = useState({ matches: 0, pending: 0, unread: 0 })
  const [recentMatches, setRecentMatches] = useState<Match[]>([])
  const [recentMessages, setRecentMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()

    async function loadDashboard() {
      const [profileRes, matchesCountRes, pendingRes, unreadRes, matchesRes, messagesRes] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', user!.id).single(),
        supabase.from('matches').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
        supabase.from('connections').select('id', { count: 'exact', head: true }).eq('receiver_id', user!.id).eq('status', 'pending'),
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('receiver_id', user!.id).eq('read', false),
        supabase.from('matches').select('id, matched_user_id, match_score, match_type, ai_explanation, profiles:profiles!matches_matched_user_id_fkey(full_name, avatar_url)').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(3),
        supabase.from('messages').select('id, sender_id, content, created_at, profiles:profiles!messages_sender_id_fkey(full_name, avatar_url)').eq('receiver_id', user!.id).order('created_at', { ascending: false }).limit(3),
      ])

      setProfile(profileRes.data)
      setStats({
        matches: matchesCountRes.count ?? 0,
        pending: pendingRes.count ?? 0,
        unread: unreadRes.count ?? 0,
      })
      setRecentMatches((matchesRes.data as unknown as Match[]) ?? [])
      setRecentMessages((messagesRes.data as unknown as Message[]) ?? [])
      setLoading(false)
    }

    loadDashboard()
  }, [user])

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-balance mb-2">Hey {firstName}, {"let's find your people"}</h1>
        <p className="text-muted-foreground">Your networking hub at a glance</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.matches}</p>
              <p className="text-sm text-muted-foreground">Total Matches</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-chart-2/10">
              <Users className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending Connections</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-chart-3/10">
              <MessageSquare className="h-6 w-6 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.unread}</p>
              <p className="text-sm text-muted-foreground">Unread Messages</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Ready to find your match?</h2>
            <p className="text-sm text-muted-foreground">Use AI to discover people aligned with your Ikigai</p>
          </div>
          <Button asChild size="lg">
            <Link href="/search" className="gap-2">
              <Search className="h-4 w-4" />
              Find Your Match
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold">Recent Matches</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/search" className="gap-1 text-xs">View all <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentMatches.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No matches yet. Start searching to find your people!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMatches.map(match => {
                  const scoreColor = match.match_score >= 80 ? 'bg-green-500' : match.match_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  return (
                    <Link 
                      key={match.id} 
                      href={`/profile/${match.matched_user_id}`}
                      className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3 transition-colors hover:bg-secondary"
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${scoreColor} text-sm font-bold text-white`}>
                        {match.match_score}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{match.profiles?.full_name || 'Unknown'}</p>
                        <p className="truncate text-xs text-muted-foreground">{match.ai_explanation}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold">Recent Messages</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/messages" className="gap-1 text-xs">View all <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentMessages.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No messages yet. Connect with people to start chatting!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMessages.map(msg => (
                  <div key={msg.id} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                      {(msg.profiles?.full_name || '?')[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{msg.profiles?.full_name || 'Unknown'}</p>
                      <p className="truncate text-xs text-muted-foreground">{msg.content}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
