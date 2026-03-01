'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Sparkles } from 'lucide-react'

interface IntroMessageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  senderProfile: {
    full_name: string | null
    ikigai_passion: string | null
    skills: string[] | null
  } | null
  receiverProfile: {
    full_name: string | null
    ikigai_passion: string | null
    skills: string[] | null
  } | null
  onSend: (message: string) => void
  onSkip: () => void
}

export function IntroMessageModal({
  open,
  onOpenChange,
  senderProfile,
  receiverProfile,
  onSend,
  onSkip
}: IntroMessageModalProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && senderProfile && receiverProfile) {
      generateMessage()
    }
  }, [open, senderProfile, receiverProfile])

  const generateMessage = async () => {
    if (!senderProfile || !receiverProfile) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/intro-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: senderProfile.full_name || 'Someone',
          receiverName: receiverProfile.full_name || 'you',
          senderPassion: senderProfile.ikigai_passion || '',
          receiverPassion: receiverProfile.ikigai_passion || '',
          senderSkills: (senderProfile.skills || []).join(', '),
          receiverSkills: (receiverProfile.skills || []).join(', ')
        })
      })
      const data = await res.json()
      setMessage(data.message || '')
    } catch {
      setMessage('Hi! I came across your profile and think we could create something great together. Would love to connect!')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = () => {
    onSend(message)
    setMessage('')
  }

  const handleSkip = () => {
    onSkip()
    setMessage('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Start with the right words
          </DialogTitle>
          <DialogDescription>
            We crafted an intro message based on your profiles. Edit it or send as-is.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Crafting your intro...</span>
              </div>
            </div>
          ) : (
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your intro message..."
              rows={5}
              className="resize-none"
            />
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={loading}
          >
            Skip — send without message
          </Button>
          <Button
            onClick={handleSend}
            disabled={loading || !message}
            className="ai-glow"
          >
            Send Connection Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
