'use client'

import { useEffect, useState } from 'react'
import { isAdminUnlocked } from '@/utils/currentUser'

export type AdminAuthState = 'loading' | 'denied' | 'ok'

/**
 * 管理画面のゲート（認証なし運用）。
 * - localStorage の管理パスコード解除フラグを見て ok / denied を返す。
 * - 'denied' のときは呼び出し側でパスコード入力フォームを表示する。
 * - 'loading' は SSR/hydration 整合のための初期状態。
 */
export function useRequireAdmin(): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>('loading')

  useEffect(() => {
    setState(isAdminUnlocked() ? 'ok' : 'denied')
  }, [])

  return state
}
