/** Tauri Command Name
 * lib.rs에 적힌 것과 동일한 순서로 관리해 주세요
 */

// AUTH
export const CMD_AUTH_LOGIN = `wait_for_token`

// FONTS
export const CMD_GET_SYSTEM_FONT_FAMILIES = `get_system_font_families`
export const CMD_GET_FONTS_BY_FAMILY = `get_fonts_by_family`

// INDEX
export const CMD_GET_ALL_LOCAL_NOVEL_ENTRIES = `get_all_local_novel_entries_command`
export const CMD_GET_LOCAL_NOVEL_ENTRY = `get_local_novel_entry_command`
export const CMD_REGISTER_NOVEL_FROM_PATH = `register_novel_from_path_command`

// NOVEL
export const CMD_CREATE_LOCAL_NOVEL = `create_local_novel_command`
export const CMD_GET_LOCAL_NOVEL_DETAILS = `get_local_novel_details_command`
export const CMD_UPDATE_LOCAL_NOVEL_METADATA = `update_local_novel_metadata_command`
export const CMD_REMOVE_NOVEL_PROJECT = `remove_novel_project_command` // 인덱스 및 파일 모두 삭제
export const CMD_OPEN_NOVEL_PROJECT_FOLDER = `open_novel_project_folder_command`
export const CMD_SAVE_NOVEL_IMAGE = `save_novel_image_command`
export const CMD_UPDATE_LOCAL_NOVEL_EPISODES_METADATA = `update_local_novel_episodes_metadata_command`

// EPISODE
export const CMD_CREATE_LOCAL_EPISODE = `create_local_episode_command`
export const CMD_GET_LOCAL_EPISODE_DATA = `get_local_episode_data_command`
export const CMD_UPDATE_LOCAL_EPISODE_METADATA = `update_local_episode_metadata_command`
export const CMD_DELETE_LOCAL_EPISODE = `delete_local_episode_command`
export const CMD_LIST_LOCAL_EPISODE_SUMMARIES = `list_local_episode_summaries_command`
export const CMD_SYNC_LOCAL_DELTA_BLOCKS = `sync_local_delta_blocks_command`

// WIKI
export const CMD_CREATE_LOCAL_WIKI_PAGE_CMD = "create_wiki_page_command"
export const CMD_GET_LOCAL_WIKI_PAGE_CMD = "get_wiki_page_command"
export const CMD_UPDATE_LOCAL_WIKI_PAGE_CMD = "update_wiki_page_command"
export const CMD_DELETE_LOCAL_WIKI_PAGE_CMD = "delete_wiki_page_command"
export const CMD_LIST_WIKI_PAGE_SUMMARIES_CMD =
  "list_wiki_page_summaries_command"
export const CMD_SYNC_LOCAL_WIKI_PAGE_BLOCKS_CMD = "sync_local_wiki_page_blocks"

// OPEN FILE
export const CMD_TAKE_INITIAL_OPEN = `take_initial_open`
