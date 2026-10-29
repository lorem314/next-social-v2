import path from "path"
import fs from "fs/promises"
import { NextResponse, NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import crypto from "crypto"

import { db } from "@/drizzle/db"
import { userTable } from "@/drizzle/schema"

const DEFAULT_USER_AVATAR = path.join(
  process.cwd(),
  "public",
  "default-user-avatar.png",
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const awaitedParams = await params
  const { userId } = awaitedParams

  console.log("[route] userId", userId)

  let imageBuffer: Buffer
  let contentType: string

  const result = await db
    .select({ avatar: userTable.avatar })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1)

  const isCustomAvatar = result.length > 0 && result[0].avatar

  if (isCustomAvatar) {
    imageBuffer = result[0].avatar as Buffer
    contentType = "image/jpeg"
  } else {
    try {
      imageBuffer = await fs.readFile(DEFAULT_USER_AVATAR)
      contentType = "image/png"
    } catch (error) {
      return new NextResponse("找不到默认头像", { status: 500 })
    }
  }

  const hash = crypto.createHash("md5").update(imageBuffer).digest("hex")
  const etag = `"${hash}"`

  let cacheControl: string
  if (isCustomAvatar) {
    cacheControl = "public, max-age=0, must-revalidate"
  } else {
    cacheControl = "public, max-age=31536000, immutable" // 1 年
  }

  return new NextResponse(imageBuffer.buffer as ArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": imageBuffer.length.toString(),
      "Cache-Control": cacheControl,
      ETag: etag, // 浏览器用这个验证变化
    },
  })
}

export const OPTIONS = async () => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
