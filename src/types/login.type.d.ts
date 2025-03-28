type id = number | string;

interface QrCreateResponse {
  qrurl: string;
  qrimg: string;
}

interface QrCheckResponse {
  status: number;
  cookie: string;
}

interface User {
  // 用户ID
  id: id;
  // 用户名称
  name: string;
  // 用户头像
  avatar?: string;
  // 用户简介
  description?: string;
}

type StatusResponse = User

interface AccountProfile {
  userId: id
  nickname: string
  avatarUrl: string
}
