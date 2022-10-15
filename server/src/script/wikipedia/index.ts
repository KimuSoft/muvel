import * as fs from "fs"
import * as path from "path"
import { parseStringPromise } from "xml2js"

const convert = async () => {
  console.log("Converting Wikipedia XML to JSON")
  // read kowiki-latest-pages-articles.xml
  const xml = fs.readFileSync(
    path.join(__dirname, "kowiki-latest-pages-articles.xml")
  )

  console.log("Parsing XML")
  // parse xml
  const json = await parseStringPromise(xml)

  console.log("Writing JSON")
  // extract pages
  const pages = json["mediawiki"]["page"]

  console.log(pages[0])

  // extract title and text
  const data = pages.map((page: any) => {
    const title = page["title"][0]
    const text = page["revision"][0]["text"][0]
    return { title, text }
  })
}

convert().then()
