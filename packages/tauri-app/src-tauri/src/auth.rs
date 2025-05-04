// src-tauri/src/app_lib/auth.rs
use tiny_http::{Server, Response};
use url::Url;

#[tauri::command]
pub fn wait_for_token() -> Result<String, String> {
    let server = Server::http("127.0.0.1:53682").map_err(|e| e.to_string())?;

    for request in server.incoming_requests() {
        if request.url().starts_with("/callback") {
            let url = format!("http://localhost:53682{}", request.url());
            let parsed = Url::parse(&url).unwrap();

            let token = parsed
                .query_pairs()
                .find(|(k, _)| k == "token")
                .map(|(_, v)| v.to_string())
                .ok_or("no token")?;

            let _ = request.respond(Response::from_string("로그인 완료! 창을 닫으셔도 됩니다."));
            return Ok(token);
        }
    }

    Err("콜백 수신 실패".into())
}
