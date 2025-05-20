import { Plugin } from "prosemirror-state"
import { LineBreakImportStrategy } from "~/types/options"
import { Fragment, Slice } from "prosemirror-model"
import { textToPMNodeContent } from "~/services/io/text/textToPMNode"
import { getAppOptions } from "~/features/novel-editor/utils/getAppOptions"

export const pastePlugin = (/* 플러그인 옵션들 */) =>
  new Plugin({
    props: {
      handlePaste(view, event, slice) {
        const clipboardData = event.clipboardData
        if (!clipboardData) return false

        const html = clipboardData.getData("text/html")
        const text = clipboardData.getData("text/plain")

        // 현재 사용자의 lineBreakImportStrategy 옵션을 가져옵니다 (예시)
        const strategy =
          getAppOptions()?.editorStyle?.lineBreakImportStrategy ||
          LineBreakImportStrategy.Semantic

        console.log(strategy)

        let fragment: Fragment

        if (html && html.length > 0) {
          // HTML 콘텐츠가 있다면 htmlToPMNodeContent 사용 (더 정교한 HTML 처리가 필요하면 이 부분 확장)
          // console.log("Pasting HTML:", html);
          // fragment = htmlToPMNodeContent(html, userOptions, view.state.schema);
          // 기본 ProseMirror HTML 파싱을 우선 사용하고, 필요시 커스텀 로직으로 대체
          return false // 기본 HTML 파싱 사용하도록 false 반환
        } else if (text && text.length > 0) {
          // console.log("Pasting Text:", text);
          fragment = textToPMNodeContent(text, { strategy }, view.state.schema)
          console.log("Fragment from text:", fragment)
        } else {
          return false // 붙여넣을 내용 없음
        }

        if (fragment && !fragment.eq(Fragment.empty)) {
          view.dispatch(
            view.state.tr
              .replaceSelection(new Slice(fragment, 0, 0))
              .scrollIntoView(),
          )
          return true // ProseMirror의 기본 붙여넣기 동작을 막음
        }
        return false
      },
      // ...기타 플러그인 props
    },
  })
