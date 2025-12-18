use anyhow::{anyhow, Result};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

use super::protocol::{
    CallToolParams, CallToolResult, ClientCapabilities, ClientInfo, InitializeParams,
    InitializeResult, ListToolsResult, McpServerConfig, McpTool,
};
use super::transport::StdioTransport;

/// MCP server instance
pub struct McpServer {
    pub config: McpServerConfig,
    transport: Arc<Mutex<StdioTransport>>,
    next_request_id: Arc<Mutex<u64>>,
    pub server_info: Option<InitializeResult>,
}

impl McpServer {
    /// Create and initialize a new MCP server
    pub async fn spawn(config: McpServerConfig) -> Result<Self> {
        let transport = StdioTransport::spawn(
            &config.command,
            &config.args,
            config.env.as_ref(),
        )
        .await?;

        let mut server = Self {
            config,
            transport: Arc::new(Mutex::new(transport)),
            next_request_id: Arc::new(Mutex::new(1)),
            server_info: None,
        };

        // Initialize the server
        server.initialize().await?;

        Ok(server)
    }

    /// Get next request ID
    async fn next_id(&self) -> u64 {
        let mut id = self.next_request_id.lock().await;
        let current = *id;
        *id += 1;
        current
    }

    /// Initialize the MCP server
    async fn initialize(&mut self) -> Result<()> {
        let params = InitializeParams {
            protocol_version: "2024-11-05".to_string(),
            capabilities: ClientCapabilities {
                experimental: None,
                sampling: None,
            },
            client_info: ClientInfo {
                name: "Orion".to_string(),
                version: "0.1.0".to_string(),
            },
        };

        let id = self.next_id().await;
        let response = self
            .transport
            .lock()
            .await
            .call(
                "initialize",
                Some(serde_json::to_value(params)?),
                json!(id),
                30000, // 30 second timeout for initialization
            )
            .await?;

        if let Some(error) = response.error {
            return Err(anyhow!(
                "Initialization failed: {} (code: {})",
                error.message,
                error.code
            ));
        }

        let result: InitializeResult = serde_json::from_value(
            response.result.ok_or_else(|| anyhow!("No result in initialize response"))?,
        )?;

        self.server_info = Some(result);

        // Send initialized notification
        let notification = super::protocol::JsonRpcRequest {
            jsonrpc: "2.0".to_string(),
            method: "notifications/initialized".to_string(),
            params: None,
            id: json!(null),
        };

        self.transport.lock().await.send_request(&notification).await?;

        Ok(())
    }

    /// List available tools
    pub async fn list_tools(&self) -> Result<Vec<McpTool>> {
        let id = self.next_id().await;
        let response = self
            .transport
            .lock()
            .await
            .call(
                "tools/list",
                None,
                json!(id),
                10000, // 10 second timeout
            )
            .await?;

        if let Some(error) = response.error {
            return Err(anyhow!(
                "List tools failed: {} (code: {})",
                error.message,
                error.code
            ));
        }

        let result: ListToolsResult = serde_json::from_value(
            response.result.ok_or_else(|| anyhow!("No result in tools/list response"))?,
        )?;

        Ok(result.tools)
    }

    /// Call a tool
    pub async fn call_tool(&self, tool_name: &str, arguments: Option<Value>) -> Result<CallToolResult> {
        let params = CallToolParams {
            name: tool_name.to_string(),
            arguments,
        };

        let id = self.next_id().await;
        let response = self
            .transport
            .lock()
            .await
            .call(
                "tools/call",
                Some(serde_json::to_value(params)?),
                json!(id),
                60000, // 60 second timeout for tool calls
            )
            .await?;

        if let Some(error) = response.error {
            return Err(anyhow!(
                "Tool call failed: {} (code: {})",
                error.message,
                error.code
            ));
        }

        let result: CallToolResult = serde_json::from_value(
            response.result.ok_or_else(|| anyhow!("No result in tools/call response"))?,
        )?;

        Ok(result)
    }
}

/// Manager for multiple MCP servers
pub struct McpServerManager {
    servers: Arc<Mutex<HashMap<String, Arc<McpServer>>>>,
}

impl McpServerManager {
    pub fn new() -> Self {
        Self {
            servers: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Start a new MCP server
    pub async fn start_server(&self, config: McpServerConfig) -> Result<String> {
        let server_id = config.id.clone();

        // Check if server already exists
        {
            let servers = self.servers.lock().await;
            if servers.contains_key(&server_id) {
                return Err(anyhow!("Server with ID '{}' already running", server_id));
            }
        }

        // Spawn and initialize the server
        let server = McpServer::spawn(config).await?;
        let server_arc = Arc::new(server);

        // Store the server
        self.servers.lock().await.insert(server_id.clone(), server_arc);

        Ok(server_id)
    }

    /// Stop an MCP server
    pub async fn stop_server(&self, server_id: &str) -> Result<()> {
        let mut servers = self.servers.lock().await;
        if servers.remove(server_id).is_some() {
            Ok(())
        } else {
            Err(anyhow!("Server '{}' not found", server_id))
        }
    }

    /// Get a server by ID
    pub async fn get_server(&self, server_id: &str) -> Result<Arc<McpServer>> {
        let servers = self.servers.lock().await;
        servers
            .get(server_id)
            .cloned()
            .ok_or_else(|| anyhow!("Server '{}' not found", server_id))
    }

    /// List all running servers
    pub async fn list_servers(&self) -> Vec<String> {
        let servers = self.servers.lock().await;
        servers.keys().cloned().collect()
    }

    /// List tools from a specific server
    pub async fn list_tools(&self, server_id: &str) -> Result<Vec<McpTool>> {
        let server = self.get_server(server_id).await?;
        server.list_tools().await
    }

    /// Call a tool on a specific server
    pub async fn call_tool(
        &self,
        server_id: &str,
        tool_name: &str,
        arguments: Option<Value>,
    ) -> Result<CallToolResult> {
        let server = self.get_server(server_id).await?;
        server.call_tool(tool_name, arguments).await
    }
}

impl Default for McpServerManager {
    fn default() -> Self {
        Self::new()
    }
}
