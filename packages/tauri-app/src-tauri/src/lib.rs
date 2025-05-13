use crate::handle_open_file::handle_opened_file;
use commands::*;
use tauri::Emitter;
use tauri_plugin_deep_link::DeepLinkExt;
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_updater::UpdaterExt;

mod commands;
mod handle_open_file;
mod models;
mod storage;
mod update;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // Auto Update
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                update::update(handle).await.unwrap();
            });

            // Open With
            let args: Vec<_> = std::env::args_os().collect();
            if args.len() > 1 {
                let file_path_osstr = &args[1];
                println!(
                    "애플리케이션이 다음 파일 인자와 함께 실행됨: {:?}",
                    file_path_osstr
                );

                if let Err(e) = handle_opened_file(app, file_path_osstr) {
                    eprintln!("열린 파일 처리 중 오류 발생 {:?}: {}", file_path_osstr, e);

                    let dialog_app_handle = app.handle().clone();
                    let error_message_for_dialog = e.clone();

                    dialog_app_handle
                        .dialog()
                        .message(error_message_for_dialog)
                        .title("파일 열기 오류")
                        .kind(tauri_plugin_dialog::MessageDialogKind::Error)
                        .show(|confirmed| {
                            println!(
                                "오류 다이얼로그가 닫혔습니다. 사용자가 확인했는지: {}",
                                confirmed
                            );
                        });
                }
            } else {
                println!("Application started without file arguments.");
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
            // 이미지 리소스 관련 명령어
            save_image_to_novel_resources_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
