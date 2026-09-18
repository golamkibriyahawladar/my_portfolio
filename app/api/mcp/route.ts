import { NextRequest, NextResponse } from 'next/server'
import {
  MCP_SERVER_INFO,
  MCP_TOOLS,
  MCP_RESOURCES,
  executeTool,
  readResource,
} from '@/lib/mcp-tools'

/**
 * MCP over Streamable HTTP — Stateless Mode
 *
 * Implements the Model Context Protocol (2025-03-26) over HTTP so that
 * remote AI clients (Google Gemini Spark, Claude Web, etc.) can discover
 * and invoke portfolio tools without a local stdio process.
 *
 * Protocol reference: https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#streamable-http
 */

const PROTOCOL_VERSION = '2025-03-26'

// ─── CORS helpers ──────────────────────────────────────────────
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Accept, Authorization, Mcp-Session-Id',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id',
}

function corsJson(body: any, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

// ─── JSON-RPC types ────────────────────────────────────────────
interface JsonRpcRequest {
  jsonrpc: '2.0'
  id?: string | number | null
  method: string
  params?: Record<string, any>
}

interface JsonRpcResponse {
  jsonrpc: '2.0'
  id: string | number
  result?: any
  error?: { code: number; message: string; data?: any }
}

function rpcError(
  id: string | number | null | undefined,
  code: number,
  message: string
): JsonRpcResponse {
  return { jsonrpc: '2.0', id: id ?? 0, error: { code, message } }
}

// ─── Message handler ───────────────────────────────────────────
async function handleMessage(
  msg: JsonRpcRequest
): Promise<JsonRpcResponse | null> {
  // Notifications (no `id`) get no response
  if (msg.id === undefined || msg.id === null) {
    return null
  }

  switch (msg.method) {
    // ── Lifecycle ────────────────────────────────────
    case 'initialize':
      return {
        jsonrpc: '2.0',
        id: msg.id,
        result: {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: {
            tools: { listChanged: false },
            resources: { subscribe: false, listChanged: false },
          },
          serverInfo: MCP_SERVER_INFO,
        },
      }

    case 'ping':
      return { jsonrpc: '2.0', id: msg.id, result: {} }

    // ── Tools ────────────────────────────────────────
    case 'tools/list':
      return {
        jsonrpc: '2.0',
        id: msg.id,
        result: { tools: MCP_TOOLS },
      }

    case 'tools/call': {
      const toolName = msg.params?.name
      const args = msg.params?.arguments || {}

      if (!toolName) {
        return rpcError(msg.id, -32602, 'Missing required param: name')
      }

      const exists = MCP_TOOLS.some((t) => t.name === toolName)
      if (!exists) {
        return rpcError(msg.id, -32602, `Unknown tool: ${toolName}`)
      }

      try {
        const result = await executeTool(toolName, args)
        return { jsonrpc: '2.0', id: msg.id, result }
      } catch (err: any) {
        return {
          jsonrpc: '2.0',
          id: msg.id,
          result: {
            content: [
              {
                type: 'text',
                text: `Error: ${err?.message || 'Tool execution failed'}`,
              },
            ],
            isError: true,
          },
        }
      }
    }

    // ── Resources ────────────────────────────────────
    case 'resources/list':
      return {
        jsonrpc: '2.0',
        id: msg.id,
        result: { resources: MCP_RESOURCES },
      }

    case 'resources/read': {
      const uri = msg.params?.uri
      if (!uri) {
        return rpcError(msg.id, -32602, 'Missing required param: uri')
      }

      const data = await readResource(uri)
      if (!data) {
        return rpcError(msg.id, -32602, `Resource not found: ${uri}`)
      }

      return { jsonrpc: '2.0', id: msg.id, result: data }
    }

    // ── Prompts (none registered) ────────────────────
    case 'prompts/list':
      return {
        jsonrpc: '2.0',
        id: msg.id,
        result: { prompts: [] },
      }

    // ── Fallback ─────────────────────────────────────
    default:
      return rpcError(msg.id, -32601, `Method not found: ${msg.method}`)
  }
}

// ─── POST /api/mcp — Main MCP endpoint ────────────────────────
export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    return corsJson(
      rpcError(0, -32700, 'Content-Type must be application/json'),
      415
    )
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return corsJson(
      rpcError(0, -32700, 'Parse error: invalid JSON'),
      400
    )
  }

  // Batch requests (array of JSON-RPC messages)
  if (Array.isArray(body)) {
    const results: JsonRpcResponse[] = []
    let hasRequests = false

    for (const msg of body) {
      const res = await handleMessage(msg)
      if (res) {
        results.push(res)
        hasRequests = true
      }
    }

    // All messages were notifications → 202 Accepted
    if (!hasRequests) {
      return new NextResponse(null, { status: 202, headers: CORS_HEADERS })
    }

    return corsJson(results)
  }

  // Single request
  const response = await handleMessage(body)

  // Notification → 202 Accepted (no body)
  if (!response) {
    return new NextResponse(null, { status: 202, headers: CORS_HEADERS })
  }

  return corsJson(response)
}

// ─── GET /api/mcp — SSE stream (unsupported in stateless mode) ─
export async function GET() {
  // Stateless server: return a helpful JSON error instead of SSE
  return corsJson(
    {
      jsonrpc: '2.0',
      id: 0,
      error: {
        code: -32000,
        message:
          'This MCP server operates in stateless HTTP mode. Use POST to send JSON-RPC requests.',
      },
    },
    405
  )
}

// ─── DELETE /api/mcp — Session termination (not needed) ────────
export async function DELETE() {
  return corsJson(
    {
      jsonrpc: '2.0',
      id: 0,
      error: {
        code: -32000,
        message:
          'Session management is not supported in stateless mode.',
      },
    },
    405
  )
}

// ─── OPTIONS /api/mcp — CORS preflight ────────────────────────
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  })
}
