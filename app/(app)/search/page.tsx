'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Search, UserPlus, Eye, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

type MatchResult = {
  userId: string
  score: number
  matchType: string
  explanation: string
  profile?: {
    full_name: string | null
    avatar_url: string | null
    skills: string[]
  }
}

const FILTERS = ['All', 'Cofounder', 'Teammate', 'Client']

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${color} text-lg font-bold text-white`}>
      {score}
    </div>
  )
}

export default function SearchPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [results, setResults] = useState<MatchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [connecting, setConnecting] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || !user) return

    setSearching(true)
    setResults([])

    try {
      const supabase = createClient()
      console.log('[v0] Search started for user:', user.id)

      // Fetch current user profile
      const { data: myProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      console.log('[v0] My profile fetched:', !!myProfile, 'Error:', profileError?.message)

      // Fetch all public profiles except current user
      const { data: candidates, error: candidatesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true)
        .neq('id', user.id)

      console.log('[v0] Candidates fetched:', candidates?.length ?? 0, 'Error:', candidatesError?.message)

      if (!candidates || candidates.length === 0) {
        toast.info('No profiles found yet. Be the first to complete your profile!')
        setSearching(false)
        return
      }

      console.log('[v0] Calling /api/match with', candidates.length, 'candidates')

      // Call AI API route with new parameter names
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchQuery: query,
          currentUser: myProfile,
          candidates,
        }),
      })

      console.log('[v0] API response status:', res.status)

      if (!res.ok) {
        const errorText = await res.text()
        console.error('[v0] API error response:', errorText)
        throw new Error('AI matching failed')
      }

      const responseData = await res.json()
      console.log('[v0] Match results received:', responseData)
      
      // Check if response is an error
      if (responseData.error) {
        console.error('[v0] API returned error:', responseData.error)
        toast.error('AI Error: ' + responseData.error)
        setSearching(false)
        return
      }
      
      // API returns { matches: [...] }
      const matchResults: MatchResult[] = Array.isArray(responseData.matches) ? responseData.matches : []

      // Enrich with profile data
      const enriched = matchResults.map(m => {
        const cand = candidates.find(c => c.id === m.userId)
        return {
          ...m,
          profile: cand ? {
            full_name: cand.full_name,
            avatar_url: cand.avatar_url,
            skills: cand.skills ?? [],
          } : undefined,
        }
      })

      // Save matches to DB
      const matchInserts = enriched.map(m => ({
        user_id: user.id,
        matched_user_id: m.userId,
        match_score: m.score,
        match_type: m.matchType,
        ai_explanation: m.explanation,
      }))

      if (matchInserts.length > 0) {
        await supabase.from('matches').upsert(matchInserts, { onConflict: 'user_id,matched_user_id' })
      }

      setResults(enriched)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setSearching(false)
    }
  }

  const handleConnect = async (matchedUserId: string) => {
    if (!user) return
    setConnecting(matchedUserId)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('connections').upsert({
        requester_id: user.id,
        receiver_id: matchedUserId,
        status: 'pending',
      }, { onConflict: 'requester_id,receiver_id' })

      if (error) throw error
      toast.success('Connection request sent!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to connect')
    } finally {
      setConnecting(null)
    }
  }

  const filtered = filter === 'All' ? results : results.filter(r => r.matchType === filter)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Find Your Match</h1>
        <p className="text-muted-foreground">Describe who you are looking for in plain English</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find me a technical cofounder who loves AI..."
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={searching} className="gap-2">
          <Sparkles className="h-4 w-4" />
          {searching ? 'Searching...' : 'Search'}
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {searching && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="flex items-start gap-4 p-6">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!searching && results.length > 0 && filtered.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No matches found for this filter. Try selecting a different category.</p>
          </CardContent>
        </Card>
      )}

      {!searching && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map(match => (
            <Card key={match.userId}>
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
                <ScoreBadge score={match.score} />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{match.profile?.full_name || 'Unknown'}</h3>
                    <Badge variant="outline">{match.matchType}</Badge>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{match.explanation}</p>
                  {match.profile?.skills && match.profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {match.profile.skills.slice(0, 5).map(s => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/profile/${match.userId}`} className="gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Link>
                  </Button>
                  <Button size="sm" onClick={() => handleConnect(match.userId)}
                    disabled={connecting === match.userId} className="gap-1.5">
                    <UserPlus className="h-3.5 w-3.5" />
                    {connecting === match.userId ? 'Sending...' : 'Connect'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!searching && results.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Describe your ideal match</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Use natural language to find cofounders, teammates, or clients who complement your skills and share your vision.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
