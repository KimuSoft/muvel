import * as Y from "yjs"

export async function pullDiff(episodeId: string, ydoc: Y.Doc) {
  const sv = Y.encodeStateVector(ydoc)
  const res = await fetch(
    `/episodes/${episodeId}/sync?sv=${Buffer.from(sv).toString("base64")}`,
  )
  const bin = new Uint8Array(await res.arrayBuffer())
  if (bin.length) Y.applyUpdate(ydoc, bin)
}

export async function pushUpdate(episodeId: string, update: Uint8Array) {
  await fetch(`/episodes/${episodeId}/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ update: Buffer.from(update).toString("base64") }),
  })
}
