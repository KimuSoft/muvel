yarn build
yarn typeorm migration:generate src/migrations/init -d datasource.js
yarn build
yarn typeorm migration:run -d datasource.js
