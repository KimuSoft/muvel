use crate::file_handler::take_initial_open;
use crate::models::PendingOpen;
use commands::*;
use file_handler::handle_opened_file;
use tauri::{Emitter, Manager};
use tauri_plugin_deep_link::DeepLinkExt;
use tauri_plugin_dialog::DialogExt;

#[cfg(not(any(target_os = "android", target_os = "ios")))]
use tauri_plugin_cli::CliExt;

#[cfg(not(any(target_os = "android", target_os = "ios")))]
use tauri_plugin_updater::UpdaterExt;

mod commands;
mod file_handler;
mod models;
mod storage;

#[cfg(not(any(target_os = "android", target_os = "ios")))]
mod update;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        // 플러그인 로드
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init());

    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        builder = builder
            .plugin(tauri_plugin_updater::Builder::new().build())
            .plugin(tauri_plugin_cli::init());
    }

    builder
        .manage(PendingOpen::default())
        .setup(|app| {
            #[cfg(not(any(target_os = "android", target_os = "ios")))]
            {
                // Auto Update
                // let handle = app.handle().clone();
                // tauri::async_runtime::spawn(async move {
                //     update::update(handle).await.unwrap();
                // });

                // Open With
                let matches = app.cli().matches()?;
                let pending_state = app.state::<models::PendingOpen>();
                if let Some(paths) = matches.args.get("file").and_then(|a| a.value.as_array()) {
                    for p in paths {
                        if let Some(path_str) = p.as_str() {
                            let path = std::path::PathBuf::from(path_str);
                            if let Err(e) = file_handler::handle_opened_file(
                                &app.handle(),
                                &pending_state,
                                &path,
                            ) {
                                eprintln!("파일 처리 실패: {e}");
                            }
                        } else {
                            eprintln!("CLI 인자 형식 오류(문자열 아님): {p:?}");
                        }
                    }
                }
            }

            // Debug
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Deeplink 설정
            app.deep_link().on_open_url(|event| {
                println!("딥링크 URL 수신: {:?}", event.urls());
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // 보안 관련 명령어
            wait_for_token,
            // 글꼴 관련 명령어
            get_system_font_families,
            get_fonts_by_family,
            // 소설 인덱싱 관련 명령어
            get_all_local_novel_entries_command,
            get_local_novel_entry_command,
            register_novel_from_path_command,
            remove_novel_project_command,
            // 소설 관련 명령어
            create_local_novel_command,
            get_local_novel_details_command,
            update_local_novel_metadata_command,
            generate_uuid_command,
            update_local_novel_episodes_metadata_command,
            open_novel_project_folder_command,
            // 에피소드 관련 명령어
            create_local_episode_command,
            get_local_episode_data_command,
            update_local_episode_blocks_command,
            update_local_episode_metadata_command,
            delete_local_episode_command,
            list_local_episode_summaries_command,
            sync_local_delta_blocks_command,
            // 이미지 리소스 관련 명령어
            save_image_to_novel_resources_command,
            // 파일 열기 관련 명령어
            take_initial_open,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
