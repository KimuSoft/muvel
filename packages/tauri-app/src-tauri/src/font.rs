use font_kit::source::SystemSource;

#[tauri::command]
pub fn get_system_fonts() -> Vec<String> {
    let mut font_names = Vec::new();
    let source = font_kit::source::SystemSource::new();

    if let Ok(handles) = source.all_fonts() {
        for handle in handles {
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
