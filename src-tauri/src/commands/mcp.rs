use serde_json::Value;
use tauri::State;

use crate::mcp::{CallToolResult, McpServerConfig, McpServerManager, McpTool, OpenAITool};

/// Start a new MCP server
#[tauri::command]
pub async fn start_mcp_server(
    state: State<'_, McpServerManager>,
    config: McpServerConfig,
) -> Result<String, String> {
    state
        .start_server(config)
        .await
        .map_err(|e| e.to_string())
}

/// Stop an MCP server
#[tauri::command]
pub async fn stop_mcp_server(
    state: State<'_, McpServerManager>,
    server_id: String,
) -> Result<(), String> {
    state
        .stop_server(&server_id)
        .await
        .map_err(|e| e.to_string())
}

/// List all running MCP servers
#[tauri::command]
pub async fn list_mcp_servers(state: State<'_, McpServerManager>) -> Result<Vec<String>, String> {
    Ok(state.list_servers().await)
}

/// List tools from a specific MCP server (returns OpenAI-compatible format)
#[tauri::command]
pub async fn list_mcp_tools(
    state: State<'_, McpServerManager>,
    server_id: String,
) -> Result<Vec<OpenAITool>, String> {
    let mcp_tools = state
        .list_tools(&server_id)
        .await
        .map_err(|e| e.to_string())?;

    // Convert MCP tools to OpenAI format
    Ok(mcp_tools.into_iter().map(|tool| tool.into()).collect())
}

/// Call a tool on a specific MCP server
#[tauri::command]
pub async fn call_mcp_tool(
    state: State<'_, McpServerManager>,
    server_id: String,
    tool_name: String,
    arguments: Option<Value>,
) -> Result<CallToolResult, String> {
    state
        .call_tool(&server_id, &tool_name, arguments)
        .await
        .map_err(|e| e.to_string())
}

/// Get server info for a specific MCP server
#[tauri::command]
pub async fn get_mcp_server_info(
    state: State<'_, McpServerManager>,
    server_id: String,
) -> Result<Option<crate::mcp::InitializeResult>, String> {
    let server = state
        .get_server(&server_id)
        .await
        .map_err(|e| e.to_string())?;
    Ok(server.server_info.clone())
}
