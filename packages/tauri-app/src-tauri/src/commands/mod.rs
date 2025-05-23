macro_rules! reexport_module {
    ($x:ident) => {
        mod $x;
        pub use $x::*;
    };
}

reexport_module!(index_commands);
reexport_module!(novel_commands);
reexport_module!(font_commands);
reexport_module!(auth_commands);
reexport_module!(episode_commands);
reexport_module!(wiki_page_commands);
reexport_module!(cloud_commands);
reexport_module!(snapshot_command);
reexport_module!(search_commands);
