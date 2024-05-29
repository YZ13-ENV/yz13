"use client"
import { likeSubThread, viewSubThread } from "@yz13/api/db/client-threads"
import { ThreadItem } from "@yz13/api/db/types"
import { useLocalStorageState } from "ahooks"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { useState } from "react"
import { LikeButton } from "./like-button"
import { ViewButton } from "./view-button"

type Props = {
  sub_thread: ThreadItem
}
dayjs.extend(relativeTime)
const SubThreadStatistics = ({ sub_thread }: Props) => {
  const [sid] = useLocalStorageState<string | null>("anon-sid", { defaultValue: null })
  const created_at = dayjs(sub_thread?.created_at)
  const formatted_created_at = created_at.fromNow(false)
  const [likes, setLikes] = useState<string[]>(sub_thread.likes)
  const [views, setViews] = useState<string[]>(sub_thread.views)
  const session_id = sid || ""
  const isLiked = likes.includes(session_id)
  const isViewed = views.includes(session_id)
  const view = async () => {
    if (session_id && !isViewed) {
      const updated_views_res = await viewSubThread(sub_thread.thread_id, sub_thread.sub_thread_id, session_id)
      const updated_views = updated_views_res.data ? updated_views_res.data.likes : []
      setViews(updated_views)
    }

    if (isViewed) {
      return
    } else setViews([...views, session_id])
  }
  const like = async () => {
    if (session_id) {
      const updated_likes_res = await likeSubThread(sub_thread.thread_id, sub_thread.sub_thread_id, session_id)
      const updated_likes = updated_likes_res.data ? updated_likes_res.data.likes : []
      setLikes(updated_likes)
    }
  }
  return (
    <div className="w-full flex items-center justify-between">
      <div className="relative -left-3 flex items-center gap-2">
        <LikeButton
          onClick={like}
          variant={isLiked ? "liked" : "not-liked"}
          value={likes.length}
        />
        <ViewButton
          variant="ghost"
          value={views.length}
          onView={view}
        />
      </div>
      <span className="text-xs">{formatted_created_at}</span>
    </div>
  )
}
export { SubThreadStatistics }