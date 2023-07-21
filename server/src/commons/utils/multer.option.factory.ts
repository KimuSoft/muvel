import * as multer from "multer"
import * as fs from "fs"
import * as path from "path"
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface"

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "..", "..", "..", `uploads`)

    console.log(uploadPath)
    if (fs.existsSync(uploadPath)) {
      console.log("폴더 업성")
      fs.mkdirSync(uploadPath, { recursive: true })
    }

    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    // 파일명 조작 (ex: 임의의 이름 생성 + 확장자)
    const ext = path.extname(file.originalname) //파일을 올려서 확장자를 추출한다.

    const fileName = `${path.basename(
      file.originalname,
      ext
    )}${Date.now()}${ext}`

    console.log(fileName + "에 저장")
    cb(null, fileName)
  },
})

export const multerOptionsFactory = (): MulterOptions => {
  return {
    storage,
  }
}
