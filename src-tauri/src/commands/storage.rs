use serde::{Deserialize, Serialize};
use tauri::State;
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Conversation {
    pub id: String,
    pub title: String,
    pub messages: Vec<Message>,
    pub created_at: u64,
    pub updated_at: u64,
    pub model: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub id: String,
    pub role: String,
    pub content: String,
    pub timestamp: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    pub api_key: Option<String>,
    pub selected_model: String,
}

#[derive(Default)]
pub struct StorageState {
    pub conversations: Mutex<Vec<Conversation>>,
    pub settings: Mutex<Option<Settings>>,
}

#[tauri::command]
pub async fn save_conversations(
    state: State<'_, StorageState>,
    conversations: Vec<Conversation>,
) -> Result<(), String> {
    let mut storage = state.conversations.lock().map_err(|e| e.to_string())?;
    *storage = conversations;
    Ok(())
}

#[tauri::command]
pub async fn load_conversations(
    state: State<'_, StorageState>,
) -> Result<Vec<Conversation>, String> {
    let storage = state.conversations.lock().map_err(|e| e.to_string())?;
    Ok(storage.clone())
}

#[tauri::command]
pub async fn save_settings(
    state: State<'_, StorageState>,
    settings: Settings,
) -> Result<(), String> {
    let mut storage = state.settings.lock().map_err(|e| e.to_string())?;
    *storage = Some(settings);
    Ok(())
}

#[tauri::command]
pub async fn load_settings(
    state: State<'_, StorageState>,
) -> Result<Option<Settings>, String> {
    let storage = state.settings.lock().map_err(|e| e.to_string())?;
    Ok(storage.clone())
}

#[tauri::command]
pub async fn clear_all_data(state: State<'_, StorageState>) -> Result<(), String> {
    let mut conversations = state.conversations.lock().map_err(|e| e.to_string())?;
    let mut settings = state.settings.lock().map_err(|e| e.to_string())?;

    *conversations = Vec::new();
    *settings = None;

    Ok(())
}
