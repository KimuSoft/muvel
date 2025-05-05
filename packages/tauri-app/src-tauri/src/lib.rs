use tauri_plugin_deep_link::DeepLinkExt;

mod auth;
mod font;

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
            auth::wait_for_token,
            font::get_system_fonts,
            font::get_system_font_families,
            font::get_family_fonts
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
