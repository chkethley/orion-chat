# Orion AI

<div align="center">

**A powerful desktop AI chat application with Model Context Protocol (MCP) integration**

Built with Tauri v2, React 19, and Rust

[Features](#features) • [Installation](#installation) • [Development](#development) • [MCP Integration](#mcp-integration) • [Screenshots](#screenshots)

</div>

---

## Overview

Orion is a modern, feature-rich AI chat application that brings the power of multiple AI models to your desktop. With support for 100+ models from OpenRouter, streaming responses, and full Model Context Protocol (MCP) integration, Orion provides a seamless experience for AI-assisted workflows.

### Why Orion?

- **🚀 Native Desktop Performance** - Built with Tauri and Rust for blazing-fast performance and minimal resource usage
- **🤖 Multiple AI Models** - Access Claude 3.5 Sonnet, GPT-4o, Gemini 2.0, Llama 3.1, and 100+ other models
- **🔌 MCP Integration** - First-class support for Model Context Protocol, enabling AI tools to interact with external systems
- **💬 Real-time Streaming** - Experience fluid, ChatGPT-style streaming responses
- **🎨 Beautiful UI** - Dark theme with purple accents, smooth animations, and polished interactions
- **💾 Local-First** - All conversations stored locally with no data sent to third parties (except your chosen AI provider)
- **⌨️ Keyboard Shortcuts** - Power-user friendly with comprehensive keyboard navigation

---

## Screenshots

<div align="center">

### Main Chat Interface
![Orion Main Interface](assets/screenshots/main-interface.png)
*Clean, modern chat interface with sidebar navigation, model selector, and real-time streaming responses*

### Model Selection
![Model Selector](assets/screenshots/model-selector.png)
*Browse and search 100+ AI models with detailed information about providers, context windows, and pricing*

### MCP Server Management
![MCP Servers](assets/screenshots/mcp-servers.png)
*Manage MCP servers with visual status indicators and one-click start/stop controls*

### Smithery Marketplace
![Smithery Browser](assets/screenshots/smithery-browser.png)
*Browse and install MCP servers from the Smithery marketplace with search and filtering*

### Settings & Configuration
![Settings Dialog](assets/screenshots/settings.png)
*Configure API keys, select models, and manage MCP servers all in one place*

</div>

---

## Features

### 🤖 AI Model Support

- **100+ Models** from leading AI providers:
  - **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
  - **OpenAI**: GPT-4o, GPT-4 Turbo, GPT-4o Mini, GPT-3.5 Turbo
  - **Google**: Gemini 2.0 Flash (Free), Gemini Pro 1.5
  - **Meta**: Llama 3.1, Llama 3.2
  - **Mistral AI**: Mistral Large, Mixtral 8x7B
  - And many more...

- **Smart Model Selector**:
  - Search across all models by name, provider, or ID
  - Featured models section with top recommendations
  - Rich model cards showing provider, context window, and pricing
  - Refresh button to fetch latest models from OpenRouter
  - Real-time filtering and dynamic loading

### 💬 Chat Experience

- **Streaming Responses** - Real-time message streaming with typing indicators
- **Markdown Support** - Full GitHub Flavored Markdown rendering
- **Syntax Highlighting** - Code blocks with syntax highlighting (100+ languages)
- **Copy Code** - One-click code copying from any code block
- **Auto-scroll** - Smooth scrolling to latest messages
- **Message Persistence** - All conversations saved locally

### 📁 Conversation Management

- **Sidebar Navigation** - Quick access to all conversations
- **Search** - Filter conversations by title or content (Ctrl+K)
- **Rename** - Inline conversation renaming with Enter/Escape support
- **Export** - Download conversations as JSON
- **Delete** - Remove conversations with confirmation
- **Auto-titles** - Automatic title generation from first message
- **Timestamps** - Message count and last updated time for each conversation

### 🔌 Model Context Protocol (MCP)

Orion has complete MCP integration, enabling AI models to use external tools and services:

- **Server Management**:
  - Add/remove/start/stop MCP servers
  - Configure command, arguments, and environment variables
  - Auto-start option for servers
  - Visual status indicators (running, stopped, starting, error)

- **Tool Discovery & Execution**:
  - Automatic tool listing from running MCP servers
  - OpenAI-compatible tool format conversion
  - Seamless tool calling during conversations
  - Full JSON-RPC 2.0 protocol implementation

- **Smithery.ai Integration**:
  - Browse 100+ MCP servers from Smithery marketplace
  - Search and filter by name, runtime, or description
  - One-click installation with automatic configuration
  - Featured servers section
  - Visual indicators for servers requiring additional setup

### ⌨️ Keyboard Shortcuts

- `Ctrl+N` - New conversation
- `Ctrl+K` - Search conversations
- `Ctrl+,` - Open settings
- `Ctrl+/` - Show keyboard shortcuts
- `Enter` - Send message
- `Shift+Enter` - New line in message
- `Ctrl+Enter` - Send message (alternative)
- `Escape` - Close dialogs

### 🎨 User Interface

- **Modern Design** - Dark theme (#0f0f0f) with purple accents (#6D28D9)
- **Smooth Animations** - Polished transitions and loading states
- **Toast Notifications** - Non-intrusive success and error messages
- **Custom Scrollbars** - Themed scrollbars matching the UI
- **Responsive Layout** - Flexible sizing and responsive design
- **Accessibility** - Focus indicators and keyboard navigation

---

## Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **Rust** (latest stable)
- **System Dependencies** (for Tauri):
  - **Linux**: `webkit2gtk`, `libssl-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`
  - **macOS**: Xcode Command Line Tools
  - **Windows**: Microsoft C++ Build Tools

### Install Dependencies

```bash
npm install
```

### Get an OpenRouter API Key

1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Navigate to Keys section
3. Create a new API key
4. Copy the key (you'll paste it in Orion's settings)

### Run in Development Mode

```bash
npm run tauri dev
```

This starts both the Vite dev server and the Tauri application.

### Build for Production

```bash
npm run tauri build
```

The built application will be in `src-tauri/target/release/bundle/`.

---

## Development

### Architecture

**Frontend** (TypeScript + React 19):
- **Entry Point**: `src/main.tsx` → `src/App.tsx`
- **State Management**: Zustand with localStorage persistence
- **Styling**: Tailwind CSS with custom theme
- **UI Components**: Shadcn/ui component library
- **Markdown**: react-markdown with syntax highlighting

**Backend** (Rust + Tauri v2):
- **Entry Point**: `src-tauri/src/main.rs` → `src-tauri/src/lib.rs`
- **Commands**: Tauri command handlers for frontend-backend communication
- **MCP Module**: Full MCP protocol implementation with stdio transport
- **Async Runtime**: Tokio for async I/O

### Project Structure

```
orion/
├── src/                          # Frontend (React + TypeScript)
│   ├── components/
│   │   ├── chat/                 # Chat UI components
│   │   ├── layout/               # App layout (sidebar, header)
│   │   ├── markdown/             # Markdown rendering
│   │   ├── mcp/                  # MCP server management UI
│   │   ├── settings/             # Settings dialogs
│   │   └── ui/                   # Reusable UI components (shadcn)
│   ├── hooks/                    # Custom React hooks
│   ├── services/                 # API clients (OpenRouter, Smithery)
│   ├── stores/                   # Zustand state management
│   ├── types/                    # TypeScript type definitions
│   └── main.tsx                  # Frontend entry point
│
├── src-tauri/                    # Backend (Rust + Tauri)
│   ├── src/
│   │   ├── commands/             # Tauri command handlers
│   │   │   ├── mcp.rs            # MCP server lifecycle commands
│   │   │   └── storage.rs        # Conversation persistence
│   │   ├── mcp/                  # MCP implementation
│   │   │   ├── protocol.rs       # JSON-RPC 2.0 + MCP types
│   │   │   ├── server.rs         # McpServer and manager
│   │   │   └── transport.rs      # Stdio communication
│   │   ├── lib.rs                # Tauri app builder
│   │   └── main.rs               # Backend entry point
│   └── Cargo.toml                # Rust dependencies
│
├── CLAUDE.md                     # Development documentation
├── README.md                     # This file
└── package.json                  # Node.js dependencies
```

### Adding a New Tauri Command

1. **Define the command** in `src-tauri/src/commands/`:
```rust
#[tauri::command]
pub async fn my_command(arg: String) -> Result<String, String> {
    Ok(format!("Hello, {}", arg))
}
```

2. **Export from module** in `src-tauri/src/commands/mod.rs`:
```rust
pub use my_command::my_command;
```

3. **Register in builder** in `src-tauri/src/lib.rs`:
```rust
.invoke_handler(tauri::generate_handler![
    my_command,
    // ... other commands
])
```

4. **Call from frontend**:
```typescript
import { invoke } from "@tauri-apps/api/core";
const result = await invoke<string>("my_command", { arg: "World" });
```

### Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Backend**: Rust, Tauri v2, Tokio
- **UI Library**: Shadcn/ui (Radix UI primitives)
- **State Management**: Zustand
- **Markdown**: react-markdown, remark-gfm
- **Syntax Highlighting**: highlight.js
- **AI API**: OpenRouter
- **MCP**: Custom JSON-RPC 2.0 implementation

---

## MCP Integration

Orion implements the [Model Context Protocol](https://modelcontextprotocol.io/), enabling AI models to interact with external tools and data sources.

### What is MCP?

The Model Context Protocol is an open standard that allows AI applications to connect to various data sources and tools through a unified interface. MCP servers can provide:

- **Tools** - Functions the AI can call (e.g., search, file operations, API calls)
- **Resources** - Data the AI can access (e.g., files, databases)
- **Prompts** - Pre-built prompt templates

### Using MCP Servers

1. **Open Settings** (Ctrl+,)
2. **Navigate to MCP Servers tab**
3. **Add a server**:
   - Click "Browse Smithery" to explore 100+ pre-built servers
   - Or click "Add Server" to manually configure one
4. **Configure the server**:
   - Command: `node`, `python`, `docker run`, etc.
   - Arguments: Path to server script or package
   - Environment variables: API keys, config values
5. **Start the server** and watch tools appear in your conversations

### Popular MCP Servers

- **@modelcontextprotocol/server-filesystem** - File system access
- **@modelcontextprotocol/server-github** - GitHub repository integration
- **@modelcontextprotocol/server-brave-search** - Web search
- **@modelcontextprotocol/server-postgres** - PostgreSQL database access
- **@modelcontextprotocol/server-slack** - Slack messaging
- Browse more at [smithery.ai](https://smithery.ai)

### How It Works

1. **Server Lifecycle**: Orion's Rust backend manages MCP server processes via stdio
2. **Tool Discovery**: When a server starts, Orion queries available tools via JSON-RPC
3. **Tool Calling**: During conversations, AI models receive tool schemas in OpenAI format
4. **Execution**: When the AI calls a tool, Orion forwards the request to the MCP server
5. **Results**: Tool results are sent back to the AI to continue the conversation

### MCP Architecture

```
┌─────────────────┐
│   AI Model      │ (Claude, GPT-4, etc.)
│   (OpenRouter)  │
└────────┬────────┘
         │ Tool calls (OpenAI format)
         │
┌────────▼────────┐
│  Orion Frontend │
│   (React + TS)  │
└────────┬────────┘
         │ Tauri invoke
         │
┌────────▼────────┐
│  Orion Backend  │
│   (Rust MCP)    │ ◄──┐ JSON-RPC 2.0
└────────┬────────┘    │ (stdio)
         │             │
         │  Manages    │
         │             │
    ┌────▼─────┬───────▼──┬─────────┐
    │ MCP      │ MCP      │ MCP     │
    │ Server 1 │ Server 2 │ Server 3│
    └──────────┴──────────┴─────────┘
```

---

## Configuration

### Settings

All settings are accessible via the Settings dialog (Ctrl+,):

1. **API Keys**:
   - OpenRouter API Key (required for AI chat)

2. **Model Selection**:
   - Choose your preferred AI model
   - Search and filter from 100+ models

3. **MCP Servers**:
   - Manage MCP server configurations
   - Start/stop servers
   - Browse Smithery marketplace

### Data Storage

- **Conversations**: Stored in browser localStorage (frontend) and Tauri storage (backend)
- **Settings**: Persisted in localStorage
- **MCP Server Configs**: Saved in localStorage with auto-start preferences

All data is stored locally on your machine. Orion never sends your conversations or settings to any third-party service (except when making API calls to your chosen AI provider via OpenRouter).

---

## Troubleshooting

### MCP Tools Not Working

If AI models claim they cannot use MCP tools:

1. **Verify server is running** - Check status in Settings → MCP Servers
2. **Check tool schemas** - Orion converts MCP tools to OpenAI format automatically
3. **Review console logs** - Open DevTools (Ctrl+Shift+I) for error messages
4. **Restart the server** - Stop and start the MCP server

### Build Errors

- **Linux**: Install system dependencies:
  ```bash
  # Debian/Ubuntu
  sudo apt install libwebkit2gtk-4.1-dev libssl-dev libgtk-3-dev \
    libayatana-appindicator3-dev librsvg2-dev

  # Fedora
  sudo dnf install webkit2gtk4.1-devel openssl-devel gtk3-devel \
    libappindicator-gtk3-devel librsvg2-devel
  ```

- **Windows**: Install [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)

- **macOS**: Install Xcode Command Line Tools:
  ```bash
  xcode-select --install
  ```

### API Key Issues

- Ensure your OpenRouter API key is valid and has credits
- Check the API key in Settings (Ctrl+,)
- Verify network connectivity to openrouter.ai

---

## Roadmap

- [ ] **Multi-modal support** - Image uploads and vision models
- [ ] **Custom themes** - User-customizable color schemes
- [ ] **Plugin system** - Extend functionality with custom plugins
- [ ] **Voice input** - Speech-to-text for message input
- [ ] **Collaboration** - Share conversations with team members
- [ ] **Advanced MCP features** - Resources and prompts support
- [ ] **Multiple API providers** - Direct Anthropic, OpenAI, Google APIs
- [ ] **Local model support** - Ollama integration for offline AI

---

## Contributing

Contributions are welcome! This project is in active development.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly (`npm run tauri dev`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- **TypeScript**: Follow the existing patterns, use strict types
- **Rust**: Follow Rust conventions, run `cargo fmt` and `cargo clippy`
- **Commits**: Use descriptive commit messages

---

## License

This project is open source and available under the MIT License.

---

## Acknowledgments

- **Tauri** - For the amazing desktop app framework
- **OpenRouter** - For unified AI model access
- **Model Context Protocol** - For the extensibility standard
- **Smithery.ai** - For the MCP server marketplace
- **Shadcn/ui** - For beautiful, accessible UI components

---

<div align="center">

**Built with ❤️ by the Orion team**

[Report Bug](https://github.com/yourusername/orion/issues) • [Request Feature](https://github.com/yourusername/orion/issues)

</div>
