use anyhow::{anyhow, Result};
use serde_json::Value;
use std::process::Stdio;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::process::{Child, ChildStdin, Command};
use tokio::sync::mpsc;

use super::protocol::{JsonRpcRequest, JsonRpcResponse};

/// Async transport for JSON-RPC over stdio
pub struct StdioTransport {
    stdin: ChildStdin,
    stdout_receiver: mpsc::Receiver<String>,
    _child: Child,
}

impl StdioTransport {
    /// Create a new stdio transport by spawning a command
    pub async fn spawn(command: &str, args: &[String], env: Option<&std::collections::HashMap<String, String>>) -> Result<Self> {
        let mut cmd = Command::new(command);
        cmd.args(args)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .kill_on_drop(true);

        // Add environment variables if provided
        if let Some(env_vars) = env {
            for (key, value) in env_vars {
                cmd.env(key, value);
            }
        }

        let mut child = cmd.spawn().map_err(|e| anyhow!("Failed to spawn process: {}", e))?;

        let stdin = child.stdin.take().ok_or_else(|| anyhow!("Failed to get stdin"))?;
        let stdout = child.stdout.take().ok_or_else(|| anyhow!("Failed to get stdout"))?;

        // Spawn a task to read stdout line by line
        let (tx, rx) = mpsc::channel::<String>(100);
        tokio::spawn(async move {
            let reader = BufReader::new(stdout);
            let mut lines = reader.lines();
            while let Ok(Some(line)) = lines.next_line().await {
                if tx.send(line).await.is_err() {
                    break;
                }
            }
        });

        Ok(Self {
            stdin,
            stdout_receiver: rx,
            _child: child,
        })
    }

    /// Send a JSON-RPC request
    pub async fn send_request(&mut self, request: &JsonRpcRequest) -> Result<()> {
        let json = serde_json::to_string(request)?;
        self.stdin.write_all(json.as_bytes()).await?;
        self.stdin.write_all(b"\n").await?;
        self.stdin.flush().await?;
        Ok(())
    }

    /// Receive a JSON-RPC response (with timeout)
    pub async fn receive_response(&mut self, timeout_ms: u64) -> Result<JsonRpcResponse> {
        let timeout_duration = tokio::time::Duration::from_millis(timeout_ms);

        match tokio::time::timeout(timeout_duration, self.stdout_receiver.recv()).await {
            Ok(Some(line)) => {
                let response: JsonRpcResponse = serde_json::from_str(&line)
                    .map_err(|e| anyhow!("Failed to parse JSON-RPC response: {}", e))?;
                Ok(response)
            }
            Ok(None) => Err(anyhow!("Process stdout closed")),
            Err(_) => Err(anyhow!("Timeout waiting for response")),
        }
    }

    /// Send request and wait for response
    pub async fn call(&mut self, method: &str, params: Option<Value>, id: Value, timeout_ms: u64) -> Result<JsonRpcResponse> {
        let request = JsonRpcRequest::new(method, params, id);
        self.send_request(&request).await?;
        self.receive_response(timeout_ms).await
    }
}
