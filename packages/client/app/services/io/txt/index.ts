/**
 * @file app/services/io/txt/index.ts
 * @description Handles the conversion of TXT files to EpisodeLike structure.
 */
import type { EpisodeBlock } from "muvel-api-types"
import { textToBlocks } from "./textToBlocks"
import type { LineBreakImportStrategy } from "~/types/options" // Assuming LineBreakImportStrategy type

// Define the structure for an imported episode before it's fully processed.
export interface EpisodeLike {
  title: string
  blocks: EpisodeBlock[]
}

/**
 * Reads a TXT File object and converts its content into an EpisodeLike structure.
 * The episode title will be the filename without the extension.
 *
 * @param file - The TXT File object to process.
 * @param lineBreakStrategy - How to handle line breaks from the text file.
 * @returns A Promise that resolves to an EpisodeLike object.
 * @throws Error if the file cannot be read.
 */
export async function txtFileToEpisodeLike(
  file: File,
  lineBreakStrategy: LineBreakImportStrategy,
): Promise<EpisodeLike> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const textContent = event.target?.result as string
        if (textContent === null || typeof textContent === "undefined") {
          throw new Error("File content is empty or could not be read.")
        }

        const blocks = textToBlocks(textContent, {
          strategy: lineBreakStrategy,
        })

        // Use filename without extension as title
        const fileName = file.name
        const title =
          fileName.substring(0, fileName.lastIndexOf(".")) || fileName

        resolve({
          title,
          blocks,
        })
      } catch (error) {
        console.error("Error processing TXT file content:", error)
        reject(
          error instanceof Error
            ? error
            : new Error("Failed to process TXT file content."),
        )
      }
    }

    reader.onerror = (error) => {
      console.error("Error reading file:", error)
      reject(new Error("Failed to read the file."))
    }

    reader.readAsText(file, "UTF-8") // Specify UTF-8 encoding, common for text files
  })
}
