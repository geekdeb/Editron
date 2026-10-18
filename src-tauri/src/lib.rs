// ============================================================
// Editron — Rust Backend (Tauri Commands)
// ============================================================

use tauri::Manager;

/// Read a file from the filesystem
#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    tokio::fs::read_to_string(&path)
        .await
        .map_err(|e| format!("Failed to read file: {}", e))
}

/// Write content to a file
#[tauri::command]
async fn write_file(path: String, content: String) -> Result<(), String> {
    if let Some(parent) = std::path::Path::new(&path).parent() {
        if !parent.as_os_str().is_empty() && !parent.exists() {
            let _ = tokio::fs::create_dir_all(parent).await;
        }
    }
    tokio::fs::write(&path, content)
        .await
        .map_err(|e| format!("Failed to write file: {}", e))
}

/// Get application data directory path
#[tauri::command]
fn get_app_data_dir(app: tauri::AppHandle) -> String {
    app.path()
        .app_data_dir()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string()
}

/// Get default save folder path ("datafiles" folder inside Editron)
#[tauri::command]
fn get_default_save_folder(app: tauri::AppHandle) -> Result<String, String> {
    let base = app.path()
        .document_dir()
        .or_else(|_| app.path().home_dir())
        .map_err(|e| format!("Could not locate document or home directory: {}", e))?;

    let folder = base.join("Editron").join("datafiles");
    if !folder.exists() {
        let _ = std::fs::create_dir_all(&folder);
    }
    Ok(folder.to_string_lossy().to_string())
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub children: Option<Vec<FileEntry>>,
}

fn scan_dir_recursive(path: &std::path::Path, max_depth: usize) -> Vec<FileEntry> {
    if max_depth == 0 {
        return Vec::new();
    }
    let mut entries = Vec::new();
    if let Ok(read_dir) = std::fs::read_dir(path) {
        for entry in read_dir.flatten() {
            let file_name = entry.file_name().to_string_lossy().to_string();
            if file_name.starts_with('.') || file_name == "node_modules" || file_name == "__pycache__" || file_name == "target" {
                continue;
            }
            let child_path = entry.path();
            let is_dir = child_path.is_dir();
            let children = if is_dir {
                Some(scan_dir_recursive(&child_path, max_depth - 1))
            } else {
                None
            };
            entries.push(FileEntry {
                name: file_name,
                path: child_path.to_string_lossy().to_string(),
                is_dir,
                children,
            });
        }
    }
    entries.sort_by(|a, b| {
        if a.is_dir != b.is_dir {
            if a.is_dir { std::cmp::Ordering::Less } else { std::cmp::Ordering::Greater }
        } else {
            a.name.to_lowercase().cmp(&b.name.to_lowercase())
        }
    });
    entries
}

/// Read directory tree recursively
#[tauri::command]
fn read_directory(path: String) -> Result<Vec<FileEntry>, String> {
    let p = std::path::Path::new(&path);
    if !p.exists() || !p.is_dir() {
        return Err(format!("Directory does not exist: {}", path));
    }
    Ok(scan_dir_recursive(p, 5))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            get_app_data_dir,
            get_default_save_folder,
            read_directory,
        ])
        .run(tauri::generate_context!())
        .expect("error while running editron");
}
