import {useQueryState} from 'nuqs'

// nuqs 是一个 轻量、类型安全的库，帮你轻松管理 URL 中的参数（就是网址问号后面的东西，比如 ?page=2&sort=price）
export const useProfileMemberId = () => {
  return useQueryState("profileMemberId");
}