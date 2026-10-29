"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

import { db } from "@/drizzle/db"
import { userTable } from "@/drizzle/schema"

export async function updateAvatar(userId: string, formData: FormData) {
  const file = formData.get("avatar") as File

  if (!file || file.size === 0) {
    throw new Error("无效文件")
  }

  if (file.size > 1 * 1024 * 1024) {
    throw new Error("文件不能超过 1MB")
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("只能上传图片文件")
  }

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await db
      .update(userTable)
      .set({ avatar: buffer })
      .where(eq(userTable.id, userId))

    revalidatePath(`/api/users/${userId}/avatar`)
    revalidatePath(`/users/${userId}`)
  } catch (error) {
    console.log("[update-avatar]", error)
    throw Error("上传头像失败")
  }
}
