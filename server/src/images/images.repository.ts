export class ImagesRepository {
  async save(file: Express.Multer.File, fileName: string) {
    return {
      url: `http://localhost:3000/images/${fileName}`,
    }
  }
}
