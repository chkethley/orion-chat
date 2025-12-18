# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Orion is a Tauri v2 desktop application with a React 19 + TypeScript frontend and a Rust backend.

## Development Commands

```bash
# Install dependencies
npm install

# Run the app in development mode (starts both Vite dev server and Tauri)
npm run tauri dev

# Build the frontend only
npm run build

# Build the complete application for distribution
npm run tauri build

# Type check the frontend
tsc
```

## Architecture

### Frontend (src/)
- React 19 application built with Vite
- Entry point: `src/main.tsx` -> `src/App.tsx`
- TypeScript with strict mode enabled
- Vite dev server runs on port 1420

### Backend (src-tauri/)
- Rust application using Tauri v2
- `src/main.rs` - Application entry point, calls `orion_lib::run()`
- `src/lib.rs` - Contains Tauri command handlers and app initialization
- Tauri commands are defined with `#[tauri::command]` macro

### Frontend-Backend Communication
The frontend calls Rust functions using Tauri's invoke API:
```typescript
import { invoke } from "@tauri-apps/api/core";
const result = await invoke("command_name", { arg1, arg2 });
```

Corresponding Rust commands are registered in `lib.rs`:
```rust
#[tauri::command]
fn command_name(arg1: Type, arg2: Type) -> ReturnType { }

// Register in run():
.invoke_handler(tauri::generate_handler![command_name])
```

## Configuration Files

- `tauri.conf.json` - Tauri app configuration (window settings, build commands, bundling)
- `vite.config.ts` - Vite bundler configuration
- `tsconfig.json` - TypeScript compiler options (strict mode, ES2020 target)
- `Cargo.toml` - Rust dependencies (Tauri 2, serde for serialization)
- `tailwind.config.js` - Tailwind CSS configuration with dark theme and purple accents

## Features

### AI Chat Interface
- **ChatGPT-style UI** with dark background (#0f0f0f) and deep purple accents (#6D28D9)
- **Real-time streaming** responses from OpenRouter API with SSE (Server-Sent Events)
- **Markdown rendering** with GitHub Flavored Markdown support via react-markdown
- **Code syntax highlighting** using highlight.js with GitHub Dark theme
- **Typing indicators** with animated dots during message streaming
- **Message persistence** via Zustand store with localStorage

### Conversation Management
- **Sidebar** with conversation list sorted by most recent activity
- **Search conversations** - Filter by title or message content (Ctrl+K)
- **Rename conversations** - Inline editing with Enter/Escape support
- **Export conversations** - Download as JSON with full message history
- **Delete conversations** - With confirmation dialog
- **Auto-generate titles** from first user message
- **Message count** and last updated timestamp for each conversation

### Model Selection
- **Dynamic model loading** - Fetches all available models from OpenRouter API
- **Enhanced model selector** with search functionality
- **Refresh button** to reload the latest models from OpenRouter
- **Featured models** section with sparkle icon highlighting top models
- **Rich model cards** showing:
  - Provider (Anthropic, OpenAI, Google, Meta, Mistral, etc.)
  - Context window size (dynamically formatted: 128K, 1M, 2M tokens)
  - Pricing (input/output per 1M tokens, including free models)
- **Real-time search** across 100+ models by name, provider, or ID
- **Auto-updates** model list on app launch with fallback to cached models
- **Supports all OpenRouter models** including:
  - Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
  - GPT-4o, GPT-4 Turbo, GPT-4o Mini, GPT-3.5 Turbo
  - Gemini 2.0 Flash (Free), Gemini Pro 1.5
  - Llama 3.1/3.2, Mistral, Mixtral, and many more

### MCP (Model Context Protocol) Integration
- **Full MCP server support** via Rust backend with stdio communication
- **JSON-RPC 2.0** protocol implementation for MCP interactions
- **Server management**:
  - Add/remove/start/stop MCP servers
  - Configure command, arguments, and environment variables
  - Auto-start option for servers
- **Tool discovery** - Automatic tool listing from running servers
- **Tool calling** - LLM can invoke MCP tools during conversations
- **Server status indicators** - Visual feedback (running, stopped, starting, error)
- **MCP UI** integrated into Settings dialog

### Keyboard Shortcuts
- `Ctrl+N` - New conversation
- `Ctrl+K` - Search conversations (focus search input)
- `Ctrl+,` - Open settings
- `Ctrl+/` - Show keyboard shortcuts dialog
- `Escape` - Close dialogs
- `Enter` - Send message
- `Shift+Enter` - New line in message
- `Ctrl+Enter` - Send message (alternative)

### User Experience
- **Toast notifications** for errors and success messages
- **Loading states** with smooth transitions
- **Typing indicator** when AI is generating response
- **Auto-scroll** to latest message
- **Responsive layout** with flexible sizing
- **Custom scrollbars** with purple accent matching theme
- **Focus indicators** for accessibility
- **Smooth animations** for UI transitions

### Data Persistence
- **Frontend storage**: Zustand with localStorage for conversations, settings, and MCP servers
- **Backend storage**: Rust Tauri commands for conversation and settings persistence
- **No data loss**: All conversations saved locally
- **Export capability**: Download conversations as JSON

## Code Structure

### Frontend Components

#### Layout (`src/components/layout/`)
- `AppLayout.tsx` - Main application container with sidebar and content area
- `Sidebar.tsx` - Conversation list with search, rename, export, and delete
- `Header.tsx` - Model selector with search and keyboard shortcuts button

#### Chat (`src/components/chat/`)
- `ChatArea.tsx` - Main chat container with message list and input
- `MessageList.tsx` - Scrollable message container with auto-scroll
- `Message.tsx` - Individual message bubble with role-based styling
- `MessageInput.tsx` - Textarea with send/stop button and keyboard shortcuts
- `TypingIndicator.tsx` - Animated dots for streaming indication

#### Markdown (`src/components/markdown/`)
- `MarkdownRenderer.tsx` - react-markdown with custom renderers
- `CodeBlock.tsx` - Syntax highlighted code with copy button

#### Settings (`src/components/settings/`)
- `SettingsDialog.tsx` - API key management and MCP server configuration
- `KeyboardShortcutsDialog.tsx` - Interactive shortcuts reference

#### MCP (`src/components/mcp/`)
- `McpServerList.tsx` - List of configured MCP servers with controls
- `McpServerDialog.tsx` - Add/configure MCP server form

#### UI (`src/components/ui/`)
- Shadcn/ui components: Button, Input, Textarea, ScrollArea, Dialog, DropdownMenu, Label
- `toast.tsx` - Custom toast notification system
- `kbd.tsx` - Keyboard shortcut display component

### State Management (`src/stores/`)
- `chatStore.ts` - Conversations, messages, streaming state
- `settingsStore.ts` - API key, model selection
- `mcpStore.ts` - MCP servers, tools, server lifecycle

### Services (`src/services/`)
- `openrouter.ts` - OpenRouter API client with SSE streaming
- `openrouterModels.ts` - Fetch and format model list from OpenRouter API

### Hooks (`src/hooks/`)
- `useStreaming.ts` - Streaming chat with MCP tool integration
- `useKeyboardShortcuts.ts` - Global keyboard shortcut handler

### Types (`src/types/`)
- `chat.ts` - Message, Conversation, ToolCall types
- `openrouter.ts` - OpenRouter API types
- `mcp.ts` - MCP server and tool types

### Backend (Rust)

#### Main (`src-tauri/src/`)
- `main.rs` - Application entry point
- `lib.rs` - Tauri builder with command registration and plugin initialization

#### Commands (`src-tauri/src/commands/`)
- `storage.rs` - Save/load conversations and settings
- `mcp.rs` - Start/stop MCP servers, list tools, call tools

#### MCP (`src-tauri/src/mcp/`)
- `protocol.rs` - JSON-RPC 2.0 and MCP protocol types
- `transport.rs` - Async stdio communication with tokio
- `server.rs` - McpServer and McpServerManager for lifecycle management

## Development Notes

### Adding a New Tauri Command
1. Define command in `src-tauri/src/commands/` with `#[tauri::command]`
2. Add to module exports in `src-tauri/src/commands/mod.rs`
3. Register in `src-tauri/src/lib.rs` with `tauri::generate_handler!`
4. Call from frontend with `invoke('command_name', { args })`

### Adding a New MCP Server
1. Use Settings dialog → MCP Servers → Add Server
2. Configure command (e.g., `node`), args (e.g., `server.js`), and env vars
3. Enable auto-start if desired
4. Server tools will be automatically discovered and available to the AI

### Theme Customization
- Colors defined in `tailwind.config.js`
- Primary purple: `#6D28D9`
- Background: `#0f0f0f`
- Muted: `#1f1f1f`
- Modify these values to change the theme

### Testing MCP Integration
1. Create a test MCP server (Node.js with MCP SDK)
2. Add server through Settings → MCP Servers
3. Start a conversation and watch console for tool calls
4. AI will automatically invoke tools when appropriate

### Using All OpenRouter Models
1. Click the model selector dropdown in the header
2. Click the refresh icon to fetch the latest model list from OpenRouter
3. Search through 100+ models by name, provider, or model ID
4. Featured models (Claude 3.5 Sonnet, GPT-4o, Gemini 2.0 Flash) appear at the top
5. All other models appear in the "All Models" section below
6. Model information includes provider, context window, and pricing
7. The app automatically fetches models on startup with fallback to cached list
