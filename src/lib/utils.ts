import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTimeAgo(past: Date) {
  const now = new Date()
  const diffInMs = now.getTime() - past.getTime()

  // console.log("now.getTime()      ", now.toLocaleString())
  // console.log("pastDate.getTime() ", pastDate.toLocaleString())
  // console.log("diffinms", diffInMs)

  const seconds = Math.floor(diffInMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30) // 粗略计算，大约 30 天一个月
  const years = Math.floor(days / 365) // 粗略计算，大约 365 天一年

  if (years >= 1) {
    return `${years} 年前`
  } else if (months >= 1) {
    return `${months} 个月前`
  } else if (weeks >= 1) {
    return `${weeks} 周前`
  } else if (days >= 1) {
    return `${days} 天前`
  } else if (hours >= 1) {
    return `${hours} 小时前`
  } else if (minutes >= 1) {
    return `${minutes} 分钟前`
  } else {
    return `${seconds} 秒前`
  }
}

export function getDateTime(t: Date) {
  const fullYear = t.getFullYear()
  const month = t.getMonth()
  const date = t.getDate()

  const hours = t.getHours().toString().padStart(2, "0")
  const minutes = t.getMinutes().toString().padStart(2, "0")
  const seconds = t.getSeconds().toString().padStart(2, "0")

  return `${fullYear} 年 ${month + 1} 月 ${date} 日  ${hours}:${minutes}:${seconds}`
}
