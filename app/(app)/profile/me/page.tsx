'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Save, Eye, X } from 'lucide-react'
import { toast } from 'sonner'

export default function MyProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [passion, setPassion] = useState('')
  const [mission, setMission] = useState('')
  const [vocation, setVocation] = useState('')
  const [profession, setProfession] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [newInterest, setNewInterest] = useState('')
  const [availability, setAvailability] = useState('')
  const [workingStyle, setWorkingStyle] = useState('')
  const [intent, setIntent] = useState<string[]>([])
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    async function load() {
      const { data } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
      if (data) {
        setFullName(data.full_name || '')
        setBio(data.bio || '')
        setPassion(data.ikigai_passion || '')
        setMission(data.ikigai_mission || '')
        setVocation(data.ikigai_vocation || '')
        setProfession(data.ikigai_profession || '')
        setSkills(data.skills || [])
        setInterests(data.interests || [])
        setAvailability(data.availability || '')
        setWorkingStyle(data.working_style || '')
        setIntent(data.intent || [])
        setPortfolioUrl(data.portfolio_url || '')
        setGithubUrl(data.github_url || '')
        setLinkedinUrl(data.linkedin_url || '')
        setIsPublic(data.is_public ?? true)
      }
      setLoading(false)
    }
    load()
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName,
        bio,
        ikigai_passion: passion,
        ikigai_mission: mission,
        ikigai_vocation: vocation,
        ikigai_profession: profession,
        skills,
        interests,
        availability,
        working_style: workingStyle,
        intent,
        portfolio_url: portfolioUrl,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        is_public: isPublic,
      })
      if (error) throw error
      toast.success('Profile saved!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const addSkill = () => {
    const trimmed = newSkill.trim()
    if (trimmed && !skills.includes(trimmed)) setSkills([...skills, trimmed])
    setNewSkill('')
  }

  const addInterest = () => {
    const trimmed = newInterest.trim()
    if (trimmed && !interests.includes(trimmed)) setInterests([...interests, trimmed])
    setNewInterest('')
  }

  const toggleIntent = (value: string) => {
    setIntent(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value])
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Edit your profile information</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="public-toggle" className="text-sm text-muted-foreground">Public</Label>
            <Switch id="public-toggle" checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Basic Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-1">
            <Label className="mb-1 text-sm font-medium">Full name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-10" />
          </div>
          <div className="grid gap-1">
            <Label className="mb-1 text-sm font-medium">Bio</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Ikigai</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-1">
            <Label className="mb-1 text-sm font-medium">Passion</Label>
            <Textarea value={passion} onChange={(e) => setPassion(e.target.value)} />
          </div>
          <Separator />
          <div className="grid gap-1">
            <Label className="mb-1 text-sm font-medium">Mission</Label>
            <Textarea value={mission} onChange={(e) => setMission(e.target.value)} />
          </div>
          <Separator />
          <div className="grid gap-1">
            <Label className="mb-1 text-sm font-medium">Vocation</Label>
            <Textarea value={vocation} onChange={(e) => setVocation(e.target.value)} />
          </div>
          <Separator />
          <div className="grid gap-1">
            <Label className="mb-1 text-sm font-medium">Profession</Label>
            <Textarea value={profession} onChange={(e) => setProfession(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Skills & Interests</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Skills</Label>
            <div className="flex flex-wrap gap-2">
              {skills.map(s => (
                <Badge key={s} variant="secondary" className="gap-1">
                  {s}
                  <button type="button" onClick={() => setSkills(skills.filter(sk => sk !== s))} aria-label={`Remove ${s}`}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                placeholder="Add a skill..." />
              <Button variant="outline" onClick={addSkill}>Add</Button>
            </div>
          </div>
          <Separator />
          <div className="grid gap-2">
            <Label>Interests</Label>
            <div className="flex flex-wrap gap-2">
              {interests.map(i => (
                <Badge key={i} variant="secondary" className="gap-1">
                  {i}
                  <button type="button" onClick={() => setInterests(interests.filter(int => int !== i))} aria-label={`Remove ${i}`}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newInterest} onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInterest() } }}
                placeholder="Add an interest..." />
              <Button variant="outline" onClick={addInterest}>Add</Button>
            </div>
          </div>
          <Separator />
          <div className="grid gap-2">
            <Label>Availability</Label>
            <div className="flex flex-wrap gap-2">
              {['Full-time', 'Part-time', 'Weekends only'].map(opt => (
                <button key={opt} type="button" onClick={() => setAvailability(opt)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    availability === opt ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}>{opt}</button>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Working style</Label>
            <div className="flex flex-wrap gap-2">
              {['Remote', 'Hybrid', 'In-person'].map(opt => (
                <button key={opt} type="button" onClick={() => setWorkingStyle(opt)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    workingStyle === opt ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}>{opt}</button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Looking for</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {['Cofounder', 'Teammate', 'Client'].map(type => (
              <button key={type} type="button" onClick={() => toggleIntent(type)}
                className={`rounded-xl border-2 px-6 py-3 text-sm font-semibold transition-colors ${
                  intent.includes(type)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}>{type}</button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Links</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-1">
            <Label className="mb-1 text-sm font-medium">Portfolio URL</Label>
            <Input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://..." className="h-10" />
          </div>
          <Separator />
          <div className="grid gap-1">
            <Label className="mb-1 text-sm font-medium">GitHub URL</Label>
            <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/..." className="h-10" />
          </div>
          <Separator />
          <div className="grid gap-1">
            <Label className="mb-1 text-sm font-medium">LinkedIn URL</Label>
            <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." className="h-10" />
          </div>
        </CardContent>
      </Card>

      {showPreview && (
        <Card className="border-primary/20">
          <CardHeader><CardTitle className="text-base">Profile Preview</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            This is how others will see your profile. Edit your details above to update.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
