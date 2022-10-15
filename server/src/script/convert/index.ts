import { Word, WordGroup, WordUnit } from "./dTypes"
import { IWord, WordClass } from "../../types"
import { MongoClient } from "mongodb"
import { config } from "../../config"

const words = require("./words.json") as Word[]
const mongoClient = new MongoClient(config.db)

const convert = async () => {
  await mongoClient.connect()

  console.log("Remove existing 'urimalsam' words...")
  await mongoClient.db().collection("words").deleteMany({
    reference: "urimalsam",
  })
  console.log("Complete Removing")

  const convertedWords: IWord[] = []

  for (const word of words) {
    const _word = {
      name: word.word,
      simpleName: word.word.replace(/[\s-^]/g, ""),
      wordClass: getWordClass(word),
      origin: word.originalLanguage,
      pronunciation: word.pronunciation,
      definition: word.definition,
      tags: getTags(word),
      reference: "urimalsam",
    } as IWord

    for (const k of Object.keys(_word) as (keyof IWord)[])
      if (_word[k] === undefined) delete _word[k]

    convertedWords.push(_word)
  }

  // fs.writeFileSync(
  //   "convertedWords.json",
  //   JSON.stringify(convertedWords, null, 2)
  // )
  console.info(`Loaded ${convertedWords.length.toLocaleString()} words`)

  await mongoClient.db().collection("words").insertMany(convertedWords)
  await mongoClient.close()
  console.info("Done")
}

const getTags = (word: Word): string[] => {
  const tags: string[] = []
  if (word.category) tags.push(word.category)
  if (word.wordGroup !== undefined)
    tags.push(getWordGroupString(word.wordGroup))
  return tags
}

const getWordGroupString = (wordGroup: WordGroup): string => {
  switch (wordGroup) {
    case WordGroup.Ancient:
      return "옛말"
    case WordGroup.Dialect:
      return "방언"
    case WordGroup.NKorean:
      return "북한어"
    case WordGroup.General:
      return "표준어"
  }
}

const getWordClass = (word: Word) => {
  if (word.wordUnit === WordUnit.Phrase) return WordClass.Phrase
  if (word.wordUnit === WordUnit.Idiom) return WordClass.Idiom
  if (word.wordUnit === WordUnit.Proverb) return WordClass.Proverb
  return word.pos as unknown as WordClass
}

convert().then()
