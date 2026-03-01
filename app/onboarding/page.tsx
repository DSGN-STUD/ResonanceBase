'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Heart, Target, Briefcase, Star, X } from 'lucide-react'
import { toast } from 'sonner'

const SKILL_SUGGESTIONS = ['React', 'Python', 'AI/ML', 'Design', 'Marketing', 'Sales', 'Finance', 'Operations', 'Content', 'TypeScript', 'Node.js', 'Product Management']

function TagInput({ tags, setTags, placeholder, suggestions }: {
  tags: string[]
  setTags: (tags: string[]) => void
  placeholder: string
  suggestions?: string[]
}) {
  const [input, setInput] = useState('')

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
    }
    setInput('')
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} aria-label={`Remove ${tag}`}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); addTag(input) }
        }}
        placeholder={placeholder}
      />
      {suggestions && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.filter(s => !tags.includes(s)).map(s => (
            <button key={s} type="button" onClick={() => addTag(s)}
              className="rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function PillSelect({ options, value, onChange }: {
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            value === opt
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}>
          {opt}
        </button>
      ))}
    </div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Step 1 - Ikigai
  const [fullName, setFullName] = useState('')
  const [passion, setPassion] = useState('')
  const [mission, setMission] = useState('')
  const [vocation, setVocation] = useState('')
  const [profession, setProfession] = useState('')

  // Step 2 - Skills
  const [skills, setSkills] = useState<string[]>([])
  const [interests, setInterests] = useState<string[]>([])
  const [availability, setAvailability] = useState('')
  const [workingStyle, setWorkingStyle] = useState('')

  // Step 3 - Intent
  const [intent, setIntent] = useState<string[]>([])
  const [bio, setBio] = useState('')

  // Step 4 - Links
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const toggleIntent = (value: string) => {
    setIntent(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value])
  }

  const saveAndContinue = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const profileData: Record<string, unknown> = { id: user.id }

      if (step === 1) {
        // full_name is required to mark profile as complete
        profileData.full_name = fullName || 'Anonymous User'
        profileData.ikigai_passion = passion
        profileData.ikigai_mission = mission
        profileData.ikigai_vocation = vocation
        profileData.ikigai_profession = profession
      } else if (step === 2) {
        profileData.skills = skills
        profileData.interests = interests
        profileData.availability = availability
        profileData.working_style = workingStyle
      } else if (step === 3) {
        profileData.intent = intent
        profileData.bio = bio
      } else if (step === 4) {
        profileData.portfolio_url = portfolioUrl
        profileData.github_url = githubUrl
        profileData.linkedin_url = linkedinUrl
      }

      const { error } = await supabase.from('profiles').upsert(profileData)
      if (error) throw error

      if (step < totalSteps) {
        setStep(step + 1)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const stepIcons = [
    <Heart key="heart" className="h-5 w-5" />,
    <Star key="star" className="h-5 w-5" />,
    <Target key="target" className="h-5 w-5" />,
    <Briefcase key="brief" className="h-5 w-5" />,
  ]

  const stepTitles = ['Ikigai Discovery', 'Skills & Interests', 'Your Intent', 'Portfolio & Links']
  const stepDescriptions = [
    'Tell us about your passions and purpose',
    'What skills do you bring to the table?',
    'What kind of connections are you looking for?',
    'Share your work and social links',
  ]

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Resonate</span>
          </div>
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {stepIcons[step - 1]}
              </div>
              <div>
                <CardTitle>{stepTitles[step - 1]}</CardTitle>
                <CardDescription>{stepDescriptions[step - 1]}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Your name</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name" />
                </div>
                <div className="grid gap-2">
                  <Label>What are you passionate about? (optional)</Label>
                  <Textarea value={passion} onChange={(e) => setPassion(e.target.value)}
                    placeholder="I'm passionate about building products that make people's lives easier..." />
                </div>
                <div className="grid gap-2">
                  <Label>What does the world need that you can offer? (optional)</Label>
                  <Textarea value={mission} onChange={(e) => setMission(e.target.value)}
                    placeholder="The world needs more accessible technology..." />
                </div>
                <div className="grid gap-2">
                  <Label>What can you be paid for? (optional)</Label>
                  <Textarea value={vocation} onChange={(e) => setVocation(e.target.value)}
                    placeholder="I can be paid for software engineering and consulting..." />
                </div>
                <div className="grid gap-2">
                  <Label>What are you great at? (optional)</Label>
                  <Textarea value={profession} onChange={(e) => setProfession(e.target.value)}
                    placeholder="I excel at full-stack development and system design..." />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="grid gap-2">
                  <Label>Skills (optional)</Label>
                  <TagInput tags={skills} setTags={setSkills} placeholder="Add a skill..." suggestions={SKILL_SUGGESTIONS} />
                </div>
                <div className="grid gap-2">
                  <Label>Interests (optional)</Label>
                  <TagInput tags={interests} setTags={setInterests} placeholder="Add an interest..." />
                </div>
                <div className="grid gap-2">
                  <Label>Availability (optional)</Label>
                  <PillSelect options={['Full-time', 'Part-time', 'Weekends only']} value={availability} onChange={setAvailability} />
                </div>
                <div className="grid gap-2">
                  <Label>Working style (optional)</Label>
                  <PillSelect options={['Remote', 'Hybrid', 'In-person']} value={workingStyle} onChange={setWorkingStyle} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="grid gap-2">
                  <Label>I am looking for... (optional)</Label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {['Cofounder', 'Teammate', 'Client'].map(type => (
                      <button key={type} type="button" onClick={() => toggleIntent(type)}
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-6 text-center transition-colors ${
                          intent.includes(type)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}>
                        <span className="text-2xl">
                          {type === 'Cofounder' ? '🤝' : type === 'Teammate' ? '👥' : '💼'}
                        </span>
                        <span className="font-semibold">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Short bio (optional)</Label>
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell people a bit about yourself..."
                    className="min-h-[100px]" />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Portfolio URL (optional)</Label>
                  <Input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourportfolio.com" />
                </div>
                <div className="grid gap-2">
                  <Label>GitHub URL (optional)</Label>
                  <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username" />
                </div>
                <div className="grid gap-2">
                  <Label>LinkedIn URL (optional)</Label>
                  <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username" />
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              {step > 1 ? (
                <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
              ) : <div />}
              <Button onClick={saveAndContinue} disabled={saving}>
                {saving ? 'Saving...' : step === totalSteps ? 'Complete setup' : 'Continue'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
