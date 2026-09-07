'use client'

import React, { useState } from 'react'
import { ApiKey } from '@/lib/db/schema'
import { createApiKey, deleteApiKey } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CurlSnippet } from '@/components/admin/curl-snippet'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { Key, Plus, Trash2, Copy, Check, ShieldAlert, Sparkles, Terminal } from 'lucide-react'
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
