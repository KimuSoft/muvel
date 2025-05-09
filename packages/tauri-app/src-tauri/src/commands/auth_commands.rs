// src-tauri/src/app_lib/auth.rs
use tiny_http::{Server, Response, Header};
use url::Url;


#[tauri::command]
pub fn wait_for_token() -> Result<String, String> {
    let html = r#"<!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8" />
      <title>로그인 완료</title>
      <script>
        window.onload = () => {
          window.close();
        };
      </script>
    </head>
    <body>
      <p>로그인 완료! 창이 곧 닫힙니다.</p>
    </body>
    </html>"#;

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

            let _ = request.respond(    Response::from_string(html).with_header(
                                            Header::from_bytes("Content-Type", "text/html").unwrap()
                                        ));
            return Ok(token);
        }
    }

    Err("콜백 수신 실패".into())
}
