# muvel
> 당신의 이야기를 위한 최고의 친구
* 기획·개발·디자인: 키뮤 (@Kimu-Latilus)
* 기술 및 개발 자문: 파링 (@paring)

### TypeORM 마이그레이션
```shell
cd server
yarn build
yarn typeorm migration:generate src/migrations/init -d datasource.js
yarn build
yarn typeorm migration:run -d datasource.js
```

- 디버깅 시 db 열기
```shell
docker-compose -f docker-compose.dev.yml up -d --build
```