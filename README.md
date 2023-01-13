# muvel

여시냐기 완결 언제하나요


### TypeORM 마이그레이션
```
cd server
yarn build
yarn typeorm migration:generate src/migrations/init -d datasource.js (최초 1회) 
yarn typeorm migration:run -d datasource.js
```