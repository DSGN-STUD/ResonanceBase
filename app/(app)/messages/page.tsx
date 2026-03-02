'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Send, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

type Contact = {
  id: string
  full_name: string | null
  avatar_url: string | null
  lastMessage?: string
  lastTimestamp?: string
  unread?: number
}

type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [icebreakers, setIcebreakers] = useState<string[]>([])
  const [loadingIcebreakers, setLoadingIcebreakers] = useState(false)
  const [myProfile, setMyProfile] = useState<{ full_name: string | null; ikigai_passion: string | null } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load current user profile
  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase.from('profiles').select('full_name, ikigai_passion').eq('id', user.id).single()
      .then(({ data }) => setMyProfile(data))
  }, [user])

  const loadContacts = useCallback(async () => {
    if (!user) return
    const supabase = createClient()

    // Get all accepted connections
    const { data: connections } = await supabase.from('connections')
      .select('requester_id, receiver_id')
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq('status', 'accepted')

    if (!connections || connections.length === 0) {
      setLoading(false)
      return
    }

    const contactIds = connections.map(c =>
      c.requester_id === user.id ? c.receiver_id : c.requester_id
    )

    const { data: profiles } = await supabase.from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', contactIds)

    // Get latest message for each contact
    const contactList: Contact[] = (profiles ?? []).map(p => ({
      id: p.id,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
    }))

    setContacts(contactList)
    setLoading(false)
  }, [user])

  useEffect(() => {
    loadContacts()
  }, [loadContacts])

  const loadMessages = useCallback(async (contactId: string) => {
    if (!user) return
    const supabase = createClient()

    const { data } = await supabase.from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })

    setMessages((data as Message[]) ?? [])

    // Mark messages as read
    await supabase.from('messages')
      .update({ read: true })
      .eq('sender_id', contactId)
      .eq('receiver_id', user.id)
      .eq('read', false)
  }, [user])

  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact.id)
      setIcebreakers([]) // Clear icebreakers when changing contacts
    }
  }, [selectedContact, loadMessages])

  // Fetch icebreakers when conversation is empty
  const fetchIcebreakers = async () => {
    if (!selectedContact || !myProfile || messages.length > 0) return
    
    setLoadingIcebreakers(true)
    try {
      // Get receiver's profile for passion
      const supabase = createClient()
      const { data: receiverProfile } = await supabase
        .from('profiles')
        .select('ikigai_passion')
        .eq('id', selectedContact.id)
        .single()
      
      const res = await fetch('/api/icebreaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: myProfile.full_name || 'User',
          receiverName: selectedContact.full_name || 'User',
          senderPassion: myProfile.ikigai_passion || '',
          receiverPassion: receiverProfile?.ikigai_passion || ''
        })
      })
      
      const data = await res.json()
      if (Array.isArray(data.icebreakers)) {
        setIcebreakers(data.icebreakers)
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingIcebreakers(false)
    }
  }

  // Auto-fetch icebreakers when messages are loaded and empty
  useEffect(() => {
    if (selectedContact && messages.length === 0 && icebreakers.length === 0 && !loadingIcebreakers && myProfile) {
      fetchIcebreakers()
    }
  }, [selectedContact, messages.length, myProfile])

  // Realtime subscription
  useEffect(() => {
    if (!user || !selectedContact) return
    const supabase = createClient()

    const channel = supabase.channel('messages-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const msg = payload.new as Message
        if (
          (msg.sender_id === user.id && msg.receiver_id === selectedContact.id) ||
          (msg.sender_id === selectedContact.id && msg.receiver_id === user.id)
        ) {
          setMessages(prev => [...prev, msg])
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, selectedContact])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !selectedContact) return

    setSending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: selectedContact.id,
        content: newMessage.trim(),
      })
      if (error) throw error
      setNewMessage('')
      // Refresh messages if realtime doesn't kick in
      loadMessages(selectedContact.id)
    } catch {
      // Silently fail, user can retry
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    )
  }

  if (contacts.length === 0) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">Chat with your connections</p>
        </div>
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold">No connections yet</h3>
          <p className="text-sm text-muted-foreground">Connect with someone first to start messaging</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">Chat with your connections</p>
      </div>

      <div className="flex h-[calc(100svh-220px)] gap-4">
        {/* Contact list */}
        <Card className="w-72 shrink-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-1 p-4">
              {contacts.map(contact => (
                <button key={contact.id} onClick={() => setSelectedContact(contact)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors',
                    selectedContact?.id === contact.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-secondary'
                  )}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                    {(contact.full_name || '?')[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{contact.full_name || 'Unknown'}</p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat area */}
        {selectedContact ? (
          <Card className="flex flex-1 flex-col overflow-hidden">
            <div className="border-b border-border p-4">
              <p className="font-semibold">{selectedContact.full_name || 'Unknown'}</p>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={cn('flex', msg.sender_id === user?.id ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      'max-w-xs rounded-2xl px-4 py-2 text-sm',
                      msg.sender_id === user?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            {/* Icebreaker prompts - show only when conversation is empty */}
            {messages.length === 0 && icebreakers.length > 0 && (
              <div className="border-t border-border p-4">
                <p className="text-xs text-muted-foreground mb-2">Conversation starters</p>
                <div className="flex flex-wrap gap-2">
                  {icebreakers.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => setNewMessage(prompt)}
                      className="rounded-full bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <form onSubmit={handleSend} className="flex gap-3 border-t border-border p-4">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </Card>
        ) : (
          <Card className="flex flex-1 items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
              <p>Select a conversation to start chatting</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
