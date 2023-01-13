const { DataSource } = require("typeorm")
require("dotenv").config()

module.exports.AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DB_URL,
  entities: ["dist/**/*.entity.js"],
  migrations: ["dist/migrations/*.js"],
  // cli: {
  //   migrationsDir: "src/migrations",
  // },
})
