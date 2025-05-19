// app/features/novel-editor/plugins/typewriterPlugin.ts
import { Plugin } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { LOCAL_APP_SETTING_STORAGE_KEY } from "~/providers/AppOptionProvider"
import type { AppOptions } from "~/types/options"

export const typewriterPlugin = (
  getScrollableContainer?: () => HTMLElement | null,
) =>
  new Plugin({
    view() {
      return {
        update(view: EditorView, prevState) {
          const { state } = view
          const { selection, doc } = state

          if (selection.eq(prevState.selection)) return

          if (!selection.empty) return

          const optionsString = localStorage.getItem(
            LOCAL_APP_SETTING_STORAGE_KEY,
          )
          const parsedOptions = optionsString
            ? (JSON.parse(optionsString) as AppOptions)
            : null

          if (!parsedOptions?.editorStyle.typewriter) return

          if (
            parsedOptions?.editorStyle.typewriterStrict &&
            doc.eq(prevState.doc)
          )
            return

          const domAtPos = view.domAtPos(selection.head)
          if (!domAtPos) return

          const targetElement =
            domAtPos.node.nodeType === Node.TEXT_NODE
              ? domAtPos.node.parentElement
              : (domAtPos.node as HTMLElement)

          if (
            !targetElement ||
            typeof targetElement.getBoundingClientRect !== "function"
          )
            return

          const scrollNode = getScrollableContainer
            ? getScrollableContainer()
            : null

          try {
            const targetRect = targetElement.getBoundingClientRect()

            if (scrollNode instanceof HTMLElement) {
              const containerRect = scrollNode.getBoundingClientRect()
              const targetTopRelativeToContainer =
                targetRect.top - containerRect.top
              const desiredScrollTop =
                scrollNode.scrollTop +
                targetTopRelativeToContainer -
                scrollNode.clientHeight / 2 +
                targetRect.height / 2

              scrollNode.scrollTo({
                top: desiredScrollTop,
                behavior: "smooth",
              })
            } else {
              const targetScrollY =
                window.scrollY +
                targetRect.top -
                window.innerHeight / 2 +
                targetRect.height / 2
              window.scrollTo({
                top: targetScrollY,
                behavior: "smooth",
              })
            }
          } catch (error) {
            console.error("Typewriter scroll failed:", error)
          }
        },
      }
    },
  })
