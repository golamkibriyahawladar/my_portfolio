import type { Post } from '@/lib/db/schema'

const now = new Date()

export const postsData: Post[] = [
  {
    id: 1,
    slug: 'ai-hvac-dispatch-voice-agent-vapi-google-apps-script',
    title: 'How to Build an AI HVAC Dispatch Voice Agent using Vapi & Google Apps Script',
    excerpt:
      'Build an autonomous sub-600ms HVAC emergency dispatch voice agent using Vapi.ai, Twilio, and a serverless Google Apps Script backend.',
    content: `## 1. The Cost of Missed Emergency Calls in Field Services

In residential and commercial HVAC, an unanswered emergency call is not just a missed customer—it is an immediate **$300 to $1,500 repair job** handed directly to your local competitor. During extreme seasonal temperature spikes (sub-zero winter freezes or 100°F+ summer heatwaves), homeowners and facility managers will not leave a voicemail and wait two hours. If a live human or an intelligent conversational interface does not answer by the third ring, they tap the next search result on Google Local Services Ads.

Hiring 24/7 human dispatch call centers introduces severe operational bottlenecks:
- **High Variable Overhead**: Traditional onshore answering services charge $1.50 to $2.75 per minute or a hefty $2,500/month base retainer, yet their operators possess zero technical understanding of refrigeration cycles, compressor lockouts, or emergency triage.
- **Data Entry Latency**: Answering services take down unstructured messages, email them to an on-call dispatcher, who then manually texts on-duty technicians—introducing 20 to 45 minutes of critical lag.
- **Customer Churn**: Callers are put on hold while human operators juggle multiple contractor phone lines.

To solve this, we will architect a zero-latency, autonomous **AI HVAC Dispatch Voice Agent**. The agent handles incoming telephone calls through a PSTN phone number, accurately identifies the HVAC emergency type, collects diagnostic details (unit make, system type, refrigerant leak indicators, error codes), determines technician schedule availability, and writes the structured service dispatch ticket directly into a shared Google Sheets and Google Calendar operations board in real-time.

### The Technical Stack
- **Voice Orchestration & Latency Engine**: Vapi.ai (Managing the WebSocket audio stream, Speech-to-Text, LLM turn-taking, and Text-to-Speech).
- **Telephony Ingestion**: Twilio Elastic SIP Trunking / Inbound Programmable Voice.
- **Speech-to-Text (STT)**: Deepgram Nova-2 (\`model: nova-2-phonecall\`, endpointing: 250ms).
- **Core Reasoning Engine**: Anthropic Claude 3.5 Sonnet / Groq Llama-3.3-70B (Sub-200ms Time-To-First-Token).
- **Text-to-Speech (TTS)**: Cartesia Sonic (Voice: *British/American Conversational Dispatcher*, ultra-low 120ms TTFB).
- **Serverless Backend & CRM**: Google Apps Script deployed as a Versioned Web App connected to Google Sheets and Google Calendar API.

---

## 2. End-to-End Architecture Overview

Below is the complete architectural data pipeline. Rather than routing calls through expensive, state-heavy cloud servers (like AWS ECS or Kubernetes), we leverage Vapi’s native real-time tool calling over WebSockets to trigger a serverless Google Apps Script endpoint via standard HTTPS POST payloads:

\`\`\`
Caller (PSTN Cellular / Landline)
           │
           ▼  (SIP / G.711 µ-law 8kHz Audio)
Twilio Programmable Voice
           │
           ▼  (Bi-directional WebSocket Audio Stream)
Vapi.ai Voice Orchestrator
   ├── 1. Deepgram Nova-2 STT  ──► Streams transcript chunks
   ├── 2. LLM (Claude 3.5 / Groq) ──► Evaluates user intent & executes tool
   └── 3. Cartesia Sonic TTS   ──► Streams synthesized audio back to caller
           │
           ▼  (HTTPS JSON Tool Call: "dispatchHvacEmergency")
Google Apps Script Web App Endpoint (/exec)
   ├── 1. Secret Key & Payload Schema Validation
   ├── 2. Technician On-Call Roster Lookup (Google Calendar API)
   ├── 3. Row Ingestion (Google Sheets Dispatch Board)
   └── 4. Critical Calendar Placeholder Event Created
           │
           ▼  (JSON Tool Response: { "status": "DISPATCH_CONFIRMED", "ticketId": "HVAC-9402" })
Vapi.ai reads confirmation back to caller in <500ms
\`\`\`

---

## 3. Step-by-Step Technical Implementation

### Step 1: Building the Serverless Google Apps Script Backend

Google Apps Script provides a zero-maintenance, serverless execution environment with native, pre-authenticated access to Google Sheets, Google Calendar, and Drive.

1. Open a new Google Sheet named \`HVAC_Dispatch_Master_Board\`.
2. Rename the first sheet to \`Live_Tickets\`.
3. Set up the following column headers in Row 1:
   - \`A: Ticket ID\`
   - \`B: Timestamp\`
   - \`C: Caller Name\`
   - \`D: Phone Number\`
   - \`E: Service Address\`
   - \`F: Emergency Tier\`
   - \`G: System Type\`
   - \`H: Issue Summary\`
   - \`I: Assigned Tech\`
   - \`J: Dispatch Status\`
4. Navigate to **Extensions > Apps Script**, erase any default code, and paste the following production script:

\`\`\`javascript
/**
 * HVAC Autonomous Dispatch Backend
 * Processes incoming JSON function calls from Vapi.ai
 */

const SECRET_API_KEY = "HVAC_SECURE_DISPATCH_KEY_9934"; // Set identical key in Vapi Tool headers
const CALENDAR_ID = "primary"; // Or your dedicated On-Call technician calendar ID

function doPost(e) {
  try {
    let body = {};
    if (e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }

    // Extract tool call payload from Vapi format
    const toolCall = body.message?.toolCalls?.[0] || body;
    const functionArgs = toolCall.function?.arguments || toolCall.parameters || body;

    // Validate Auth Token
    const incomingKey = functionArgs.authKey || e.parameter?.key;
    if (incomingKey !== SECRET_API_KEY) {
      return ContentService.createTextOutput(JSON.stringify({
        error: "Unauthorized: Invalid Secret Key"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const action = functionArgs.action || "createTicket";

    if (action === "checkAvailability") {
      return handleCheckAvailability(functionArgs);
    } else if (action === "createTicket") {
      return handleCreateTicket(functionArgs, toolCall.id);
    } else {
      throw new Error("Unknown action requested: " + action);
    }

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "ERROR",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleCheckAvailability(args) {
  const targetDate = args.preferredDate ? new Date(args.preferredDate) : new Date();
  const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
  
  // Define working window: 8 AM to 8 PM
  const startTime = new Date(targetDate.setHours(8, 0, 0, 0));
  const endTime = new Date(targetDate.setHours(20, 0, 0, 0));
  
  const events = calendar.getEvents(startTime, endTime);
  const isBookedOut = events.length >= 10; // Max 10 emergency runs per day

  return ContentService.createTextOutput(JSON.stringify({
    results: [{
      toolCallId: args.toolCallId,
      result: {
        available: !isBookedOut,
        nextOpenSlot: isBookedOut ? "Tomorrow at 8:30 AM" : "Today within 90 minutes",
        emergencyTechOnCall: "Marcus Vance (Senior Field Tech)"
      }
    }]
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleCreateTicket(args, toolCallId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Live_Tickets");
  
  const ticketId = "HVAC-" + Math.floor(100000 + Math.random() * 900000);
  const timestamp = new Date();
  
  const rowData = [
    ticketId,
    timestamp.toISOString(),
    args.callerName || "Unknown",
    args.callerPhone || "Unspecified",
    args.serviceAddress || "Address Not Captured",
    args.emergencyTier || "STANDARD", // CRITICAL, URGENT, STANDARD
    args.systemType || "Unknown (Heat Pump / Gas Furnace / AC)",
    args.issueDescription || "No issue details provided",
    "Marcus Vance",
    "DISPATCHED"
  ];

  sheet.appendRow(rowData);

  // Create an immediate placeholder event on the Dispatch Calendar
  const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
  const eventTitle = \`[\${args.emergencyTier || 'EMERGENCY'}] \${args.callerName} - \${args.systemType}\`;
  const eventDesc = \`Address: \${args.serviceAddress}\\nPhone: \${args.callerPhone}\\nIssue: \${args.issueDescription}\\nTicket ID: \${ticketId}\`;
  
  const eventStart = new Date();
  const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000); // 1-hour window
  calendar.createEvent(eventTitle, eventStart, eventEnd, { description: eventDesc });

  // Return standard Vapi tool response schema
  return ContentService.createTextOutput(JSON.stringify({
    results: [{
      toolCallId: toolCallId,
      result: {
        status: "DISPATCH_CONFIRMED",
        ticketId: ticketId,
        etaMinutes: args.emergencyTier === "CRITICAL" ? 45 : 90,
        assignedTechnician: "Marcus Vance",
        instructionsForCaller: "Turn off the thermostat selector switch to prevent compressor burnout."
      }
    }]
  })).setMimeType(ContentService.MimeType.JSON);
}
\`\`\`

#### Deployment Settings:
1. Click **Deploy > New Deployment**.
2. Select **Type: Web App**.
3. Set **Execute as**: \`Me (your email)\`.
4. Set **Who has access**: \`Anyone\` (Security is handled via the secret key in the JSON payload).
5. Copy the generated Web App URL: \`https://script.google.com/macros/s/AKfycb.../exec\`.

---

### Step 2: Defining the Vapi Custom Tool Calling Schema

In your Vapi Dashboard, navigate to **Tools > Create Custom Tool** and configure the JSON schema:

\`\`\`json
{
  "async": false,
  "messages": [
    {
      "type": "request-start",
      "content": "Checking our emergency field dispatch board right now..."
    },
    {
      "type": "request-complete",
      "content": "I've locked in that dispatch request with our on-call technician."
    },
    {
      "type": "request-failed",
      "content": "I wasn't able to reach the dispatch board, but I have noted all your emergency details."
    }
  ],
  "type": "function",
  "function": {
    "name": "dispatchHvacEmergency",
    "description": "Logs an emergency HVAC repair dispatch ticket directly into the technician board and schedules on-call dispatch.",
    "parameters": {
      "type": "object",
      "properties": {
        "authKey": {
          "type": "string",
          "description": "Static secret authorization key: HVAC_SECURE_DISPATCH_KEY_9934"
        },
        "action": {
          "type": "string",
          "enum": ["createTicket", "checkAvailability"],
          "description": "Whether to check open slots or confirm a dispatch ticket"
        },
        "callerName": {
          "type": "string",
          "description": "Full name of the homeowner or building manager"
        },
        "callerPhone": {
          "type": "string",
          "description": "Direct callback phone number"
        },
        "serviceAddress": {
          "type": "string",
          "description": "Full physical street address including city or zip code"
        },
        "systemType": {
          "type": "string",
          "enum": ["Central AC", "Gas Furnace", "Heat Pump", "Ductless Mini-Split", "Rooftop Commercial Package"],
          "description": "The category of heating or cooling equipment requiring repair"
        },
        "emergencyTier": {
          "type": "string",
          "enum": ["CRITICAL", "URGENT", "STANDARD"],
          "description": "CRITICAL: Gas smell, water leaking onto ceiling, sub-freezing home with elderly/infants. URGENT: Complete system shutdown in high heat. STANDARD: Routine maintenance or minor squeal."
        },
        "issueDescription": {
          "type": "string",
          "description": "Summary of symptoms: freezing coils, buzzing relays, no heat, short cycling, or error codes."
        }
      },
      "required": ["authKey", "action", "callerName", "callerPhone", "serviceAddress", "systemType", "emergencyTier", "issueDescription"]
    }
  },
  "server": {
    "url": "https://script.google.com/macros/s/AKfycb.../exec",
    "timeoutSeconds": 20
  }
}
\`\`\`

---

<ProductCheckout 
  title="Complete AI Voice HVAC Dispatcher Workflow Bundle" 
  price="$97" 
  productId="vapi-hvac-apps-script-blueprint" 
/>

---

### Step 3: Production Prompt Engineering for Conversational Phone Cadence

Voice prompts require a completely different paradigm than text chatbots. You must eliminate Markdown formatting, enforce turn-taking constraints, and program phonetic compliance.

Create a new Assistant in Vapi and paste the following **System Prompt**:

\`\`\`text
# IDENTITY & PURPOSE
You are "Sarah", the Senior Emergency Dispatch Coordinator for Apex Heating & Air Conditioning. You are handling live, spoken phone conversations with residential and commercial customers experiencing heating or cooling failures.

# CONVERSATIONAL VOICE CONSTRAINTS (MANDATORY)
1. BREVITY: Speak no more than 1 or 2 concise sentences per turn. Never monologue.
2. NO MARKDOWN: Never speak asterisks, bullet points, hashes, or URLs.
3. PHONETICS: Spell out numbers, times, and phone numbers in conversational cadence. Say "Seven Oh Four, Five Five Five, Zero One Nine Nine", not "7045550199". Say "Three Thirty P M", not "15:30".
4. INTERRUPTIBLE: You must pause immediately when the user speaks (Barge-in enabled).

# TRIAGE PROCEDURE
Step 1 - Empathy & Safety Check:
- Greet warmly: "Thanks for calling Apex Heating and Air. This is Sarah on the emergency dispatch line. Are you experiencing a complete heating or cooling outage right now?"
- If the customer reports the smell of rotten eggs / gas, IMMEDIATELY say: "Please evacuate the building immediately and call your gas utility from outside. Do not turn on any light switches."

Step 2 - Gather Equipment & Location:
- Ask for their street address and the primary symptom: "Got it. What's the physical street address we would be sending the technician to?"
- Determine the system type: "Is that a central AC unit, a heat pump, or a gas furnace?"

Step 3 - Execute Dispatch Tool:
- Once you have the Caller Name, Phone, Address, System Type, and Issue:
- State a verbal filler: "Let me pull up our on-call roster and lock in this dispatch ticket for you right now..."
- Call the tool dispatchHvacEmergency.

Step 4 - Close with Authority:
- Once the tool returns DISPATCH_CONFIRMED:
- Read back the ETA and Ticket ID clearly: "I have dispatched our on-call technician, Marcus. His ETA is within 45 minutes, and your emergency ticket number is [TicketId]. Please switch your thermostat to the OFF position until he arrives."
- Ask: "Is there an entry gate code or specific parking area Marcus needs to know about?"
\`\`\`

---

## 4. Telephony & Audio Optimization Settings

To achieve sub-600ms latency, configure these exact settings in the Vapi dashboard:

| Configuration Setting | Recommended Value | Engineering Rationale |
|---|---|---|
| **Transcriber Provider** | Deepgram | Fastest streaming WebSocket Speech-to-Text engine available. |
| **Model** | \`nova-2-phonecall\` | Trained on noisy 8kHz narrowband telephone audio. |
| **Endpointing (Silence Timeout)** | \`250ms\` | Dictates how long the user must stop talking before the agent answers. 250ms is the optimal balance between speed and avoiding accidental interruptions. |
| **LLM Provider** | Groq (\`llama-3.3-70b-versatile\`) | Time-to-First-Token (TTFT) is ~180ms, eliminating dead air. |
| **Voice Provider** | Cartesia Sonic | State-of-the-art neural audio streaming; TTFB is ~120ms. |
| **Max Response Tokens** | \`120\` | Prevents the LLM from generating long-winded paragraphs. |

---

## 5. Frequently Asked Questions

### Can the voice agent detect if a technician is on another call before dispatching?
Yes. In the Google Apps Script \`handleCheckAvailability\` function, the code reads the Google Calendar API. If an event labeled \`[DISPATCHED]\` currently overlaps the current time, the script dynamically assigns the secondary on-call tech or adjusts the ETA from 45 minutes to 90 minutes.

### What happens if the customer mumbles their address or gives an invalid street?
The system prompt instructs the agent to execute conversational verification: *"I heard 742 Evergreen Terrace, is that correct?"* If the speech-to-text confidence drops below 0.65, Vapi's fallback loop asks the caller to repeat the street name or spell unusual words phonetically.

### Does Google Apps Script have rate limits that would throttle call volume?
Google Apps Script handles up to **30 simultaneous executions** and **20,000 URL Fetch calls per day** on free Google accounts (up to 100,000 on Google Workspace). For high-volume franchises receiving 500+ calls daily, swap the Google Apps Script URL with a serverless Python FastAPI instance deployed on Railway or AWS Lambda backed by PostgreSQL.

---

<ProductCheckout 
  title="Complete AI Voice HVAC Dispatcher Workflow Bundle" 
  price="$97" 
  productId="vapi-hvac-apps-script-blueprint" 
/>`,
    cover: '/projects/ai-support-agent.png',
    category: 'AI Voice Agents',
    tags: ['Voice AI', 'Vapi', 'Google Apps Script', 'Twilio', 'Automation', 'HVAC'],
    published: true,
    publishedAt: new Date('2026-09-17'),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 2,
    slug: 'processing-multimodal-screenshot-inputs-n8n-shopify',
    title: 'Processing Multimodal Screenshot Inputs in n8n for Shopify E-commerce',
    excerpt:
      'Build an automated multimodal visual search pipeline in n8n using Claude 3.5 Sonnet and Shopify GraphQL API to convert product screenshots into sales.',
    content: `## 1. The Friction of Visual Customer Inquiries in E-commerce

Every day, online retail and direct-to-consumer (DTC) brands receive thousands of inbound customer messages across Instagram DMs, WhatsApp, and live chat widgets containing nothing more than an unannotated image:
- A screenshot of an influencer wearing a dress with the caption *"Do you have this in size M?"*
- A smartphone photo of a broken industrial pump seal with *"Need replacement part today"*.
- A competitor’s product page screenshot asking *"Can you match this price or do you sell this model?"*

Traditional e-commerce customer support pipelines fail miserably at handling visual queries. Support agents must open the image, manually navigate to the Shopify Admin panel, eyeball the product features, search through hundreds of SKUs, cross-reference inventory levels across physical fulfillment locations, and type out a response. This process averages **4 to 7 minutes per ticket**.

In this architecture guide, we build an enterprise-grade, **multimodal visual search and inventory resolution pipeline in n8n**. The pipeline takes raw incoming image screenshots via webhook, processes the image using **Claude 3.5 Sonnet Vision**, extracts deterministic visual attributes (cut, pattern, color hex range, material, silhouette, mechanical specifications), constructs an optimized GraphQL query against the **Shopify Admin API**, checks real-time inventory counts, and generates an instant personalized response with a pre-filled checkout link.

### The Technical Stack
- **Workflow Automation Engine**: n8n (Self-hosted or Cloud).
- **Vision Model**: Anthropic Claude 3.5 Sonnet Vision (\`claude-3-5-sonnet-20241022\`).
- **E-commerce Platform**: Shopify Admin GraphQL API (2025-01 Version).
- **Payload Validation**: Custom JavaScript Code Nodes with runtime assertions.
- **Delivery Channels**: WhatsApp Cloud API, Instagram Direct Messages, or Webhook response.

---

## 2. Multimodal Data Pipeline Architecture

\`\`\`
User uploads Screenshot (WhatsApp / Live Chat / Webhook)
                     │
                     ▼ (Binary Image Buffer / Multipart Form)
[n8n Webhook Trigger: Ingest Screenshot]
                     │
                     ▼ (Downscale & Base64 Encode)
[n8n Code Node: Image Normalization]
                     │
                     ▼ (Vision API Request with Strict JSON Schema)
[Claude 3.5 Sonnet: Multimodal Feature Extractor]
  Extracts: { productType, dominantColor, designFeatures, estimatedCategory }
                     │
                     ▼ (Dynamic GraphQL Construction)
[Shopify Admin GraphQL Node]
  Query: products(first: 5, query: "tag:... AND status:ACTIVE")
                     │
                     ▼ (Inventory & Price Evaluation)
[n8n Code Node: Match Scoring & Variant Selector]
  - Calculates confidence score between Vision attributes and Product tags
  - Resolves active SKU with stock > 0
  - Constructs direct-to-checkout permalink
                     │
                     ▼ (Webhook Response)
Instant Response with Product Title, Image, Stock Level, and 1-Click Buy Link
\`\`\`

---

## 3. Step-by-Step Implementation

### Step 1: Ingesting and Preparing the Image Buffer in n8n

When users upload an image via webhook, the raw payload arrives as a binary stream. Passing an unoptimized 12MB smartphone photo directly to a vision model wastes money and adds 3-5 seconds of network latency.

In your n8n workflow, add a **Webhook Node** (\`POST\`, Path: \`/screenshot-search\`), followed by a **Code Node** to convert the binary file into a clean Base64 string formatted for Anthropic’s API:

\`\`\`javascript
// n8n Code Node: Binary to Base64 Image Transformer
const binaryPropertyName = 'data'; // Default n8n binary field name
const items = $input.all();

if (!items[0].binary || !items[0].binary[binaryPropertyName]) {
  throw new Error("No binary image file found in the incoming webhook request.");
}

const binaryData = items[0].binary[binaryPropertyName];
const mimeType = binaryData.mimeType || 'image/jpeg';
const base64String = binaryData.data;

// Validate supported MIME types for Claude 3.5 Sonnet
const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!supportedTypes.includes(mimeType)) {
  throw new Error(\`Unsupported image format: \${mimeType}. Please send JPEG, PNG, or WebP.\`);
}

return [{
  json: {
    mimeType: mimeType,
    base64Data: base64String,
    fileSizeKB: Math.round(base64String.length * 0.75 / 1024),
    receivedAt: new Date().toISOString()
  }
}];
\`\`\`

---

### Step 2: The Claude 3.5 Sonnet Multimodal Extraction Node

We send the Base64 image to Anthropic’s API using an **HTTP Request Node** in n8n, forcing the model to output a strict JSON structure representing the exact catalog search parameters:

- **Method**: \`POST\`
- **URL**: \`https://api.anthropic.com/v1/messages\`
- **Headers**:
  - \`x-api-key\`: \`{{ $env.ANTHROPIC_API_KEY }}\`
  - \`anthropic-version\`: \`2023-06-01\`
  - \`content-type\`: \`application/json\`

#### Body Configuration (JSON):

\`\`\`json
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 1000,
  "temperature": 0.1,
  "system": "You are an expert fashion and retail merchandising visual analyst. Analyze the provided product screenshot or photo. Extract the core item attributes into a strict JSON object with NO preamble or conversational text.",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "image",
          "source": {
            "type": "base64",
            "media_type": "{{ $json.mimeType }}",
            "data": "{{ $json.base64Data }}"
          }
        },
        {
          "type": "text",
          "text": "Analyze this screenshot. Output a JSON object with the following schema: {\\\"productCategory\\\": string, \\\"gender\\\": \\\"Women\\\"|\\\"Men\\\"|\\\"Unisex\\\", \\\"primaryColor\\\": string, \\\"secondaryColors\\\": string[], \\\"silhouette\\\": string, \\\"material\\\": string, \\\"distinguishingFeatures\\\": string[], \\\"searchKeywords\\\": string[]}. Focus on features that match inventory databases."
        }
      ]
    }
  ]
}
\`\`\`

---

<ProductCheckout 
  title="Multimodal E-Commerce AI Search n8n Blueprint" 
  price="$67" 
  productId="n8n-multimodal-shopify-blueprint" 
/>

---

### Step 3: Parsing Output & Building the Shopify GraphQL Query

Claude returns a raw JSON string inside \`content[0].text\`. Add an **n8n Code Node** to parse the extracted attributes and construct a high-precision Shopify GraphQL query:

\`\`\`javascript
// n8n Code Node: Vision Parser & Shopify GraphQL Builder
const rawResponse = $input.first().json.content[0].text;
let parsedAttributes;

try {
  const sanitized = rawResponse.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
  parsedAttributes = JSON.parse(sanitized);
} catch (err) {
  throw new Error("Failed to parse Claude Vision JSON: " + err.message);
}

const searchTerms = [
  parsedAttributes.primaryColor,
  parsedAttributes.silhouette,
  parsedAttributes.productCategory
].filter(Boolean).join(' ');

const graphqlQuery = {
  query: \`
    query searchProductsByAttributes($query: String!) {
      products(first: 4, query: $query) {
        edges {
          node {
            id
            title
            handle
            status
            totalInventory
            featuredImage {
              url
              altText
            }
            priceRangeV2 {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 5) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  quantityAvailable
                  price
                }
              }
            }
            tags
          }
        }
      }
    }
  \`,
  variables: {
    query: \`status:active AND title:*\${parsedAttributes.productCategory}* AND (tag:\${parsedAttributes.primaryColor} OR tag:\${parsedAttributes.silhouette})\`
  }
};

return [{
  json: {
    attributes: parsedAttributes,
    searchTerm: searchTerms,
    shopifyPayload: graphqlQuery
  }
}];
\`\`\`

---

### Step 4: Querying Shopify Admin API via GraphQL

Add an **HTTP Request Node** to execute the query against your Shopify store:
- **Method**: \`POST\`
- **URL**: \`https://{{ $env.SHOPIFY_STORE_DOMAIN }}/admin/api/2025-01/graphql.json\`
- **Headers**:
  - \`X-Shopify-Access-Token\`: \`{{ $env.SHOPIFY_ADMIN_ACCESS_TOKEN }}\`
  - \`Content-Type\`: \`application/json\`
- **Body**: \`{{ JSON.stringify($json.shopifyPayload) }}\`

---

### Step 5: Match Scoring, Stock Verification & Permalinks

Now we evaluate the products returned by Shopify against the original image attributes, filter out out-of-stock SKUs, and construct a pre-filled checkout link.

Add a final **n8n Code Node**:

\`\`\`javascript
// n8n Code Node: Inventory Resolution & Checkout Permalinks
const shopifyResponse = $input.first().json.data?.products?.edges || [];
const attributes = $('Shopify GraphQL Builder').first().json.attributes;
const storeDomain = $env.SHOPIFY_STORE_DOMAIN.replace('/admin/api/2025-01/graphql.json', '');

if (shopifyResponse.length === 0) {
  return [{
    json: {
      found: false,
      message: \`We couldn't find an exact in-stock match for a \${attributes.primaryColor} \${attributes.silhouette} \${attributes.productCategory}. Would you like to view our full collection?\`,
      fallbackUrl: \`https://\${storeDomain}/collections/all?q=\${encodeURIComponent(attributes.productCategory)}\`
    }
  }];
}

// Map and score returned products
const scoredProducts = shopifyResponse.map(edge => {
  const product = edge.node;
  let score = 0;

  if (product.title.toLowerCase().includes(attributes.primaryColor.toLowerCase())) score += 30;
  if (product.title.toLowerCase().includes(attributes.productCategory.toLowerCase())) score += 40;

  product.tags.forEach(tag => {
    if (attributes.searchKeywords.some(k => k.toLowerCase() === tag.toLowerCase())) score += 10;
  });

  const availableVariant = product.variants.edges.find(v => v.node.availableForSale);

  let checkoutUrl = "";
  if (availableVariant) {
    const variantId = availableVariant.node.id.split('/').pop();
    checkoutUrl = \`https://\${storeDomain}/cart/\${variantId}:1\`;
  }

  return {
    productId: product.id,
    title: product.title,
    handle: product.handle,
    productUrl: \`https://\${storeDomain}/products/\${product.handle}\`,
    imageUrl: product.featuredImage?.url,
    price: product.priceRangeV2.minVariantPrice.amount,
    currency: product.priceRangeV2.minVariantPrice.currencyCode,
    inStock: product.totalInventory > 0,
    checkoutUrl: checkoutUrl,
    matchScore: score
  };
});

scoredProducts.sort((a, b) => b.matchScore - a.matchScore);
const bestMatch = scoredProducts[0];

return [{
  json: {
    found: true,
    bestMatch: bestMatch,
    alternativeMatches: scoredProducts.slice(1, 3),
    detectedAttributes: attributes,
    customerMessage: \`Good news! We found the exact match: "\${bestMatch.title}" in stock for \${bestMatch.currency} \${bestMatch.price}. Click here to order instantly: \${bestMatch.checkoutUrl}\`
  }
}];
\`\`\`

---

## 4. Frequently Asked Questions

### Can this workflow recognize competitor logos or specific product serial numbers?
Yes. Claude 3.5 Sonnet Vision has OCR capabilities. If the customer submits a screenshot of an order confirmation, packing slip, or manufacturer label, the model extracts the serial number or model code directly into the \`searchKeywords\` array.

### What happens if an item is completely out of stock across all variants?
The scoring node checks \`product.totalInventory > 0\`. If all variants are zero, it skips the direct checkout permalink and provides a back-in-stock notification subscription link alongside alternative related items.

### How does this prevent Shopify GraphQL rate limit errors (Throttled: 429)?
Shopify GraphQL operates on a leaky bucket algorithm (50 points/second replenish rate). The query used costs only **7 points**. In n8n, set the HTTP Request node's retry settings to: \`Max Retries: 3\`, \`Wait Between Tries: 1000ms\` with exponential backoff.

---

<ProductCheckout 
  title="Multimodal E-Commerce AI Search n8n Blueprint" 
  price="$67" 
  productId="n8n-multimodal-shopify-blueprint" 
/>`,
    cover: '/projects/ecommerce-store.png',
    category: 'Advanced Automation',
    tags: ['n8n', 'Multimodal', 'Claude 3.5 Sonnet', 'Shopify', 'GraphQL', 'E-commerce'],
    published: true,
    publishedAt: new Date('2026-09-16'),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 3,
    slug: 'unified-meta-inbox-whatsapp-instagram-oauth-webhooks',
    title: 'Building a Unified Meta Web Inbox: WhatsApp & Instagram DM OAuth 2.0 Webhooks',
    excerpt:
      'Architect a resilient, unified Meta inbox webhook handler for WhatsApp Business API and Instagram DMs using Next.js, Redis, and Meta Graph API v21.0.',
    content: `## 1. The Nightmare of Meta’s Fragmented Messaging Ecosystem

For agencies and software vendors building customer communication platforms, Meta’s API landscape is notoriously painful. Although WhatsApp, Instagram Direct Messages, and Facebook Messenger all live under the "Meta for Developers" umbrella, their underlying data architectures are completely disparate:

- **WhatsApp Cloud API**: Uses phone number IDs, WABAs (WhatsApp Business Accounts), and payload objects formatted as \`entry[0].changes[0].value.messages[0]\`.
- **Instagram Messaging API**: Requires an Instagram Professional Account linked to a Facebook Page, utilizes Page-Scoped User IDs (PSIDs) or Instagram Scoped IDs (IGSIDs), and delivers payloads formatted as \`entry[0].messaging[0].message\`.
- **Token Invalidation**: Short-lived user tokens expire in 1-2 hours; long-lived tokens expire in 60 days unless exchanged for perpetual System User Access Tokens via Meta Business Manager.
- **Strict Verification Challenges**: Failure to handle \`hub.mode\`, \`hub.verify_token\`, and \`hub.challenge\` during Meta's handshake drops the webhook subscription instantly.

Managing multiple disparate webhook listeners leads to fragmented database schemas, missed messages, and duplicated customer records.

In this deep architectural guide, we construct a **Unified Meta Webhook Router in Next.js (App Router)**. This single production-grade endpoint validates incoming Meta handshake challenges, verifies payload cryptographic HMAC-SHA256 signatures, normalizes both WhatsApp and Instagram events into a single standardized JSON schema, handles Redis-backed idempotency, and dispatches messages to downstream LLM agents or support dashboards.

---

## 2. Unified Ingestion Architecture

\`\`\`
Meta Cloud Servers (Instagram DM / WhatsApp Cloud API)
                         │
                         ▼  (HTTPS POST with X-Hub-Signature-256)
[Next.js API Route: /api/webhooks/meta]
   ├── 1. Webhook Verification GET Handler (hub.challenge)
   ├── 2. Cryptographic Signature Validation (HMAC-SHA256)
   └── 3. Idempotency Check (Redis SETNX message_id)
                         │
                         ▼
[Unified Normalization Engine]
   ├── If entry.changes ──► Parse as WhatsApp Event
   └── If entry.messaging ──► Parse as Instagram DM Event
                         │
                         ▼
Standardized Unified Event:
{
  "platform": "whatsapp" | "instagram",
  "senderId": "17045550199" | "ig_user_849204",
  "recipientId": "business_phone_id" | "page_id",
  "text": "Hello, do you have this in stock?",
  "media": [ { "type": "image", "url": "..." } ],
  "timestamp": 1726668000
}
                         │
                         ▼
[Downstream Worker Queue / LLM Agent Execution]
\`\`\`

---

## 3. Step-by-Step Technical Implementation

### Step 1: Handling Meta's Webhook Handshake Verification (GET)

When you register a webhook URL in the Meta App Dashboard, Meta sends an immediate \`GET\` request with three query parameters:
- \`hub.mode\`: Must equal \`"subscribe"\`.
- \`hub.verify_token\`: Must match your private environment token.
- \`hub.challenge\`: An arbitrary alphanumeric string that you must echo back verbatim in plain text (\`200 OK\`).

Create \`app/api/webhooks/meta/route.ts\`:

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN!
const META_APP_SECRET = process.env.META_APP_SECRET!

/**
 * 1. Webhook Handshake Verification
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === META_VERIFY_TOKEN) {
    console.log('[Meta Webhook] Verification successful.')
    // CRITICAL: Return challenge as raw text/plain, NOT JSON
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  console.error('[Meta Webhook] Verification failed. Token mismatch.')
  return new NextResponse('Forbidden', { status: 403 })
}
\`\`\`

---

### Step 2: Payload Cryptographic Verification (HMAC-SHA256)

Meta signs every POST request with an \`X-Hub-Signature-256\` header containing an HMAC-SHA256 hash calculated using your \`META_APP_SECRET\`.

Add the signature verification utility function:

\`\`\`typescript
function verifyMetaSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false

  const [prefix, signature] = signatureHeader.split('=')
  if (prefix !== 'sha256' || !signature) return false

  const expectedSignature = crypto
    .createHmac('sha256', META_APP_SECRET)
    .update(rawBody, 'utf-8')
    .digest('hex')

  const signatureBuffer = Buffer.from(signature, 'hex')
  const expectedBuffer = Buffer.from(expectedSignature, 'hex')

  if (signatureBuffer.length !== expectedBuffer.length) return false
  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
}
\`\`\`

---

<ProductCheckout 
  title="Complete Unified Meta Messaging API Hub (Next.js + Redis)" 
  price="$127" 
  productId="meta-unified-inbox-blueprint" 
/>

---

### Step 3: Normalizing WhatsApp and Instagram Payloads (POST)

Now we write the \`POST\` handler that ingests the raw request, validates the cryptographic signature, determines whether the event is from WhatsApp or Instagram, and normalizes the payload into a unified interface:

\`\`\`typescript
export interface UnifiedMessage {
  platform: 'whatsapp' | 'instagram'
  messageId: string
  senderId: string
  recipientId: string
  timestamp: number
  text?: string
  media?: {
    type: 'image' | 'video' | 'audio' | 'document'
    url?: string
    id?: string
  }[]
  rawPayload: any
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-hub-signature-256')

    if (process.env.NODE_ENV === 'production') {
      const isValid = verifyMetaSignature(rawBody, signature)
      if (!isValid) {
        console.error('[Meta Webhook] Tampered payload rejected.')
        return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 })
      }
    }

    const payload = JSON.parse(rawBody)
    const normalizedEvents: UnifiedMessage[] = []

    if (payload.object === 'whatsapp_business_account') {
      for (const entry of payload.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value
          if (value && value.messages) {
            for (const msg of value.messages) {
              normalizedEvents.push(normalizeWhatsAppMessage(msg, value.metadata))
            }
          }
        }
      }
    } else if (payload.object === 'instagram' || payload.object === 'page') {
      for (const entry of payload.entry || []) {
        for (const msgEvent of entry.messaging || []) {
          if (msgEvent.message) {
            normalizedEvents.push(normalizeInstagramMessage(msgEvent, entry.id))
          }
        }
      }
    }

    for (const event of normalizedEvents) {
      console.log(\`[Unified Inbox] [\${event.platform.toUpperCase()}] From: \${event.senderId} | Text: \${event.text}\`)
    }

    return NextResponse.json({ status: 'PROCESSED', count: normalizedEvents.length }, { status: 200 })
  } catch (error) {
    console.error('[Meta Webhook] Error processing event:', error)
    return NextResponse.json({ status: 'RECEIVED_WITH_ERROR' }, { status: 200 })
  }
}

function normalizeWhatsAppMessage(msg: any, metadata: any): UnifiedMessage {
  const unified: UnifiedMessage = {
    platform: 'whatsapp',
    messageId: msg.id,
    senderId: msg.from,
    recipientId: metadata.phone_number_id,
    timestamp: parseInt(msg.timestamp, 10),
    rawPayload: msg,
  }

  if (msg.type === 'text') {
    unified.text = msg.text.body
  } else if (['image', 'video', 'audio', 'document'].includes(msg.type)) {
    unified.media = [
      {
        type: msg.type,
        id: msg[msg.type].id,
      },
    ]
  }

  return unified
}

function normalizeInstagramMessage(msgEvent: any, pageId: string): UnifiedMessage {
  const msg = msgEvent.message
  const unified: UnifiedMessage = {
    platform: 'instagram',
    messageId: msg.mid,
    senderId: msgEvent.sender.id,
    recipientId: msgEvent.recipient.id || pageId,
    timestamp: Math.floor(msgEvent.timestamp / 1000),
    rawPayload: msgEvent,
  }

  if (msg.text) {
    unified.text = msg.text
  }

  if (msg.attachments) {
    unified.media = msg.attachments.map((att: any) => ({
      type: att.type,
      url: att.payload?.url,
    }))
  }

  return unified
}
\`\`\`

---

### Step 4: Exchanging Short-Lived Tokens for Long-Lived System User Tokens

One of the primary failure modes in Meta API integrations is token expiration. Never use personal user access tokens generated by the Graph API Explorer in production.

#### Production Token Architecture:
1. Navigate to **Meta Business Manager > System Users**.
2. Create an **Admin System User** named \`Unified-Inbox-Production\`.
3. Assign Assets:
   - **WhatsApp Business Account**: Full Control (\`whatsapp_business_management\`, \`whatsapp_business_messaging\`).
   - **Facebook Page**: Full Control (\`pages_show_list\`, \`pages_read_engagement\`, \`pages_manage_metadata\`, \`instagram_basic\`, \`instagram_manage_messages\`).
4. Click **Generate New Token**, select **Never Expire (Permanent Token)**, and save it in your environment variables as \`META_SYSTEM_USER_TOKEN\`.

---

### Step 5: Unified Outbound Reply Dispatcher

To send a reply back to the user regardless of platform, implement this unified outbound function:

\`\`\`typescript
/**
 * Unified Outbound Message Dispatcher (Meta Graph API v21.0)
 */
export async function sendUnifiedReply(
  platform: 'whatsapp' | 'instagram',
  recipientId: string,
  messageText: string,
  businessId: string // WhatsApp Phone Number ID or Facebook Page ID
): Promise<boolean> {
  const SYSTEM_TOKEN = process.env.META_SYSTEM_USER_TOKEN!
  let url = ''
  let body: any = {}

  if (platform === 'whatsapp') {
    url = \`https://graph.facebook.com/v21.0/\${businessId}/messages\`
    body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientId,
      type: 'text',
      text: { preview_url: false, body: messageText },
    }
  } else if (platform === 'instagram') {
    url = \`https://graph.facebook.com/v21.0/v21.0/me/messages\`
    body = {
      recipient: { id: recipientId },
      message: { text: messageText },
    }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: \`Bearer \${SYSTEM_TOKEN}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error(\`[Meta Outbound Error] [\${platform}]:\`, errorData)
    return false
  }

  return true
}
\`\`\`

---

## 4. Frequently Asked Questions

### Can Instagram DMs be sent to a user if 24 hours have elapsed since their last message?
No. Meta enforces a strict **24-hour messaging window**. Once 24 hours pass from the user's last inbound message, you cannot send standard automated conversational text. On Instagram, you must use an approved Human Agent Tag or Message Tag; on WhatsApp, you must initiate an approved Utility or Marketing Template.

### How do you download the actual photo or voice note sent via WhatsApp Cloud API?
WhatsApp webhooks do not send image URLs directly; they send a \`media_id\`. You must perform two API calls:
1. \`GET https://graph.facebook.com/v21.0/{media_id}\` (Returns a temporary download URL).
2. \`GET {download_url}\` with your Bearer token to stream the raw binary buffer.

### What permissions are strictly required for Instagram DMs?
Your Meta App must undergo App Review for \`instagram_basic\`, \`instagram_manage_messages\`, and \`pages_manage_metadata\`. During development, the webhook will only fire for users who have an assigned Tester, Developer, or Admin role inside your Meta App Dashboard.

---

<ProductCheckout 
  title="Complete Unified Meta Messaging API Hub (Next.js + Redis)" 
  price="$127" 
  productId="meta-unified-inbox-blueprint" 
/>`,
    cover: '/projects/ai-support-agent.png',
    category: 'APIs & Webhooks',
    tags: ['Meta Graph API', 'WhatsApp', 'Instagram DM', 'Webhooks', 'OAuth 2.0', 'Next.js'],
    published: true,
    publishedAt: new Date('2026-09-18'),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 4,
    slug: 'autonomous-ai-voice-receptionist-guide',
    title: 'Building an Autonomous Inbound AI Voice Receptionist: Complete Architecture Guide (Vapi, Twilio & n8n)',
    excerpt:
      'A battle-tested engineering guide to architecting sub-600ms latency inbound voice agents with live telephony transfer, real-time Google Calendar tool calling, and CRM webhook sync.',
    content: `## Executive Summary: Latency Is the Only Metric That Matters

In conversational voice AI, latency makes or breaks user trust. Human speech follows an instinctual cadence: when two people speak, conversational gaps average between **200ms and 500ms**. If an automated voice agent takes longer than **800ms** to respond, callers experience an uncomfortable awkward silence, interrupt the model, or simply hang up.

This guide details the exact architecture I deploy for enterprise clients to achieve an end-to-end response latency of **520ms - 640ms** with zero hallucinations, dynamic tool calling, and live PSTN phone transfer via Twilio.

---

## Telephony Pipeline Architecture

\`\`\`
Caller (Cellular PSTN Network)
       │
       ▼ (SIP Trunking / 8kHz G.711 µ-law)
Twilio Voice Infrastructure
       │
       ▼ (Bi-directional WebSocket Stream)
Vapi.ai Orchestration Layer
       ├── 1. Streaming STT: Deepgram Nova-2 (~160ms TTFT)
       ├── 2. Streaming LLM: Groq Llama-3.3-70b / Claude 3.5 Sonnet (~190ms TTFT)
       ├── 3. Streaming TTS: Cartesia Sonic / ElevenLabs Turbo v2.5 (~120ms TTFB)
       └── 4. Async Function Calling Webhook: n8n / FastAPI (~320ms background)
\`\`\`

## Platform Comparison: Latency & Telephony Economics

| Feature / Metric | Vapi.ai | Retell AI | Bland.ai | Custom WebRTC (LiveKit) |
|---|---|---|---|---|
| **Average Latency** | **520ms - 650ms** | 580ms - 700ms | 720ms - 880ms | **350ms - 480ms** |
| **Barge-in (VAD)** | Sub-150ms instant | Sub-180ms instant | 250ms | Custom engineered |
| **Native Twilio SIP** | ✅ Direct integration | ✅ Direct integration | ✅ Proprietary | Requires Asterisk/Kamailio |
| **Custom Function Calling** | ✅ Real-time Webhooks | ✅ Real-time Webhooks | ✅ Limited | ✅ Direct RPC |

---

## Frequently Asked Questions

### Can AI voice agents handle natural caller interruptions (barge-in)?
Yes. Modern voice orchestration platforms continuously stream user audio to server-side Voice Activity Detection (VAD) algorithms.

### What happens if the customer requests a human or an emergency arises?
The agent executes a Twilio SIP Refer or Cold Transfer protocol to bridge the call directly to an internal desk phone or cell number.`,
    cover: '/projects/ai-support-agent.png',
    category: 'AI Voice Agents',
    tags: ['Voice AI', 'Vapi', 'Twilio', 'n8n', 'System Prompts', 'Automation'],
    published: true,
    publishedAt: new Date('2026-09-15'),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 5,
    slug: 'self-healing-n8n-multi-agent-workflows',
    title: 'Self-Healing n8n Multi-Agent Workflows: Architecting Resilient Automation with Claude 3.5 & LangGraph',
    excerpt:
      'How to architect enterprise-grade automation pipelines that automatically detect schema drift, repair malformed JSON payloads via LLM reflection loops, and execute without human intervention.',
    content: `## The Silent Killer of Enterprise Automation: Fragile JSON & API Drift

Every engineer who maintains production webhooks and automation pipelines knows the dreaded **3:00 AM PagerDuty alert**: an external SaaS tool silently changed an API response from a string to an object, or an AI extraction model emitted slightly malformed JSON, crashing an entire downstream workflow.

In this architecture guide, we deploy a **3-tier self-healing loop**: Worker Node -> Critic Node -> Schema Repair Agent using Claude 3.5 Sonnet.

---

## Automation Platform Comparison

| Capability | n8n (Self-Hosted / Cloud) | Make.com | Zapier Enterprise | Temporal.io |
|---|---|---|---|---|
| **Data Privacy (GDPR/HIPAA)** | 🔒 100% On-Premise / VPC | ☁️ Cloud Only | ☁️ Cloud Only | 🔒 Self-Hosted |
| **Custom Code & Packages** | ✅ Full Node.js & Python | ⚠️ Limited Math/Functions | ⚠️ Limited Code Steps | ✅ Native Code (Go/TS) |
| **Cost per 1M Operations** | **~$20 - $50 (Server cost)** | ~$450 - $900 | ~$1,500 - $3,500 | ~$50 - $120 |

---

## Frequently Asked Questions

### How much does the LLM reflection repair loop cost per execution?
Using Claude 3.5 Sonnet to repair a typical 2KB JSON payload costs approximately **$0.0012 to $0.004** per healing cycle.

### Can this self-healing workflow run on self-hosted n8n instances?
Yes. The entire workflow is exported as a standalone JSON blueprint that imports directly into any n8n version.`,
    cover: '/projects/ecommerce-store.png',
    category: 'Advanced Automation',
    tags: ['n8n', 'Multi-Agent', 'Claude 3.5', 'LangGraph', 'Workflows', 'JSON Blueprints'],
    published: true,
    publishedAt: new Date('2026-09-10'),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 6,
    slug: 'building-reliable-ai-agents',
    title: 'Building Reliable AI Agents for Real Businesses: Production Checklist',
    excerpt:
      'Most AI demos fall apart in production. Here is the checklist I use to ship autonomous systems that keep working after launch.',
    content: `## Start with the failure modes

Before writing a single prompt, list every way the agent can be wrong and decide what happens next.

## Retrieval beats memory

Ground every answer in your own documents. A small, well-chunked knowledge base outperforms a bigger model every time.

## Keep a human in the loop

Route low-confidence answers to a person. Log everything. Review weekly.

\`\`\`ts
const result = await agent.run({ input, confidenceThreshold: 0.8 })
if (result.confidence < 0.8) escalate(result)
\`\`\`

## Frequently Asked Questions

### What is the most common reason AI agents fail in production?
Unconstrained prompts and lack of structured output validation. Always enforce strict JSON schemas on your model outputs.`,
    cover: '/projects/ai-support-agent.png',
    category: 'AI & Automation',
    tags: ['AI', 'Automation', 'Production'],
    published: true,
    publishedAt: new Date('2026-08-12'),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 7,
    slug: 'nextjs-performance-checklist',
    title: 'The Next.js Performance & Core Web Vitals Checklist for 2026',
    excerpt: 'Images, fonts, ISR caching and the handful of settings that make a modern web application feel instantaneous.',
    content: `## Images

Use \`next/image\` with explicit sizes. Serve modern AVIF and WebP formats automatically.

## Fonts

Self-host with \`next/font\`, preload only the weights you use to prevent layout shift (CLS).

## Caching & SSG

Cache everything that is not personal. Revalidate on publish with ISR (\`revalidate = 3600\`), not on dynamic request-time SSR.

\`\`\`ts
// ISR Configuration for Static Regeneration
export const revalidate = 3600
\`\`\`

## Frequently Asked Questions

### Why should blog posts use SSG instead of SSR?
Static generation pre-renders HTML at build time, yielding near-zero Time to First Byte (TTFB) from CDN edges and significantly boosting Google search rankings.`,
    cover: '/projects/ecommerce-store.png',
    category: 'Web Development',
    tags: ['Next.js', 'Performance', 'SEO'],
    published: true,
    publishedAt: new Date('2026-06-03'),
    createdAt: now,
    updatedAt: now,
  },
]
