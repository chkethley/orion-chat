# orion-chat

A fast, local-first AI chat desktop app built with **Tauri + React + Vite + TypeScript**, using **OpenRouter** for model inference and optional **MCP (Model Context Protocol)** support for tool-augmented workflows.

## Features

- **Desktop-native** via Tauri (small footprint, fast startup)
- **Modern frontend**: React + Vite + TypeScript
- **OpenRouter inference**: bring your own key, pick from many models
- **Streaming responses** (if enabled by the selected OpenRouter model/provider)
- **MCP support**: connect to MCP servers to add tools/contexts (filesystem, repos, docs, etc.)
- **Multi-chat sessions** (basic conversation management)
- **Local storage** for chats and settings (no account required)

## Tech Stack

- **Tauri** (Rust backend + secure IPC)
- **React** UI
- **Vite** build tooling
- **TypeScript**
- **OpenRouter** API for LLM inference
- **MCP** for tool invocation + external context

## Screenshots

> Add screenshots/gifs in `./assets/` and link them here.

---

## Getting Started

### Prerequisites

- **Node.js** (LTS recommended)
- **Rust toolchain** (stable)
- **Tauri prerequisites** for your OS  
  - macOS: Xcode Command Line Tools  
  - Windows: MSVC build tools  
  - Linux: system deps for WebKit2GTK and build tooling

### Install

```bash
git clone https://github.com/chkethley/orion-chat.git
cd orion-chat
npm install
npm run tauri dev