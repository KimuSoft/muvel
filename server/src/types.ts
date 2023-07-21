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

// 숫자가 적을 수록 상위 권한 (일반적으로)
export enum NovelPermission {
  // 소설의 작가
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
