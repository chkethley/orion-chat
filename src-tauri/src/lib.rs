mod commands;
mod mcp;

use commands::storage::StorageState;
use mcp::McpServerManager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .manage(StorageState::default())
        .manage(McpServerManager::default())
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::save_conversations,
            commands::load_conversations,
            commands::save_settings,
            commands::load_settings,
            commands::clear_all_data,
            commands::start_mcp_server,
            commands::stop_mcp_server,
            commands::list_mcp_servers,
            commands::list_mcp_tools,
            commands::call_mcp_tool,
            commands::get_mcp_server_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
