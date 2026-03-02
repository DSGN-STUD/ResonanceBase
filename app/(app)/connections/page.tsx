'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Check, X, MessageSquare, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

type Connection = {
  id: string
  requester_id: string
  receiver_id: string
  status: string
  created_at: string
  profile: { full_name: string | null; avatar_url: string | null } | null
}

export default function ConnectionsPage() {
  const { user } = useAuth()
  const [pending, setPending] = useState<Connection[]>([])
  const [accepted, setAccepted] = useState<Connection[]>([])
  const [sent, setSent] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)

  const loadConnections = useCallback(async () => {
    if (!user) return
    const supabase = createClient()

    const [pendingRes, acceptedReqRes, acceptedAddrRes, sentRes] = await Promise.all([
      supabase.from('connections').select('*, profile:profiles!connections_requester_id_fkey(full_name, avatar_url)')
        .eq('receiver_id', user.id).eq('status', 'pending'),
      supabase.from('connections').select('*, profile:profiles!connections_receiver_id_fkey(full_name, avatar_url)')
        .eq('requester_id', user.id).eq('status', 'accepted'),
      supabase.from('connections').select('*, profile:profiles!connections_requester_id_fkey(full_name, avatar_url)')
        .eq('receiver_id', user.id).eq('status', 'accepted'),
      supabase.from('connections').select('*, profile:profiles!connections_receiver_id_fkey(full_name, avatar_url)')
        .eq('requester_id', user.id).eq('status', 'pending'),
    ])

    setPending((pendingRes.data as unknown as Connection[]) ?? [])
    const allAccepted = [
      ...((acceptedReqRes.data as unknown as Connection[]) ?? []),
      ...((acceptedAddrRes.data as unknown as Connection[]) ?? []),
    ]
    setAccepted(allAccepted)
    setSent((sentRes.data as unknown as Connection[]) ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    loadConnections()
  }, [loadConnections])

  const handleAccept = async (connId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('connections').update({ status: 'accepted' }).eq('id', connId)
    if (error) { toast.error('Failed to accept'); return }
    toast.success('Connection accepted!')
    loadConnections()
  }

  const handleDecline = async (connId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('connections').update({ status: 'declined' }).eq('id', connId)
    if (error) { toast.error('Failed to decline'); return }
    toast.success('Connection declined')
    loadConnections()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  const withdrawConnection = async (connectionId: string) => {
    if (!user) return
    const supabase = createClient()
    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', connectionId)
      .eq('requester_id', user.id)
      .eq('status', 'pending')
    
    if (error) {
      toast.error('Failed to withdraw request')
      return
    }
    
    // Remove from UI immediately
    setSent(prev => prev.filter(c => c.id !== connectionId))
    toast.success('Request withdrawn')
  }

  const removeConnection = async (connectionId: string) => {
    if (!user) return
    const supabase = createClient()
    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', connectionId)
    
    if (error) {
      toast.error('Failed to remove connection')
      return
    }
    
    // Remove from UI immediately
    setAccepted(prev => prev.filter(c => c.id !== connectionId))
    toast.success('Connection removed')
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Connections</h1>
        <p className="text-muted-foreground">Manage your network</p>
      </div>

      <Tabs defaultValue="pending" className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="gap-1.5">
            Pending {pending.length > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{pending.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {pending.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No pending requests</CardContent></Card>
          ) : (
            pending.map(conn => (
              <Card key={conn.id}>
                <CardContent className="flex items-center gap-3 p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 font-bold text-primary">
                    {(conn.profile?.full_name || '?')[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{conn.profile?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">Wants to connect</p>
                  </div>
                  <div className="flex gap-3">
                    <Button size="sm" onClick={() => handleAccept(conn.id)} className="gap-1.5">
                      <Check className="h-3.5 w-3.5" /> Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDecline(conn.id)} className="gap-1.5">
                      <X className="h-3.5 w-3.5" /> Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="accepted" className="mt-4 space-y-3">
          {accepted.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
              No connections yet
            </CardContent></Card>
          ) : (
            accepted.map(conn => (
              <Card key={conn.id}>
                <CardContent className="flex items-center gap-3 p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 font-bold text-primary">
                    {(conn.profile?.full_name || '?')[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{conn.profile?.full_name || 'Unknown'}</p>
                    <Badge variant="secondary" className="text-xs">Connected</Badge>
                  </div>
                  <Button size="sm" variant="outline" asChild className="gap-1.5">
                    <Link href="/messages">
                      <MessageSquare className="h-3.5 w-3.5" /> Message
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeConnection(conn.id)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-4 space-y-3">
          {sent.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No sent requests</CardContent></Card>
          ) : (
            sent.map(conn => (
              <Card key={conn.id}>
                <CardContent className="flex items-center gap-3 p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 font-bold text-primary">
                    {(conn.profile?.full_name || '?')[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{conn.profile?.full_name || 'Unknown'}</p>
                  </div>
                  <Badge variant="outline" className="gap-1.5">
                    <Clock className="h-3 w-3" /> Pending
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => withdrawConnection(conn.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    Withdraw
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
