import * as fs from "fs"
import * as path from "path"

export class ImagesRepository {
  async save(file: Express.Multer.File, fileName: string) {
    // 프로젝트 루트의 uploads 폴더에 저장함
    const filePath = path.join(__dirname, "..", "..", "uploads", fileName)

    // fs.writeFile 로 저장
    await fs.writeFile(filePath, file.buffer, (err) => {
      if (err) {
        console.error(err)
      }
    })
  }
}
