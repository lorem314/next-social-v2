import "dotenv/config"

import { eq, sql } from "drizzle-orm"
import crypto from "crypto"
import { faker } from "@faker-js/faker"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

// import { db } from "@/drizzle/db"
import {
  commentTable,
  postTable,
  userFollowsUserTable,
  userLikesCommentTable,
  userLikesPostTable,
  userLikesTable,
  userTable,
  relations,
} from "@/drizzle/schema"
import * as schema from "@/drizzle/schema"

// types
type Config = { dryRun?: boolean }
type User = Pick<typeof userTable.$inferSelect, "id" | "name" | "createdAt">
type Post = Pick<typeof postTable.$inferSelect, "id" | "createdAt">
type Comment = Pick<
  typeof commentTable.$inferSelect,
  "id" | "postId" | "createdAt"
>

// init
const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const db = drizzle({ relations, schema, client: pool })

// generate functions
// user
async function generateUser(serial: number) {
  const serialString = serial.toString().padStart(3, "0")

  const password = `user${serialString}`
  const salt = Math.round(new Date().valueOf() * Math.random()) + ""
  const hashedPassword = crypto
    .createHmac("sha1", salt)
    .update(password)
    .digest("hex")

  await db.insert(userTable).values({
    name: `user${serialString}`,
    email: `user${serialString}@gmail.com`,
    hashedPassword,
    salt,
    about: faker.person.bio(),
    createdAt: faker.date.between({ from: "2024-01-01", to: "2025-01-01" }),
  })
}
async function generateUsers(config: Config = { dryRun: false }) {
  const count = faker.number.int({ min: 19, max: 21 })

  if (!config.dryRun) {
    for (let i = 0; i <= count; i++) {
      await generateUser(i)
    }
  }

  console.log(`Generated ${count} users`)
}

// user follows user
async function generateUserFollowsUser(config: Config = { dryRun: false }) {
  const users = await db.query.userTable.findMany({
    columns: { id: true, name: true, createdAt: true },
  })

  for (const follower of users) {
    let total = 0

    for (const followee of users) {
      if (follower.id === followee.id) continue

      if (Math.random() >= 0.35) continue

      total++

      if (!config.dryRun) {
        const maxCreatedAt =
          follower.createdAt > followee.createdAt
            ? follower.createdAt
            : followee.createdAt

        await db.transaction(async (tx) => {
          await tx.insert(userFollowsUserTable).values({
            followerId: follower.id,
            followeeId: followee.id,
            createdAt: faker.date.between({
              from: maxCreatedAt,
              to: "2025-03-01",
            }),
          })
          await tx
            .update(userTable)
            .set({ followersCount: sql`${userTable.followersCount} + 1` })
            .where(eq(userTable.id, follower.id))
          await tx
            .update(userTable)
            .set({ followeesCount: sql`${userTable.followeesCount} + 1` })
            .where(eq(userTable.id, followee.id))
        })
      }

      // console.log(`${follower.name} followed ${followee.name}`)
    }
    console.log(`${follower.name} followed ${total} users`)
  }
}

// post
async function generatePostForUser(user: User) {
  const createdAt = faker.date.between({
    from: user.createdAt,
    to: "2025-05-01",
  })
  await db.transaction(async (tx) => {
    await tx.insert(postTable).values({
      content: faker.lorem.paragraphs({ min: 2, max: 5 }, "\n\n"),
      ownerId: user.id,
      createdAt,
    })
    await tx
      .update(userTable)
      .set({ postsCount: sql`${userTable.postsCount} + 1` })
      .where(eq(userTable.id, user.id))
  })
}
async function generatePostsForUser(
  user: User,
  config: Config = { dryRun: false },
) {
  const count = faker.number.int({ min: 3, max: 16 })

  if (!config.dryRun) {
    for (let i = 0; i <= count; i++) {
      await generatePostForUser(user)
    }
  }

  console.log(`Generated ${count} posts for ${user.name}`)

  return count
}
async function generatePostsForUsers(config: Config = { dryRun: false }) {
  const users = await db.query.userTable.findMany({
    columns: { id: true, name: true, createdAt: true },
  })

  let total = 0
  for (const user of users) {
    const count = await generatePostsForUser(user, config)
    total += count
  }
  console.log(`Generated ${total} posts`)
}

// user likes post
async function generateUserLikesPost(config: Config = { dryRun: false }) {
  const users = await db.query.userTable.findMany({
    columns: { id: true, name: true, createdAt: true },
  })
  const posts = await db.query.postTable.findMany({
    columns: { id: true, createdAt: true },
  })

  for (const user of users) {
    let total = 0

    for (const post of posts) {
      if (Math.random() >= 0.25) continue

      total++

      if (!config.dryRun) {
        const maxCreatedAt =
          user.createdAt > post.createdAt ? user.createdAt : post.createdAt

        const createdAt = faker.date.between({
          from: maxCreatedAt,
          to: "2025-07-01",
        })

        await db.transaction(async (tx) => {
          await tx.insert(userLikesPostTable).values({
            userId: user.id,
            postId: post.id,
            createdAt,
          })

          await tx
            .update(postTable)
            .set({ likesCount: sql`${postTable.likesCount} + 1` })
            .where(eq(postTable.id, post.id))

          await tx.insert(userLikesTable).values({
            userId: user.id,
            likeableType: "post",
            likeableId: post.id,
            createdAt,
          })
        })
      }

      // console.log(`${user.name} liked post ${post.id}`)
    }

    console.log(`${user.name} liked ${total} posts`)
  }
}

// comment
async function generateCommentForPost(post: Post, users: User[]) {
  const index = Math.floor(Math.random() * users.length)
  const user = users[index]

  const maxCreatedAt =
    user.createdAt > post.createdAt ? user.createdAt : post.createdAt

  await db.transaction(async (tx) => {
    await tx.insert(commentTable).values({
      content: faker.lorem.words({ min: 1, max: 15 }),
      createdAt: faker.date.between({ from: maxCreatedAt, to: "2025-05-01" }),
      ownerId: user.id,
      postId: post.id,
      parentId: null,
    })
    await tx
      .update(postTable)
      .set({ commentsCount: sql`${postTable.commentsCount} + 1` })
      .where(eq(postTable.id, post.id))
  })
}
async function generateCommentsForPost(
  post: Post,
  users: User[],
  config: Config = { dryRun: false },
) {
  const hotChance = 0.07
  const max = 7
  const hotMin = 6

  const isHot = Math.random() < hotChance

  const count = isHot
    ? hotMin + Math.floor(Math.random() * (max - hotMin + 1))
    : Math.floor(Math.random() ** 2.5 * hotMin)

  if (!config.dryRun) {
    for (let i = 0; i < count; i++) {
      await generateCommentForPost(post, users)
    }
  }

  // console.log(
  //   `Generated ${count} comments for post ${post.id} ${isHot ? "(hot)" : ""}`,
  // )

  return { count, isHot }
}
async function generateCommentsForPosts(config: Config = { dryRun: false }) {
  const posts = await db.query.postTable.findMany({
    columns: { id: true, createdAt: true },
  })
  const users = await db.query.userTable.findMany({
    columns: { id: true, name: true, createdAt: true },
  })

  let total = 0
  let totalHot = 0

  for (const post of posts) {
    const { count, isHot } = await generateCommentsForPost(post, users, config)
    total += count
    isHot && totalHot++
  }

  console.log(`Generated ${total} comments for ${posts.length} posts`)
  console.log(`    ${totalHot} hot posts`)
}

// comment reply
async function generateReplyForComment(comment: Comment, users: User[]) {
  const index = Math.floor(Math.random() * users.length)
  const user = users[index]

  const maxCreatedAt =
    user.createdAt > comment.createdAt ? user.createdAt : comment.createdAt

  await db.transaction(async (tx) => {
    await tx.insert(commentTable).values({
      content: faker.lorem.words({ min: 1, max: 3 }),
      ownerId: user.id,
      postId: comment.postId,
      parentId: comment.id,
      createdAt: faker.date.between({ from: maxCreatedAt, to: "2025-07-01" }),
    })

    await tx
      .update(commentTable)
      .set({ commentsCount: sql`${commentTable.commentsCount} + 1` })
      .where(eq(commentTable.id, comment.id))

    await tx
      .update(postTable)
      .set({ commentsCount: sql`${postTable.commentsCount} + 1` })
      .where(eq(postTable.id, comment.postId))
  })
}
async function generateRepliesForComment(
  comment: Comment,
  users: User[],
  config: Config = { dryRun: false },
) {
  const hotChance = 0.02
  const max = 12
  const hotMin = 6

  const isHot = Math.random() < hotChance

  const count = isHot
    ? hotMin + Math.floor(Math.random() * (max - hotMin + 1))
    : Math.floor(Math.random() ** 2.5 * hotMin)

  if (!config.dryRun) {
    for (let i = 0; i < count; i++) {
      await generateReplyForComment(comment, users)
    }
  }

  console.log(
    `Generated ${count} replies for comment ${comment.id} ${isHot ? "(hot)" : ""}`,
  )

  return { count, isHot }
}
async function generateRepliesForComments(config: Config = { dryRun: false }) {
  const comments = await db.query.commentTable.findMany({
    columns: { id: true, postId: true, createdAt: true },
  })
  const users = await db.query.userTable.findMany({
    columns: { id: true, name: true, createdAt: true },
  })

  let total = 0
  let totalHot = 0

  for (const comment of comments) {
    const { count, isHot } = await generateRepliesForComment(
      comment,
      users,
      config,
    )
    total += count
    isHot && totalHot++
  }

  console.log(`Generated ${total} replies for ${comments.length} comments`)
  console.log(`    ${totalHot} hot comments`)
}

// user likes comment
async function generateUserLikesComment(config: Config = { dryRun: false }) {
  const users = await db.query.userTable.findMany({
    columns: { id: true, name: true, createdAt: true },
  })
  const comments = await db.query.commentTable.findMany({
    columns: { id: true, postId: true, createdAt: true },
  })

  for (const user of users) {
    let total = 0

    for (const comment of comments) {
      if (Math.random() >= 0.03) continue

      total++

      const maxCreatedAt =
        user.createdAt > comment.createdAt ? user.createdAt : comment.createdAt

      const createdAt = faker.date.between({
        from: maxCreatedAt,
        to: "2025-09-01",
      })

      if (!config.dryRun) {
        await db.transaction(async (tx) => {
          await tx.insert(userLikesCommentTable).values({
            userId: user.id,
            commentId: comment.id,
            createdAt,
          })

          await tx
            .update(commentTable)
            .set({ likesCount: sql`${commentTable.likesCount} + 1` })
            .where(eq(commentTable.id, comment.id))

          await tx.insert(userLikesTable).values({
            userId: user.id,
            likeableType: "post",
            likeableId: comment.id,
            createdAt,
          })
        })
      }

      // console.log(`${user.name} liked comment ${comment.id}`)
    }

    console.log(`${user.name} liked ${total} comments`)
  }
}

async function main() {
  // await generateUsers({ dryRun: true })
  //
  // await generateUserFollowsUser({ dryRun: true })
  //
  // await generatePostsForUsers({ dryRun: true })
  //
  // await generateUserLikesPost({ dryRun: true })
  //
  // await generateCommentsForPosts({ dryRun: true })
  //
  // await generateRepliesForComments({ dryRun: true })
  //
  // await generateUserLikesComment({ dryRun: true })
  //
}

main()
  .catch((error) => {
    console.error(error)
  })
  .finally(async () => {
    await db.$client.end()
    process.exit(0)
  })
