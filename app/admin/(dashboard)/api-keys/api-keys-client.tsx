'use client'

import React, { useState } from 'react'
import { ApiKey } from '@/lib/db/schema'
import { createApiKey, deleteApiKey, generateAutomationJwt } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CurlSnippet } from '@/components/admin/curl-snippet'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { Key, Plus, Trash2, Copy, Check, ShieldAlert, Sparkles, Terminal, Workflow, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ApiKeysClientProps {
  initialKeys: ApiKey[]
  baseUrl: string
}

export function ApiKeysClient({ initialKeys, baseUrl }: ApiKeysClientProps) {
  const router = useRouter()
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys)
  const [newKeyName, setNewKeyName] = useState('')
  const [creating, setCreating] = useState(false)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)

  // JWT Token generation state for n8n
  const [jwtName, setJwtName] = useState('n8n-automation-agent')
  const [jwtExpiresIn, setJwtExpiresIn] = useState('365d')
  const [generatingJwt, setGeneratingJwt] = useState(false)
  const [generatedJwt, setGeneratedJwt] = useState<{
    token: string
    authHeader: string
    expiresAt: string
  } | null>(null)
  const [copiedJwt, setCopiedJwt] = useState(false)
  const [copiedN8nConfig, setCopiedN8nConfig] = useState(false)

  // Selected key for cURL examples (defaults to first key if available)
  const [selectedKeyId, setSelectedKeyId] = useState<number | null>(
    initialKeys.length > 0 ? initialKeys[0].id : null
  )

  const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Active key value for curl injection: if selected and matches newly created key, use full key; otherwise display key token
  const activeKeyDisplay = newlyCreatedKey
    ? newlyCreatedKey
    : keys.length > 0
    ? keys.find((k) => k.id === selectedKeyId)?.key || keys[0].key
    : 'YOUR_API_KEY_HERE'

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyName.trim()) return

    setCreating(true)
    try {
      const res = await createApiKey(newKeyName)
      if (res.success && res.key) {
        setNewlyCreatedKey(res.key)
        setKeys([
          {
            id: res.id,
            name: newKeyName.trim(),
            key: res.key,
            lastUsedAt: null,
            createdAt: new Date(),
          },
          ...keys,
        ])
        setSelectedKeyId(res.id)
        setNewKeyName('')
        toast.success('API Key generated successfully!')
      }
    } catch {
      toast.error('Failed to create API key')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteKey = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteApiKey(deleteTarget.id)
      const updated = keys.filter((k) => k.id !== deleteTarget.id)
      setKeys(updated)
      if (selectedKeyId === deleteTarget.id) {
        setSelectedKeyId(updated.length > 0 ? updated[0].id : null)
      }
      toast.success('API key revoked')
      router.refresh()
    } catch {
      toast.error('Failed to revoke key')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const copySecretKey = async () => {
    if (!newlyCreatedKey) return
    await navigator.clipboard.writeText(newlyCreatedKey)
    setCopiedKey(true)
    toast.success('Copied API key to clipboard')
    setTimeout(() => setCopiedKey(false), 2000)
  }

  // Helper to format masked key
  const maskKey = (rawKey: string) => {
    if (rawKey.length < 12) return rawKey
    return `${rawKey.slice(0, 7)}••••••••••••${rawKey.slice(-4)}`
  }

  const handleGenerateJwt = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneratingJwt(true)
    try {
      const res = await generateAutomationJwt(jwtName, jwtExpiresIn)
      if (res.success) {
        setGeneratedJwt(res)
        toast.success('JWT Token generated successfully for n8n!')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to generate JWT')
    } finally {
      setGeneratingJwt(false)
    }
  }

  const copyJwt = async () => {
    if (!generatedJwt) return
    await navigator.clipboard.writeText(generatedJwt.token)
    setCopiedJwt(true)
    toast.success('Copied JWT Token to clipboard')
    setTimeout(() => setCopiedJwt(false), 2000)
  }

  const copyN8nConfig = async () => {
    const activeToken = generatedJwt?.token || activeKeyDisplay
    const n8nJson = {
      name: 'Post to Portfolio Blog',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [250, 300],
      parameters: {
        method: 'POST',
        url: `${baseUrl}/api/blog`,
        sendHeaders: true,
        headerParameters: {
          parameters: [
            {
              name: 'Authorization',
              value: `Bearer ${activeToken}`,
            },
            {
              name: 'Content-Type',
              value: 'application/json',
            },
          ],
        },
        sendBody: true,
        contentType: 'json',
        bodyParameters: {
          parameters: [
            { name: 'title', value: '={{ $json.title }}' },
            { name: 'slug', value: '={{ $json.slug }}' },
            { name: 'category', value: '={{ $json.category || "AI & Automation" }}' },
            { name: 'excerpt', value: '={{ $json.excerpt }}' },
            { name: 'content', value: '={{ $json.content }}' },
            { name: 'tags', value: '={{ $json.tags || ["AI", "Automation"] }}' },
            { name: 'published', value: true },
            { name: 'updateIfExists', value: true },
          ],
        },
      },
    }
    await navigator.clipboard.writeText(JSON.stringify(n8nJson, null, 2))
    setCopiedN8nConfig(true)
    toast.success('Copied n8n HTTP Request node configuration!')
    setTimeout(() => setCopiedN8nConfig(false), 2000)
  }

  return (
    <div className="space-y-10 max-w-5xl">
      {/* Newly Created Key Alert Modal/Banner */}
      {newlyCreatedKey && (
        <div className="p-5 rounded-xl border border-[#a3e635]/40 bg-[#a3e635]/10 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Sparkles className="w-4 h-4 text-[#a3e635]" />
            New API Key Created — Save It Now!
          </div>
          <p className="text-xs text-white/70">
            Copy this secret token immediately. For security, it will only be displayed once.
          </p>

          <div className="flex items-center gap-2 bg-[#09090b] border border-[#a3e635]/30 rounded-lg p-2 max-w-xl">
            <code className="text-xs font-mono text-[#a3e635] flex-1 truncate px-2">
              {newlyCreatedKey}
            </code>
            <Button
              size="sm"
              onClick={copySecretKey}
              className="bg-[#a3e635] text-black hover:bg-[#bef264] text-xs font-semibold gap-1.5 h-8"
            >
              {copiedKey ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Key
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Key Generation Section */}
      <div className="rounded-xl border border-white/10 bg-[#121216]/60 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-[#a3e635]" />
          Create API Access Key
        </h3>
        <p className="text-xs text-white/50">
          Generate a secret Bearer token to create, update, or automate blog posts and projects from external workflows.
        </p>

        <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key label (e.g. n8n Automation, Python Script, Daily Publisher)"
              className="bg-[#0c0c0f] border-white/10 text-white text-xs h-10"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={creating || !newKeyName.trim()}
            className="bg-[#a3e635] text-black hover:bg-[#bef264] text-xs font-semibold px-5 h-10 gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            {creating ? 'Generating...' : 'Generate Key'}
          </Button>
        </form>
      </div>

      {/* Existing Keys Table */}
      <div className="rounded-xl border border-white/10 bg-[#121216]/60 overflow-hidden space-y-2 p-6">
        <h3 className="text-sm font-semibold text-white">Active API Keys</h3>

        {keys.length === 0 ? (
          <p className="text-xs text-white/40 py-4 text-center">
            No API keys generated yet. Create one above to enable external publishing!
          </p>
        ) : (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-white/40">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Name</th>
                  <th className="py-2.5 px-3 font-medium">Key Token</th>
                  <th className="py-2.5 px-3 font-medium">Created</th>
                  <th className="py-2.5 px-3 font-medium">Last Used</th>
                  <th className="py-2.5 px-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3 font-medium text-white">{k.name}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-white/60">
                      {maskKey(k.key)}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-white/40">
                      {new Date(k.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-white/40">
                      {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(k)}
                        className="text-red-400/70 hover:text-red-300 hover:bg-red-500/10 p-1.5 h-7"
                        title="Revoke key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* n8n Automation & Webhook Integration (Bearer API Key + JWT) */}
      {/* ========================================================================= */}
      <div className="space-y-6 rounded-2xl border border-white/10 bg-[#121216]/70 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#a3e635]/10 border border-[#a3e635]/20 text-[#a3e635]">
                <Workflow className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">
                n8n Automation & Webhook Integration
              </h3>
            </div>
            <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
              Safely create and update large 2,000+ word technical blog posts directly from n8n using <strong>Bearer API Keys</strong> or signed <strong>JWT tokens</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Dual Auth (Bearer + JWT) Ready
            </span>
          </div>
        </div>

        {/* 1. JWT Generator Card */}
        <div className="rounded-xl border border-white/10 bg-[#0a0a0d] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#a3e635]" />
                Generate Signed JWT for n8n Workflow
              </h4>
              <p className="text-xs text-white/50 mt-0.5">
                Generates a cryptographically signed HS256 JWT token with custom expiry. Use in n8n&apos;s Authorization header.
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerateJwt} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-6 space-y-1.5">
              <Label className="text-xs text-white/70">Token Label / Agent Name</Label>
              <Input
                value={jwtName}
                onChange={(e) => setJwtName(e.target.value)}
                placeholder="e.g. n8n-shopify-blog-bot"
                className="bg-[#121216] border-white/10 text-white text-xs h-9"
              />
            </div>
            <div className="sm:col-span-3 space-y-1.5">
              <Label className="text-xs text-white/70">Expiration</Label>
              <select
                value={jwtExpiresIn}
                onChange={(e) => setJwtExpiresIn(e.target.value)}
                className="w-full bg-[#121216] border border-white/10 rounded-lg text-xs text-white p-2 h-9 outline-none"
              >
                <option value="30d">30 Days</option>
                <option value="90d">90 Days</option>
                <option value="365d">1 Year (365 Days)</option>
                <option value="never">Never Expires</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <Button
                type="submit"
                disabled={generatingJwt}
                className="w-full bg-[#a3e635] text-black hover:bg-[#bef264] text-xs font-semibold h-9"
              >
                {generatingJwt ? 'Generating...' : 'Generate JWT Token'}
              </Button>
            </div>
          </form>

          {/* Generated JWT Display */}
          {generatedJwt && (
            <div className="mt-4 p-4 rounded-lg border border-[#a3e635]/30 bg-[#a3e635]/5 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#a3e635]" />
                  JWT Token Active (Expires: {generatedJwt.expiresAt === 'never' ? 'Never' : new Date(generatedJwt.expiresAt).toLocaleDateString()})
                </span>
                <Button
                  size="sm"
                  onClick={copyJwt}
                  className="bg-[#a3e635] text-black hover:bg-[#bef264] text-xs font-semibold h-7 px-3 gap-1.5"
                >
                  {copiedJwt ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedJwt ? 'Copied Token' : 'Copy JWT'}
                </Button>
              </div>
              <div className="p-2.5 rounded bg-black/50 border border-white/10 font-mono text-[11px] text-[#bef264] break-all select-all">
                {generatedJwt.token}
              </div>
              <p className="text-[11px] text-white/40">
                In n8n, set Header: <code className="text-white/70">Authorization: Bearer {generatedJwt.token.slice(0, 16)}...</code>
              </p>
            </div>
          )}
        </div>

        {/* 2. n8n HTTP Request Setup Guide */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-[#0a0a0d] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                n8n HTTP Request Node Configuration
              </h4>
              <button
                type="button"
                onClick={copyN8nConfig}
                className="flex items-center gap-1.5 text-[11px] text-[#a3e635] hover:underline"
              >
                {copiedN8nConfig ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                Copy Node JSON
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/40">Method:</span>
                <span className="text-emerald-400 font-bold">POST</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/40">URL:</span>
                <span className="text-white/90 text-right truncate max-w-[220px]">{baseUrl}/api/blog</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/40">Authentication:</span>
                <span className="text-white/80">Header Auth</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/40">Header 1:</span>
                <span className="text-white/80">Authorization: Bearer &lt;TOKEN&gt;</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/40">Header 2:</span>
                <span className="text-white/80">Content-Type: application/json</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-white/40">Upsert Enabled:</span>
                <span className="text-lime-400 font-semibold">&quot;updateIfExists&quot;: true</span>
              </div>
            </div>

            <p className="text-[11px] text-white/50 pt-2 border-t border-white/10">
              💡 Tip: Click <strong>&quot;Copy Node JSON&quot;</strong> and paste it directly into your n8n canvas using <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Ctrl+V</kbd>.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0a0a0d] p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Sample n8n JSON Body Payload
            </h4>
            <div className="p-3 rounded-lg bg-black/60 border border-white/10 font-mono text-[11px] text-white/75 overflow-x-auto max-h-[220px] leading-relaxed">
              <pre>{`{
  "title": "How to Build an AI Support Voice Agent",
  "slug": "how-to-build-ai-support-voice-agent",
  "category": "AI Voice Agents",
  "excerpt": "A complete 2,000+ word technical guide to zero-latency telephony.",
  "content": "## 1. Architecture Overview\\n\\nCaller -> Twilio -> Vapi -> Apps Script\\n\\n<ProductCheckout title='Complete Blueprint' price='$97' productId='voice-bp' />",
  "tags": ["AI Voice", "Vapi", "Twilio", "n8n"],
  "published": true,
  "updateIfExists": true
}`}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Ready-to-copy cURL Commands */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#a3e635]" />
              Ready-to-copy cURL Commands
            </h3>
            <p className="text-xs text-white/50">
              Click &quot;Copy cURL&quot; on any command to run it in your terminal or automation tool
            </p>
          </div>

          {keys.length > 0 && (
            <div className="flex items-center gap-2">
              <Label className="text-xs text-white/60 whitespace-nowrap">Inject Key:</Label>
              <select
                value={selectedKeyId ?? ''}
                onChange={(e) => setSelectedKeyId(Number(e.target.value))}
                className="bg-[#0c0c0f] border border-white/10 rounded-lg text-xs text-white p-1.5 outline-none font-mono"
              >
                {keys.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name} ({maskKey(k.key)})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* 1. Create Blog Post */}
          <CurlSnippet
            title="Create Blog Post"
            method="POST"
            endpoint="/api/blog"
            description="Publish or draft a new article with Generative Engine Optimization tags."
            command={`curl -X POST ${baseUrl}/api/blog \\
  -H "Authorization: Bearer ${activeKeyDisplay}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "How Generative Engine Optimization Works in 2026",
    "slug": "how-generative-engine-optimization-works",
    "category": "AI & GEO",
    "excerpt": "A comprehensive guide on optimizing technical content for ChatGPT, Perplexity, and Claude citations.",
    "content": "## Direct Answers Beat Keywords\\n\\nGenerative AI search engines favor direct, unambiguous answers with structured tables and clear code examples.\\n\\n## Technical Architecture\\n\\nUse JSON-LD BlogPosting schema with author and publisher credentials.",
    "cover": "/projects/ai-support-agent.png",
    "tags": ["GEO", "AI", "Search", "Next.js"],
    "published": true
  }'`}
          />

          {/* 2. List All Blog Posts */}
          <CurlSnippet
            title="List All Blog Posts"
            method="GET"
            endpoint="/api/blog"
            description="Retrieve all blog articles (both published and draft)."
            command={`curl -X GET ${baseUrl}/api/blog \\
  -H "Authorization: Bearer ${activeKeyDisplay}"`}
          />

          {/* 3. Update Blog Post */}
          <CurlSnippet
            title="Update Blog Post"
            method="PUT"
            endpoint="/api/blog/:id"
            description="Update an existing post title, markdown content, or publication status."
            command={`curl -X PUT ${baseUrl}/api/blog/1 \\
  -H "Authorization: Bearer ${activeKeyDisplay}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Updated Title: Advanced AI Engineering",
    "published": true
  }'`}
          />

          {/* 4. Delete Blog Post */}
          <CurlSnippet
            title="Delete Blog Post"
            method="DELETE"
            endpoint="/api/blog/:id"
            description="Permanently delete an article by ID."
            command={`curl -X DELETE ${baseUrl}/api/blog/1 \\
  -H "Authorization: Bearer ${activeKeyDisplay}"`}
          />

          {/* 5. Create Project */}
          <CurlSnippet
            title="Create Portfolio Project"
            method="POST"
            endpoint="/api/projects"
            description="Add a new project showcase with stack badges and case study write-up."
            command={`curl -X POST ${baseUrl}/api/projects \\
  -H "Authorization: Bearer ${activeKeyDisplay}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Autonomous Financial Agent",
    "slug": "autonomous-financial-agent",
    "category": "AI & Fintech",
    "year": "2026",
    "description": "Multi-agent framework for automated risk analysis and portfolio rebalancing.",
    "stack": ["Python", "FastAPI", "LangGraph", "Next.js"],
    "image": "/projects/ai-support-agent.png",
    "result": "99.4% execution reliability",
    "featured": true,
    "published": true
  }'`}
          />

          {/* 6. List Projects */}
          <CurlSnippet
            title="List All Projects"
            method="GET"
            endpoint="/api/projects"
            description="Fetch all portfolio showcase items."
            command={`curl -X GET ${baseUrl}/api/projects \\
  -H "Authorization: Bearer ${activeKeyDisplay}"`}
          />

          {/* 7. Update Project */}
          <CurlSnippet
            title="Update Project"
            method="PUT"
            endpoint="/api/projects/:id"
            description="Update project details or case study."
            command={`curl -X PUT ${baseUrl}/api/projects/1 \\
  -H "Authorization: Bearer ${activeKeyDisplay}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "result": "99.8% precision rate",
    "featured": true
  }'`}
          />

          {/* 8. Delete Project */}
          <CurlSnippet
            title="Delete Project"
            method="DELETE"
            endpoint="/api/projects/:id"
            description="Delete a project by ID."
            command={`curl -X DELETE ${baseUrl}/api/projects/1 \\
  -H "Authorization: Bearer ${activeKeyDisplay}"`}
          />

          {/* 9. Get Profile */}
          <CurlSnippet
            title="Get Profile Details"
            method="GET"
            endpoint="/api/profile"
            description="Retrieve public profile bio, stats, and social links."
            command={`curl -X GET ${baseUrl}/api/profile`}
          />

          {/* 10. Update Profile */}
          <CurlSnippet
            title="Update Profile"
            method="PUT"
            endpoint="/api/profile"
            description="Update personal bio, email, or availability status."
            command={`curl -X PUT ${baseUrl}/api/profile \\
  -H "Authorization: Bearer ${activeKeyDisplay}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "availability": "Available for Q3 projects",
    "email": "golamkibriyahawladar@gmail.com"
  }'`}
          />
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Revoke API Key?"
        description={`Are you sure you want to revoke "${deleteTarget?.name}"? Any external integrations using this key will immediately stop working.`}
        confirmText="Revoke Key"
        destructive
        loading={deleting}
        onConfirm={handleDeleteKey}
      />
    </div>
  )
}
