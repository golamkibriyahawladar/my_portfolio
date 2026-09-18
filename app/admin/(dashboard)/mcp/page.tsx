import React from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Cpu, Terminal, CheckCircle2, Globe, Sparkles, Zap } from 'lucide-react'
import { CurlSnippet } from '@/components/admin/curl-snippet'

export const dynamic = 'force-dynamic'

export default function AdminMcpPage() {
  const currentPath = 'e:\\portfolio'

  // Production MCP HTTP endpoint URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const mcpHttpUrl = `${appUrl}/api/mcp`

  const claudeDesktopConfig = JSON.stringify(
    {
      mcpServers: {
        'golam-portfolio': {
          command: 'npx',
          args: ['tsx', '--env-file=.env.local', `${currentPath}\\scripts\\mcp-server.ts`],
        },
      },
    },
    null,
    2
  )

  const cursorMcpConfig = JSON.stringify(
    {
      mcpServers: {
        'golam-portfolio': {
          command: 'npx tsx --env-file=.env.local scripts/mcp-server.ts',
        },
      },
    },
    null,
    2
  )

  const tools = [
    {
      name: 'get_portfolio_profile',
      desc: 'Retrieves bio, contact details, role, and real-time availability status.',
    },
    {
      name: 'list_projects',
      desc: 'Lists portfolio projects, tech stacks, and live links (supports category filtering).',
    },
    {
      name: 'get_skills_and_services',
      desc: 'Fetches development services and categorized technical skills.',
    },
    {
      name: 'search_blog',
      desc: 'Performs keyword search on technical articles and guides.',
    },
    {
      name: 'send_contact_message',
      desc: 'Allows AI clients to directly submit an inquiry into your database and trigger email.',
    },
  ]

  const testInitializeCurl = `curl -X POST ${mcpHttpUrl} \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-03-26",
      "capabilities": {},
      "clientInfo": { "name": "test", "version": "1.0" }
    }
  }'`

  const testToolsListCurl = `curl -X POST ${mcpHttpUrl} \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list"
  }'`

  const testToolCallCurl = `curl -X POST ${mcpHttpUrl} \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "get_portfolio_profile",
      "arguments": {}
    }
  }'`

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Model Context Protocol (MCP)"
        description="Connect your portfolio directly to external AI assistants like Gemini Spark, Claude Desktop, Cursor, and Antigravity"
      />

      <div className="p-8 max-w-5xl space-y-8">
        {/* Dual Protocol Status Card */}
        <div className="rounded-2xl border border-white/10 bg-[#121218]/70 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#a3e635]/15 border border-[#a3e635]/30 flex items-center justify-center text-[#a3e635]">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 flex-wrap">
                Official MCP Server Ready
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#a3e635] text-black">
                  Stdio
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-400 text-black">
                  HTTP
                </span>
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Dual transport: local Stdio for Claude/Cursor + remote HTTP for Gemini Spark &amp; web clients
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#a3e635] bg-[#a3e635]/10 px-3 py-1.5 rounded-lg border border-[#a3e635]/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              npm run mcp
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400 bg-sky-400/10 px-3 py-1.5 rounded-lg border border-sky-400/20">
              <Globe className="w-3.5 h-3.5" />
              /api/mcp
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Gemini Spark / Remote AI — HTTP MCP Connection */}
        {/* ================================================================ */}
        <div className="space-y-4 rounded-2xl border border-sky-400/20 bg-gradient-to-br from-sky-500/5 to-blue-600/5 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-sky-400/10 border border-sky-400/20 text-sky-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Google Gemini Spark &amp; Remote AI
                </h3>
              </div>
              <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
                Connect to your portfolio from Google Gemini Spark, or any remote MCP client using the <strong>Streamable HTTP</strong> transport (MCP 2025-03-26).
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20 whitespace-nowrap">
              <Zap className="w-3.5 h-3.5" />
              Stateless HTTP — Vercel Edge Ready
            </span>
          </div>

          {/* Endpoint URL */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/80">
              MCP Endpoint URL (paste into Gemini Spark)
            </h4>
            <div className="flex items-center gap-2 bg-[#09090b] border border-sky-400/30 rounded-lg p-3">
              <Globe className="w-4 h-4 text-sky-400 shrink-0" />
              <code className="text-sm font-mono text-sky-300 flex-1 select-all break-all">
                {mcpHttpUrl}
              </code>
            </div>
            <p className="text-[11px] text-white/40">
              ☝️ Copy this URL and paste it into <strong>Gemini → Custom apps for Spark → &quot;Add a custom app link&quot;</strong> field, then click <strong>Next</strong>.
            </p>
          </div>

          {/* How to connect steps */}
          <div className="rounded-xl border border-white/10 bg-[#0a0a0d] p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              How to Connect (Step-by-Step)
            </h4>
            <ol className="space-y-2 text-xs text-white/70 leading-relaxed list-decimal list-inside">
              <li>
                Open <strong>Google Gemini</strong> → Go to <strong>Spark</strong> (or Gems)
              </li>
              <li>
                Click <strong>&quot;Custom apps&quot;</strong> → <strong>&quot;Add a custom app link&quot;</strong>
              </li>
              <li>
                Paste the MCP URL: <code className="text-sky-300 bg-sky-400/10 px-1.5 py-0.5 rounded text-[11px]">{mcpHttpUrl}</code>
              </li>
              <li>
                Click <strong>Next</strong> → Gemini will auto-discover your 5 tools
              </li>
              <li>
                Start chatting! Ask: <em>&quot;Show me Golam&apos;s portfolio projects&quot;</em>
              </li>
            </ol>
          </div>
        </div>

        {/* Exposed Tools */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white/90">Available MCP Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tools.map((t) => (
              <div
                key={t.name}
                className="p-4 rounded-xl bg-[#14141c]/60 border border-white/10 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#a3e635]">
                    {t.name}()
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">Tool</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* HTTP MCP Test Commands */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              Test HTTP MCP Endpoint
            </h3>
            <span className="text-xs text-white/40 font-mono">JSON-RPC 2.0</span>
          </div>

          <CurlSnippet
            title="Initialize MCP Session"
            method="POST"
            endpoint="/api/mcp"
            description="Send the MCP initialize handshake to verify the endpoint is working"
            command={testInitializeCurl}
          />

          <CurlSnippet
            title="List Available Tools"
            method="POST"
            endpoint="/api/mcp"
            description="Discover all available MCP tools and their input schemas"
            command={testToolsListCurl}
          />

          <CurlSnippet
            title="Call a Tool (Get Profile)"
            method="POST"
            endpoint="/api/mcp"
            description="Execute the get_portfolio_profile tool to fetch your live profile data"
            command={testToolCallCurl}
          />
        </div>

        {/* Claude Desktop Config Snippet */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#a3e635]" />
              Claude Desktop Configuration
            </h3>
            <span className="text-xs text-white/40 font-mono">claude_desktop_config.json</span>
          </div>
          <CurlSnippet
            title="Claude Desktop Config"
            method="POST"
            endpoint="claude_desktop_config.json"
            description="Paste this into your Claude Desktop config file to let Claude interact with your portfolio"
            command={claudeDesktopConfig}
          />
        </div>

        {/* Cursor Config Snippet */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#a3e635]" />
              Cursor / Antigravity Settings
            </h3>
            <span className="text-xs text-white/40 font-mono">mcpServers</span>
          </div>
          <CurlSnippet
            title="Cursor / Antigravity MCP Config"
            method="POST"
            endpoint="mcpServers.json"
            description="Add to your IDE's MCP settings to query your portfolio during development"
            command={cursorMcpConfig}
          />
        </div>
      </div>
    </div>
  )
}
