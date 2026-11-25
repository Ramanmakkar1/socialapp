// Copy for the "schedule social media posts with <assistant>" pages (src/app/schedule-posts-with-*).
// Every setup step uses Poskoo's real MCP server (src/app/api/mcp/route.ts: Streamable HTTP, POST only,
// "Authorization: Bearer poskoo_..." API key) and only the tools in src/lib/mcp.ts MCP_TOOLS.
// aiAssistantGuides.test.ts fails if a tool named here stops existing.
import { BRAND } from "./brand";

export const MCP_URL = `${BRAND.url}/api/mcp`;

export type AssistantSlug = "chatgpt" | "claude" | "claude-code" | "cursor";

export type AssistantGuide = {
  slug: AssistantSlug;
  path: `/schedule-posts-with-${AssistantSlug}`;
  /** Short name used in headings and links. */
  name: string;
  title: string;
  description: string;
  h1Lead: string;
  h1Em: string;
  lede: string;
  /** Who this setup is for, one short paragraph. */
  fit: string;
  steps: { title: string; text: string; code?: string; codeLabel?: string }[];
  /** Honest notes about this client (auth, where it works, where it does not). */
  notes: string[];
  prompts: { prompt: string; tool: string }[];
  faqs: { q: string; a: string }[];
};

/** The tools the Poskoo MCP server exposes today (names must match MCP_TOOLS). */
export const ASSISTANT_TOOLS: { name: string; text: string }[] = [
  { name: "list_channels", text: "Lists the channels connected to your Poskoo account and their status." },
  { name: "list_posts", text: "Lists your drafts, scheduled, published and failed posts, newest first (up to 100)." },
  { name: "create_post", text: "Drafts or schedules a post to any of your connected channels: caption, optional per-network captions, up to 10 public image or video links, and a time or the next free slot." },
  { name: "update_post", text: "Edits a draft or scheduled post that hasn't started publishing: caption, channels, media or time." },
  { name: "delete_post", text: "Deletes a draft, scheduled or failed post (never one that is publishing or published)." },
  { name: "get_post_status", text: "Shows whether a post is pending, publishing, published or failed on each network, with the error if there is one." },
  { name: "add_idea", text: "Saves a post idea to your Poskoo ideas board." },
  { name: "list_media", text: "Lists the images and videos in your Poskoo media library, so the assistant can attach them to a post." },
  { name: "list_contacts", text: "Lists contacts your Instagram Auto-DMs have captured, with any email or phone they shared." },
  { name: "create_dm_rule", text: "Creates an Instagram Auto-DM: comment a keyword, get a DM (optionally after sharing an email)." },
  { name: "create_campaign_from_brief", text: "Drafts a whole campaign from a short brief with Poskoo's AI, as drafts for you to review (when AI is switched on for your account)." },
  { name: "get_analytics_summary", text: "Summarises reach, likes, comments and saves for published posts over 7, 30 or 90 days." },
];

/** Limits that apply to every assistant, straight from src/lib/mcp.ts and the plan limits. */
export const ASSISTANT_LIMITS: string[] = [
  "create_post works with every channel you have connected in Poskoo. Use list_channels to see which ones the assistant can post to.",
  "New API keys are drafts-only: posts arrive as drafts and Auto-DMs start paused until you approve them in Poskoo. Tick \"Allow publishing\" on a key to let the assistant schedule directly.",
  "Media must be a public https link to a .jpg or .png image or an .mp4 video. The assistant cannot upload a file from your computer.",
  "Your plan limits still apply. On the Free plan that means 10 scheduled posts a month across 2 accounts.",
  "Each API key can make 60 requests a minute. Keys are stored hashed and can be revoked in Settings at any time.",
  "The assistant can create Auto-DM rules and list captured contacts, but it cannot read your inbox. Do that in the Poskoo app.",
];

const API_KEY_STEP = {
  title: "Create a Poskoo API key",
  text: "Sign in to Poskoo, open Settings and find the API keys section. Create a key, give it a name you will recognise later and copy it straight away: Poskoo keeps only a hash, so the full key is shown once.",
};

const CONNECT_CHANNEL_STEP = {
  title: "Connect a channel in Poskoo",
  text: "The assistant schedules to the channels you have already connected. Connect your channels in Poskoo first (Instagram, Facebook, Threads, YouTube, LinkedIn, Bluesky, Mastodon and more), then come back to your assistant.",
};

export const ASSISTANT_GUIDES: Record<AssistantSlug, AssistantGuide> = {
  chatgpt: {
    slug: "chatgpt",
    path: "/schedule-posts-with-chatgpt",
    name: "ChatGPT",
    title: `Schedule Social Media Posts with ChatGPT | ${BRAND.name}`,
    description:
      "Connect OpenAI's tools to Poskoo's MCP server so the posts you draft with ChatGPT get scheduled to your connected channels.",
    h1Lead: "Schedule social media posts with",
    h1Em: "ChatGPT",
    lede:
      "Draft the caption with ChatGPT, then let an OpenAI tool hand it to Poskoo. Poskoo's MCP server schedules the post on your connected channels with the same checks as the Poskoo calendar.",
    fit:
      "This setup suits people who already write their posts with ChatGPT and want them to land in a real publishing queue instead of a notes app. It uses OpenAI's Codex CLI or the OpenAI API, both of which can send Poskoo's API key.",
    steps: [
      CONNECT_CHANNEL_STEP,
      API_KEY_STEP,
      {
        title: "Add Poskoo to Codex",
        text: "Codex is OpenAI's coding agent and signs in with your ChatGPT account. Save the key in an environment variable, then register Poskoo as a streamable HTTP MCP server that reads the key from it.",
        codeLabel: "Codex CLI setup",
        code: `export POSKOO_API_KEY="poskoo_YOUR_API_KEY"\ncodex mcp add poskoo --url ${MCP_URL} --bearer-token-env-var POSKOO_API_KEY`,
      },
      {
        title: "Or call it from the OpenAI API",
        text: "Building your own workflow? The Responses API can use a remote MCP server directly. Pass the Poskoo key as an Authorization header on the MCP tool.",
        codeLabel: "OpenAI Responses API request",
        code: `curl https://api.openai.com/v1/responses \\\n  -H "Authorization: Bearer $OPENAI_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "model": "gpt-5",\n    "tools": [{\n      "type": "mcp",\n      "server_label": "poskoo",\n      "server_url": "${MCP_URL}",\n      "headers": { "Authorization": "Bearer poskoo_YOUR_API_KEY" },\n      "require_approval": "never"\n    }],\n    "input": "List my connected Poskoo channels."\n  }'`,
      },
    ],
    notes: [
      "Poskoo's MCP server signs in with an API key sent as an Authorization header. It does not offer OAuth sign-in yet.",
      "In the ChatGPT app, custom connectors are added from the connector settings. If those settings only offer OAuth sign-in, the ChatGPT app cannot send a Poskoo key yet, so use Codex or the API route above.",
      "The API example only lists channels, so it skips approval. When the model may call create_post, set \"require_approval\" to \"always\" and approve each call before it runs.",
    ],
    prompts: [
      { prompt: "Which Poskoo channels do I have connected, and are any of them disconnected?", tool: "list_channels" },
      { prompt: "Write three caption options for our Saturday market stall, then schedule the one I pick to Instagram at 9:00 on Friday, Toronto time, with this photo: https://example.com/stall.jpg", tool: "create_post" },
      { prompt: "Save these five Reel hooks to my Poskoo ideas board as to-do ideas.", tool: "add_idea" },
      { prompt: "How did my posts do over the last 30 days? Which one got the most saves?", tool: "get_analytics_summary" },
    ],
    faqs: [
      {
        q: "Can ChatGPT post to Instagram directly?",
        a: "Not on its own. ChatGPT can write the caption, and an OpenAI tool connected to Poskoo's MCP server can schedule it. Poskoo then publishes through Meta's official API at the time you chose.",
      },
      {
        q: "Does this work in the ChatGPT app?",
        a: "Poskoo's MCP server uses an API key in an Authorization header and does not offer OAuth sign-in yet. If your ChatGPT connector settings only offer OAuth, use Codex (which signs in with your ChatGPT account) or the OpenAI API instead.",
      },
      {
        q: "Which networks can ChatGPT schedule to through Poskoo?",
        a: "Every channel you have connected in Poskoo. create_post takes a list of channels, and list_channels shows which ones are connected.",
      },
      {
        q: "Does it cost extra?",
        a: "No. API keys and the MCP server are part of every Poskoo plan, including Free. Your OpenAI usage is billed by OpenAI as usual.",
      },
    ],
  },
  claude: {
    slug: "claude",
    path: "/schedule-posts-with-claude",
    name: "Claude",
    title: `Schedule Social Media Posts with Claude | ${BRAND.name}`,
    description:
      "Add Poskoo's MCP server to the Claude desktop app so Claude can schedule your posts, list your channels and read your post analytics.",
    h1Lead: "Schedule social media posts with",
    h1Em: "Claude",
    lede:
      "Write with Claude and let it put the finished post in your Poskoo queue. Add Poskoo to the Claude desktop app once, then ask in plain words: schedule this, show my queue, how did last month go.",
    fit:
      "This setup suits people who plan content in long conversations with Claude: brainstorming a week of posts, tightening captions, then scheduling them without copying anything across.",
    steps: [
      CONNECT_CHANNEL_STEP,
      API_KEY_STEP,
      {
        title: "Add Poskoo to the Claude desktop app",
        text: "In the Claude desktop app, open Settings, then Developer, then Edit Config. Add Poskoo to claude_desktop_config.json. The small mcp-remote bridge (it needs Node.js) connects Claude to Poskoo's server and sends your key as a header.",
        codeLabel: "claude_desktop_config.json",
        code: JSON.stringify(
          {
            mcpServers: {
              poskoo: {
                command: "npx",
                args: ["-y", "mcp-remote", MCP_URL, "--header", "Authorization:${POSKOO_AUTH}"],
                env: { POSKOO_AUTH: "Bearer poskoo_YOUR_API_KEY" },
              },
            },
          },
          null,
          2,
        ),
      },
      {
        title: "Restart Claude and check the tools",
        text: "Quit and reopen the desktop app. Poskoo's five tools appear in the tools menu of a new chat. Claude asks before it runs a tool, so you approve each scheduled post.",
      },
    ],
    notes: [
      "Custom connectors on claude.ai ask for an OAuth sign-in. Poskoo's MCP server uses API keys and does not offer OAuth yet, so use the desktop app setup above or Claude Code.",
      "The header is written as Authorization:${POSKOO_AUTH} with no space after the colon. That is mcp-remote's documented way to pass a header safely on every operating system.",
    ],
    prompts: [
      { prompt: "Here are my notes for the week. Turn them into five Threads posts under 500 characters, then schedule them into my next free slots.", tool: "create_post" },
      { prompt: "Show my scheduled posts for the next two weeks and point out any gaps.", tool: "list_posts" },
      { prompt: "Did any of my posts fail to publish? List them with their captions.", tool: "list_posts" },
      { prompt: "Compare the last 7 days with the last 30. Is reach going up or down?", tool: "get_analytics_summary" },
    ],
    faqs: [
      {
        q: "Can Claude post to social media?",
        a: "Yes, through Poskoo. Once Poskoo's MCP server is added, Claude can draft and schedule posts to any channel you have connected, and Poskoo publishes them through each platform's official API.",
      },
      {
        q: "Does this work on claude.ai in the browser?",
        a: "Not yet. Custom connectors on claude.ai sign in with OAuth, and Poskoo's MCP server uses API keys today. The Claude desktop app and Claude Code both work.",
      },
      {
        q: "Will Claude post without asking me?",
        a: "Claude asks for permission before it runs a tool unless you have allowed that tool to run without asking. Keep approvals on so you see every post before it is scheduled.",
      },
      {
        q: "Can Claude set up Instagram auto-DM rules?",
        a: "No. The MCP server covers scheduling, ideas and analytics. Auto-DM rules, the inbox and leads are managed in the Poskoo app.",
      },
    ],
  },
  "claude-code": {
    slug: "claude-code",
    path: "/schedule-posts-with-claude-code",
    name: "Claude Code",
    title: `Schedule Social Media Posts with Claude Code | ${BRAND.name}`,
    description:
      "Add Poskoo to Claude Code with one command and schedule launch posts, release notes and changelog updates straight from your terminal.",
    h1Lead: "Schedule social media posts with",
    h1Em: "Claude Code",
    lede:
      "Ship the release, then announce it without leaving the terminal. One claude mcp add command connects Claude Code to Poskoo, and Claude can turn your changelog into scheduled posts.",
    fit:
      "This setup suits developers and indie makers who already work in Claude Code. The source of the post (a changelog, a README, release notes) is in the repository, so Claude can read it and schedule the announcement in one step.",
    steps: [
      CONNECT_CHANNEL_STEP,
      API_KEY_STEP,
      {
        title: "Add Poskoo with one command",
        text: "Register Poskoo as an HTTP MCP server with your key as a header. The user scope makes it available in every project on your machine.",
        codeLabel: "Claude Code setup",
        code: `claude mcp add --transport http --scope user poskoo ${MCP_URL} \\\n  --header "Authorization: Bearer poskoo_YOUR_API_KEY"`,
      },
      {
        title: "Check the connection",
        text: "Run claude mcp list in your shell, or type /mcp inside Claude Code. Poskoo should show as connected with five tools.",
        codeLabel: "Check the server",
        code: "claude mcp list",
      },
    ],
    notes: [
      "Use --scope user to keep the key out of the repository. A project-scoped server is written to .mcp.json, which is easy to commit by mistake.",
      "Claude Code asks before each tool call by default. Keep that on for create_post so nothing is scheduled without you seeing it.",
    ],
    prompts: [
      { prompt: "Read CHANGELOG.md, write a short launch post for v2.3 and schedule it to Threads and Instagram for tomorrow at 15:00 UTC with https://example.com/v2-3.png", tool: "create_post" },
      { prompt: "Turn the three biggest items in this release into a post each and put them in my next free slots.", tool: "create_post" },
      { prompt: "Save five ideas for follow-up posts about this release to my Poskoo ideas board.", tool: "add_idea" },
      { prompt: "What have I already scheduled this week? Do not repeat any of it.", tool: "list_posts" },
    ],
    faqs: [
      {
        q: "How do I add an MCP server to Claude Code?",
        a: "Run claude mcp add with --transport http, a name, the server URL and any headers it needs. For Poskoo that is the /api/mcp URL and an Authorization header with your Poskoo API key.",
      },
      {
        q: "Can Claude Code attach a screenshot from my repository?",
        a: "Not as a file. create_post takes a public https link to a .jpg, .png or .mp4 file, so host the image first (for example on your site or a CDN) and give Claude the link.",
      },
      {
        q: "Which networks does it post to?",
        a: "Every channel you have connected in Poskoo. create_post takes a list of channels, and list_channels shows which ones are connected.",
      },
      {
        q: "Is my API key safe?",
        a: "Poskoo stores only a hash of the key, every request is limited to your own account, and you can revoke the key in Settings at any time. Keep it in user scope, not in a committed file.",
      },
    ],
  },
  cursor: {
    slug: "cursor",
    path: "/schedule-posts-with-cursor",
    name: "Cursor",
    title: `Schedule Social Media Posts with Cursor | ${BRAND.name}`,
    description:
      "Add Poskoo's MCP server to Cursor's mcp.json so Cursor's agent can schedule posts about what you build and read your post analytics.",
    h1Lead: "Schedule social media posts with",
    h1Em: "Cursor",
    lede:
      "Cursor's agent already knows what you just built. Add Poskoo to mcp.json and it can write the post about it and schedule it to your channels, without a browser tab.",
    fit:
      "This setup suits builders who spend the day in Cursor and want to share progress, launch notes or docs updates on a regular schedule without switching apps.",
    steps: [
      CONNECT_CHANNEL_STEP,
      API_KEY_STEP,
      {
        title: "Add Poskoo to mcp.json",
        text: "Open ~/.cursor/mcp.json (all projects) or .cursor/mcp.json in one project, and add Poskoo as a remote server with your key in the headers.",
        codeLabel: "~/.cursor/mcp.json",
        code: JSON.stringify(
          {
            mcpServers: {
              poskoo: {
                url: MCP_URL,
                headers: { Authorization: "Bearer poskoo_YOUR_API_KEY" },
              },
            },
          },
          null,
          2,
        ),
      },
      {
        title: "Turn it on in Cursor Settings",
        text: "Open Cursor Settings and the MCP section. Poskoo should be listed with five tools; switch it on if it is off. Then ask the agent in chat.",
      },
    ],
    notes: [
      "Put the server in ~/.cursor/mcp.json so the key stays out of your repository. A project .cursor/mcp.json can be committed by mistake.",
      "Cursor asks before running MCP tools unless you have turned on auto-run. Leave it off for create_post.",
    ],
    prompts: [
      { prompt: "Look at the last five commits and write a short build-in-public update. Schedule it to Threads in my next free slot.", tool: "create_post" },
      { prompt: "Read docs/launch.md and schedule a YouTube Short with this title and https://example.com/demo.mp4 for Monday at 16:00 UTC.", tool: "create_post" },
      { prompt: "Which of my channels are connected right now?", tool: "list_channels" },
      { prompt: "Summarise my last 90 days of post performance in a table.", tool: "get_analytics_summary" },
    ],
    faqs: [
      {
        q: "How do I add a remote MCP server to Cursor?",
        a: "Add an entry under mcpServers in mcp.json with a url and, if the server needs one, a headers object. For Poskoo the url is the /api/mcp endpoint and the header is Authorization: Bearer with your Poskoo API key.",
      },
      {
        q: "Can Cursor publish to LinkedIn through Poskoo?",
        a: "Yes, if your LinkedIn profile is connected in Poskoo. create_post accepts any connected channel, LinkedIn included.",
      },
      {
        q: "Do I need a paid Poskoo plan?",
        a: "No. API keys and the MCP server work on every plan. The Free plan's limits apply: 2 social accounts and 10 scheduled posts a month.",
      },
      {
        q: "What happens if a post fails?",
        a: "It shows as failed in Poskoo with the reason, and you can fix and retry it from the calendar. Ask the agent to list failed posts to find them.",
      },
    ],
  },
};

export const ASSISTANT_ORDER: AssistantSlug[] = ["chatgpt", "claude", "claude-code", "cursor"];
