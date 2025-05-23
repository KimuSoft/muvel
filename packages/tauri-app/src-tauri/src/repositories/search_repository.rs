use std::path::Path;
use tauri::AppHandle;
// Path를 사용하기 위해 추가

// Novel 관련 모델
use crate::models::search_results::{
    NovelSearchEpisodeBlockItem, NovelSearchEpisodeItem, NovelSearchItemType, NovelSearchResult,
    NovelSearchWikiBlockItem, NovelSearchWikiPageItem,
};
use crate::storage::{episode_io, index_manager, novel_io, wiki_page_io};
// 스토리지 접근
use crate::utils::text_search_utils;
// 텍스트 검색 유틸리티

pub struct SearchRepository<'a> {
    app_handle: &'a AppHandle,
    // NovelRepository를 직접 주입받는 대신, 필요한 정보(예: novel_root_path)는
    // novel_id를 통해 index_manager에서 가져옵니다.
}

impl<'a> SearchRepository<'a> {
    pub fn new(app_handle: &'a AppHandle) -> Self {
        Self { app_handle }
    }

    /// 특정 소설 내의 전체 콘텐츠에서 검색어와 일치하는 항목을 찾습니다.
    /// 내용이 없는 블록 (text.trim().is_empty())은 검색 대상에서 제외합니다.
    pub fn search_novel_content(
        &self,
        novel_id: &str,
        query: &str,
    ) -> Result<Vec<NovelSearchResult>, String> {
        let mut results: Vec<NovelSearchResult> = Vec::new();

        // 1. novel_id로부터 novel_root_path 가져오기
        let novel_entry = index_manager::get_novel_entry(self.app_handle, novel_id)?
            .ok_or_else(|| format!("인덱스에서 소설 ID {} 를 찾을 수 없습니다.", novel_id))?;
        let novel_root_path = Path::new(novel_entry.path.as_ref().ok_or("소설 경로 없음")?);

        // 2. 소설 메타데이터 로드
        let (novel_data, _) = novel_io::read_novel_metadata_with_path(novel_root_path)?;

        let search_fn = text_search_utils::contains_ignore_case_whitespace;
        let snippet_fn = text_search_utils::create_snippet;
        const SNIPPET_MAX_LEN: usize = 150;
        const SNIPPET_CONTEXT_LEN: usize = 30;

        // 3. 소설 메타데이터 자체 검색 (필요시 NovelSearchResult에 타입 추가 후 구현)
        // 예: 제목 검색
        // if search_fn(&novel_data.title, query) {
        //     results.push(NovelSearchResult::NovelMeta(NovelSearchNovelMetaItem { ... }));
        // }
        // 예: 설명 검색
        // if let Some(desc) = &novel_data.description {
        //     if search_fn(desc, query) {
        //         results.push(NovelSearchResult::NovelMeta(NovelSearchNovelMetaItem { ... }));
        //     }
        // }

        // 4. 에피소드 검색
        let episode_summaries = episode_io::list_episode_summaries_from_files(novel_root_path)?;
        for summary in &episode_summaries {
            match episode_io::read_episode_content(novel_root_path, &summary.id) {
                Ok(episode_data) => {
                    let mut episode_level_match_found = false;
                    if search_fn(&episode_data.title, query) {
                        episode_level_match_found = true;
                    }
                    if search_fn(&episode_data.description, query) {
                        episode_level_match_found = true;
                    }
                    if let Some(ac) = &episode_data.author_comment {
                        if search_fn(ac, query) {
                            episode_level_match_found = true;
                        }
                    }

                    if episode_level_match_found {
                        results.push(NovelSearchResult::Episode(NovelSearchEpisodeItem {
                            id: episode_data.id.clone(),
                            novel_id: novel_data.id.clone(),
                            item_type: NovelSearchItemType::Episode,
                            title: episode_data.title.clone(),
                            description: Some(episode_data.description.clone()),
                            content_length: episode_data.content_length,
                            ai_rating: episode_data.ai_rating,
                            order: episode_data.order,
                            episode_type: episode_data.episode_type.clone(),
                        }));
                    }

                    // 에피소드 블록 검색
                    for block in &episode_data.blocks {
                        if !block.text.trim().is_empty() && search_fn(&block.text, query) {
                            results.push(NovelSearchResult::EpisodeBlock(
                                NovelSearchEpisodeBlockItem {
                                    id: block.id.clone(),
                                    novel_id: novel_data.id.clone(),
                                    item_type: NovelSearchItemType::EpisodeBlock,
                                    content: snippet_fn(
                                        &block.text,
                                        query,
                                        SNIPPET_MAX_LEN,
                                        SNIPPET_CONTEXT_LEN,
                                    ),
                                    block_type: block.block_type.clone(),
                                    order: block.order,
                                    episode_id: episode_data.id.clone(),
                                    episode_name: episode_data.title.clone(),
                                    episode_number: episode_data.order,
                                },
                            ));
                        }
                    }
                }
                Err(e) => eprintln!("에피소드 {} 내용 읽기 실패 (검색 중): {}", summary.id, e),
            }
        }

        // 5. 위키 페이지 검색
        let wiki_page_summaries =
            wiki_page_io::list_wiki_page_summaries_from_files(novel_root_path)?;
        for summary in &wiki_page_summaries {
            match wiki_page_io::read_wiki_page_content(novel_root_path, &summary.id) {
                Ok(wiki_page_data) => {
                    let mut wiki_page_level_match_found = false;
                    if search_fn(&wiki_page_data.title, query) {
                        wiki_page_level_match_found = true;
                    }
                    if let Some(s) = &wiki_page_data.summary {
                        if search_fn(s, query) {
                            wiki_page_level_match_found = true;
                        }
                    }
                    if wiki_page_data.tags.iter().any(|tag| search_fn(tag, query)) {
                        wiki_page_level_match_found = true;
                    }
                    if wiki_page_data
                        .attributes
                        .values()
                        .any(|val| search_fn(val, query))
                    {
                        wiki_page_level_match_found = true;
                    }

                    if wiki_page_level_match_found {
                        results.push(NovelSearchResult::WikiPage(NovelSearchWikiPageItem {
                            id: wiki_page_data.id.clone(),
                            novel_id: novel_data.id.clone(),
                            item_type: NovelSearchItemType::WikiPage,
                            title: wiki_page_data.title.clone(),
                            summary: wiki_page_data.summary.clone(),
                            category: wiki_page_data.category.clone(),
                            tags: wiki_page_data.tags.clone(),
                            thumbnail: wiki_page_data.thumbnail.clone(),
                        }));
                    }

                    // 위키 블록 검색
                    for block in &wiki_page_data.blocks {
                        if !block.text.trim().is_empty() && search_fn(&block.text, query) {
                            results.push(NovelSearchResult::WikiBlock(NovelSearchWikiBlockItem {
                                id: block.id.clone(),
                                novel_id: novel_data.id.clone(),
                                item_type: NovelSearchItemType::WikiBlock,
                                content: snippet_fn(
                                    &block.text,
                                    query,
                                    SNIPPET_MAX_LEN,
                                    SNIPPET_CONTEXT_LEN,
                                ),
                                block_type: block.block_type.clone(),
                                order: block.order,
                                wiki_page_id: wiki_page_data.id.clone(),
                                wiki_page_name: wiki_page_data.title.clone(),
                            }));
                        }
                    }
                }
                Err(e) => {
                    eprintln!("위키 페이지 {} 내용 읽기 실패 (검색 중): {}", summary.id, e)
                }
            }
        }
        Ok(results)
    }
}
