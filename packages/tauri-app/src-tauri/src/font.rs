#[cfg(not(any(target_os = "android", target_os = "ios")))]
#[tauri::command]
pub fn get_system_font_families() -> Vec<String> {
    let mut font_families = Vec::new();
    let source = font_kit::source::SystemSource::new();

    if let Ok(families) = source.all_families() {
        for family in families {
            font_families.push(family);
        }
    }

    font_families.sort();
    font_families.dedup();
    font_families
}

#[cfg(not(any(target_os = "android", target_os = "ios")))]
#[tauri::command]
pub fn get_fonts_by_family(family: &str) -> Vec<String> {
    let mut font_names = Vec::new();
    let source = font_kit::source::SystemSource::new();

    if let Ok(fonts) = source.select_family_by_name(family) {
        for handle in fonts.fonts() {
            if let Ok(font) = handle.load() {
                if let Some(name) = font.postscript_name() {
                    font_names.push(name);
                }
            }
        }
    }

    font_names.sort();
    font_names.dedup();
    font_names
}

#[cfg(any(target_os = "android", target_os = "ios"))]
#[tauri::command]
pub fn get_system_font_families() -> Vec<String> {
    Vec::new()
}

#[cfg(any(target_os = "android", target_os = "ios"))]
#[tauri::command]
pub fn get_fonts_by_family() -> Vec<String> {
    Vec::new()
}