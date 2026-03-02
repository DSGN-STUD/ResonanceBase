'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Heart, Target, Briefcase, Star, ExternalLink, UserPlus, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { IntroMessageModal } from '@/components/intro-message-modal'

type Profile = {
  id: string
  full_name: string | null
  email: string | null
  bio: string | null
  avatar_url: string | null
  ikigai_passion: string | null
  ikigai_mission: string | null
  ikigai_vocation: string | null
  ikigai_profession: string | null
  skills: string[]
  interests: string[]
  intent: string[]
  availability: string | null
  working_style: string | null
  portfolio_url: string | null
  github_url: string | null
  linkedin_url: string | null
}

export default function ProfileViewPage() {
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [introModalOpen, setIntroModalOpen] = useState(false)
  const [myProfile, setMyProfile] = useState<{ full_name: string | null; ikigai_passion: string | null; skills: string[] | null } | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
      setProfile(data as Profile | null)

      if (user && user.id !== id) {
        const [connRes, myProfileRes] = await Promise.all([
          supabase.from('connections').select('status')
            .or(`and(requester_id.eq.${user.id},receiver_id.eq.${id}),and(requester_id.eq.${id},receiver_id.eq.${user.id})`)
            .limit(1)
            .single(),
          supabase.from('profiles').select('full_name, ikigai_passion, skills').eq('id', user.id).single()
        ])

        setConnectionStatus(connRes.data?.status ?? null)
        setMyProfile(myProfileRes.data)
      }
      setLoading(false)
    }

    load()
  }, [id, user])

  const handleConnect = async (introMessage?: string) => {
    if (!user) return
    setConnecting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('connections').insert({
        requester_id: user.id,
        receiver_id: id,
        status: 'pending',
        intro_message: introMessage || null,
      })
      
      if (error) {
        console.error('Connection error:', error.message)
        // If it's a duplicate, just update the UI
        if (error.code === '23505') {
          setConnectionStatus('pending')
          toast.info('Connection request already sent')
          return
        }
        throw error
      }
      
      // Update UI immediately
      setConnectionStatus('pending')
      toast.success('Connection request sent!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to connect')
    } finally {
      setConnecting(false)
    }
  }

  const openIntroModal = () => {
    setIntroModalOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!profile) {
    return <p className="text-muted-foreground">Profile not found.</p>
  }

  const ikigaiItems = [
    { label: 'Passion', value: profile.ikigai_passion, icon: Heart, color: 'text-red-400' },
    { label: 'Mission', value: profile.ikigai_mission, icon: Target, color: 'text-blue-400' },
    { label: 'Vocation', value: profile.ikigai_vocation, icon: Briefcase, color: 'text-green-400' },
    { label: 'Profession', value: profile.ikigai_profession, icon: Star, color: 'text-yellow-400' },
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{profile.full_name || 'Anonymous'}</h1>
          {profile.bio && <p className="mt-1 text-muted-foreground">{profile.bio}</p>}
        </div>
        {user && user.id !== id && (
          <div className="flex gap-2">
            {connectionStatus === 'accepted' ? (
              <Button asChild>
                <Link href="/messages" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Message
                </Link>
              </Button>
            ) : connectionStatus === 'pending' ? (
              <Button disabled variant="outline">Request pending</Button>
            ) : (
              <Button onClick={openIntroModal} disabled={connecting} className="gap-2 ai-glow">
                <UserPlus className="h-4 w-4" />
                {connecting ? 'Sending...' : 'Connect'}
              </Button>
            )}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ikigai</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {ikigaiItems.map(item => (
              <div key={item.label} className="rounded-lg bg-secondary/50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.value || 'Not shared'}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Skills</CardTitle></CardHeader>
          <CardContent>
            {profile.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
              </div>
            ) : <p className="text-sm text-muted-foreground">No skills listed</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Looking for</CardTitle></CardHeader>
          <CardContent>
            {profile.intent?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.intent.map(i => <Badge key={i}>{i}</Badge>)}
              </div>
            ) : <p className="text-sm text-muted-foreground">Not specified</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {profile.availability && <p><span className="text-muted-foreground">Availability:</span> {profile.availability}</p>}
          {profile.working_style && <p><span className="text-muted-foreground">Working style:</span> {profile.working_style}</p>}
        </CardContent>
      </Card>

      {(profile.portfolio_url || profile.github_url || profile.linkedin_url) && (
        <Card>
          <CardHeader><CardTitle className="text-base">Links</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {profile.portfolio_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" /> Portfolio
                </a>
              </Button>
            )}
            {profile.github_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" /> GitHub
                </a>
              </Button>
            )}
            {profile.linkedin_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" /> LinkedIn
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <IntroMessageModal
        open={introModalOpen}
        onOpenChange={setIntroModalOpen}
        senderProfile={myProfile}
        receiverProfile={profile ? {
          full_name: profile.full_name,
          ikigai_passion: profile.ikigai_passion,
          skills: profile.skills
        } : null}
        onSend={(message) => {
          handleConnect(message)
          setIntroModalOpen(false)
        }}
        onSkip={() => {
          handleConnect()
          setIntroModalOpen(false)
        }}
      />
    </div>
  )
}
