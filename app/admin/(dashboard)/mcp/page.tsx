import React from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Cpu, Terminal, CheckCircle2, Copy } from 'lucide-react'
import { CurlSnippet } from '@/components/admin/curl-snippet'

export const dynamic = 'force-dynamic'

export default function AdminMcpPage() {
  const currentPath = 'e:\\portfolio'

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

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Model Context Protocol (MCP)"
        description="Connect your portfolio directly to external AI assistants like Claude Desktop, Cursor, and Antigravity"
      />

      <div className="p-8 max-w-5xl space-y-8">
        {/* Status Card */}
        <div className="rounded-2xl border border-white/10 bg-[#121218]/70 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#a3e635]/15 border border-[#a3e635]/30 flex items-center justify-center text-[#a3e635]">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Official MCP Server Ready
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#a3e635] text-black">
                  Stdio Protocol
                </span>
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Standard Anthropic Model Context Protocol (`@modelcontextprotocol/sdk`)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#a3e635] bg-[#a3e635]/10 px-3 py-1.5 rounded-lg border border-[#a3e635]/20">
            <CheckCircle2 className="w-4 h-4" />
            npm run mcp
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
