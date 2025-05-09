use tauri_plugin_deep_link::DeepLinkExt;

mod storage;
mod models;
mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            app.deep_link().on_open_url(|event| {
                println!("딥링크 URL 수신: {:?}", event.urls());
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // 보안 관련 명령어
            commands::auth_commands::wait_for_token,

            // 글꼴 관련 명령어
            commands::font_commands::get_system_font_families,
            commands::font_commands::get_fonts_by_family,

            // 소설 인덱싱 관련 명령어
            commands::index_commands::get_all_local_novel_entries_command,
            commands::index_commands::get_local_novel_entry_command,
            commands::index_commands::register_novel_from_path_command,
            commands::index_commands::remove_novel_project_command,

            // 소설 관련 명령어
            commands::novel_commands::create_local_novel_command,
            commands::novel_commands::get_local_novel_details_command,
            commands::novel_commands::update_local_novel_metadata_command,
            commands::novel_commands::generate_uuid_command,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
