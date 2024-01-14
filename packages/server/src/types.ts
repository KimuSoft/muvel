export enum BlockType {
  // 감싸는 문장부호가 없는 일반 묘사
  Describe,
  // 큰따옴표(“”)로 감싸진 대사 블록
  DoubleQuote,
  // 작은따옴표(‘’)로 감싸진 독백 블록
  SingleQuote,
  // 홑낫표(「 」)로 감싸진 강조 대사(또는 일본어 대사) 블록
  SingleScythe,
  // 겹낫표(『 』)로 감싸진 강조 대사(또는 일본어 대사) 블록
  DoubleScythe,
  // 홑화살괄호(〈 〉)로 감싸진 강조 대사 블록
  SingleGuillemet,
  // 겹화살괄호(《 》)로 감싸진 강조 대사 블록
  DoubleGuillemet,
  // 출력 시 포함되지 않는 작가용 주석 블록
  Commnet,
}

export enum ShareType {
  Private,
  Unlisted,
  Public,
}

export enum NovelPermission {
  Author,
  // 소설의 작가
  DeleteNovel,
  // 소설의 작가
  EditNovel,
  // 소설의 작가
  CreateNovel,
  // 주석을 읽을 수 있음, 일반적으로 작가
  ReadNovelComments,
  // 공개 설정에 따라 일반 유저 또는 작가
  ReadNovel,
}

export enum _NovelPermission {
  // 작가만 읽을 수 있음 (기본값)
  Private,
  // 작품 링크를 통해서만 읽을 수 있음
  Unlisted,
  // 검색이 가능함 (클라이언트 단에서는 현재 의미 없음)
  Public,
}

export enum EpisodePermission {
  // 설정 상속
  Inherit,
  // 공개
  Public,
  // 비공개
  Private,
}

// 소설, 에피소드에 대한 접근자의 권한
export enum Permission {
  // 권한 없음
  None,
  // 읽기 전용 (주석 및 회차 정보 제외)
  ReadOnlyContent,
  // 읽기 전용 (주석 및 모든 정보 포함)
  Read,
  // 작성 가능 (주석 및 모든 정보 포함) - Collaboration 관련 권한
  Edit,
  // 소설의 주인 (수정 가능)
  Author,
}

// 캐릭터의 스토리적 중요도
export enum Importance {
  // 주인공
  Main,
  // 주요 캐릭터
  Major,
  // 일반 캐릭터
  Minor,
  // 배경 캐릭터 (엑스트라)
  Background,
}

export enum EpisodeType {
  Episode,
  EpisodeGroup,
  Prologue,
  Epilogue,
  Special,
}
