"use client"
import { getRandomThemeId } from "@/app/(real-time)/_components/cursors-themes"
import { VisitorMessage } from "@/app/(real-time)/_components/store/message-store"
import { RealtimeChannel } from "@supabase/supabase-js"
import { createClient } from "@yz13/supabase/client"
import { useLocalStorageState, useMouse } from "ahooks"
import dayjs from "dayjs"
import { flatten, throttle } from "lodash"
import { useEffect, useTransition } from "react"
import { VisitorCursor } from "../store/cursors-store"


export type Visitor = {
  uid: string
  created_at: string
  updated_at: string
  cursor: { x: number, y: number }
}

const X_THRESHOLD = 25
const Y_THRESHOLD = 35
type Props = {
  users?: VisitorCursor[]
  onUsers?: (users: VisitorCursor[]) => void
}
const VisitorSync = ({ onUsers, users = [] }: Props) => {
  const [sid] = useLocalStorageState<string | null>("anon-sid", { defaultValue: null })
  const mouse = useMouse();
  const client = createClient()
  const [isPending, startTransition] = useTransition()
  const sendCursor = throttle((channel: RealtimeChannel, visitor: VisitorCursor) => {
    startTransition(() => {
      channel.send({
        type: "broadcast",
        event: "POS",
        payload: visitor
      })
    })
  }, 10)
  const sendMessage = (channel: RealtimeChannel, message: VisitorMessage) => {
    channel.send({
      type: "broadcast",
      event: "message",
      payload: message
    })
  }
  const mapInitialUsers = (channel: RealtimeChannel) => {
    const state = channel.presenceState<VisitorCursor>()
    console.log(state)
    const entries = Object.values(state)
    const prepared_users = flatten(entries).map(user => {
      const theme_id = getRandomThemeId()
      const existedUser = users.find(existed => existed.user_id === user.user_id)
      if (existedUser) return existedUser
      if (user.theme_id) return { ...user, cursor: { x: 24, y: 24 } }
      return { ...user, cursor: { x: 24, y: 24 }, theme_id: theme_id }
    })
    onUsers && onUsers(prepared_users)
  }
  useEffect(() => {
    const cursors_channel = client.channel("cursors")
    cursors_channel
      .on(
        "broadcast",
        { event: "POS" },
        (payload) => {
          const newPos = payload.payload as VisitorCursor | null
          if (newPos) {
            const x =
              (newPos.cursor?.x ?? 0) - X_THRESHOLD > window.innerWidth
                ? window.innerWidth - X_THRESHOLD
                : newPos.cursor?.x
            const y =
              (newPos.cursor?.y ?? 0 - Y_THRESHOLD) > window.innerHeight
                ? window.innerHeight - Y_THRESHOLD
                : newPos.cursor?.y
            const updated_users = users.map(user => {
              const isTargetUser = newPos.user_id === user.user_id
              if (isTargetUser) return { ...newPos, cursor: { x: x, y: y } }
              return user
            })
            startTransition(() => {
              onUsers && onUsers(updated_users)
            })
          }
        })
      .subscribe((status) => {
        const theme = users.find(user => user.user_id === sid)
        const updated_cursor: VisitorCursor = {
          user_id: sid || "anon",
          cursor: { x: mouse.clientX || 24, y: mouse.clientY || 24 },
          theme_id: theme?.theme_id
        }
        startTransition(() => {
          sendCursor(cursors_channel, updated_cursor)
        })
      })
    return () => {
      cursors_channel.unsubscribe()
      client.removeChannel(cursors_channel)
    }
  }, [mouse])
  useEffect(() => {
    const messages_channel = client.channel("messages")
    messages_channel
      .on(
        "broadcast",
        { event: "message" },
        () => { }
      )
      .subscribe((status) => {
        const message: VisitorMessage = {
          created_at: dayjs().toISOString(),
          text: "Hello",
          uid: sid || "anone"
        }
        startTransition(() => {
          sendMessage(messages_channel, message)
        })
      })
    return () => {
      messages_channel.unsubscribe()
      client.removeChannel(messages_channel)
    }
  }, [])
  useEffect(() => {
    const users_channel = client.channel("users", {
      config: {
        presence: {
          key: sid || "anon"
        }
      }
    })
    users_channel
      .on('presence', { event: 'sync' }, () => {
        mapInitialUsers(users_channel)
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        // console.log(key, newPresences)
        mapInitialUsers(users_channel)
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        // console.log(key, leftPresences)
        mapInitialUsers(users_channel)
      })
      .subscribe((status) => {
        // console.log(status)
        if (status === "SUBSCRIBED") {
          const user: VisitorCursor = {
            user_id: sid || "anon",
            cursor: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
          }
          users_channel.track(user)
        }
      })
    return () => {
      users_channel.untrack()
      users_channel.unsubscribe()
      client.removeChannel(users_channel)
    }
  }, [])
  return <></>
}
export { VisitorSync }
