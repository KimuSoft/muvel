export enum ShareType {
  // 비공개: 자신만 볼 수 있음
  Private,
  // 일부 공개: 링크를 통해 다른 사람과 공유 가능
  Unlisted,
  // 공개: 뮤블 내 검색을 통해 노출됨
  Public,
  // (데스크톱/모바일 앱 전용) 로컬 저장소에 저장된 소설용
  Local,
}
