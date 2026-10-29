import * as pg from "drizzle-orm/pg-core"
import { defineRelations } from "drizzle-orm"

export const userTable = pg.pgTable(
  "users",
  {
    id: pg.uuid().primaryKey().defaultRandom(),
    email: pg.varchar().unique().notNull(),
    name: pg.varchar().notNull(),
    about: pg.text(),
    hashedPassword: pg.varchar("hashed_password").notNull(),
    salt: pg.varchar().notNull(),
    createdAt: pg
      .timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    followersCount: pg.integer("followers_count").default(0).notNull(),
    followeesCount: pg.integer("followees_count").default(0).notNull(),
    postsCount: pg.integer("posts_count").default(0).notNull(),
    avatar: pg.bytea(),
    // avatarVersion: pg.integer("avatar_version").default(0).notNull(),
    // avatarContentType: pg.varchar("avatar_content_type"),
  },
  (t) => [
    // 按照粉丝数排序
    pg.index("followers_count_idx").on(t.followersCount.desc()),

    // email index
    pg.index("email_idx").on(t.email),
  ],
)
export const refreshTokenTable = pg.pgTable(
  "refresh_tokens",
  {
    id: pg.serial().primaryKey(),
    value: pg.varchar().notNull(),
    ownerId: pg
      .uuid("owner_id")
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => [
    // token 过期时 根据 value 找到对应的 row
    pg.index("value_idx").on(t.value),
  ],
)
export const userFollowsUserTable = pg.pgTable(
  "user_follows_user",
  {
    id: pg.serial().primaryKey(),
    followerId: pg
      .uuid("follower_id")
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    followeeId: pg
      .uuid("followee_id")
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: pg
      .timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // 获取 userId 的所有关注 按时间降序
    pg.index("follower_id_created_at_idx").on(t.followerId, t.createdAt.desc()),

    // 获取 userId 的所有粉丝 按时间降序
    pg.index("followee_id_created_at_idx").on(t.followeeId, t.createdAt.desc()),

    // 防止重复
    pg.unique("user_follows_user_uniq").on(t.followerId, t.followeeId),
  ],
)
export const postTable = pg.pgTable(
  "posts",
  {
    id: pg.uuid().primaryKey().defaultRandom(),
    content: pg.text(),
    createdAt: pg
      .timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    likesCount: pg.integer("likes_count").default(0).notNull(),
    commentsCount: pg.integer("comments_count").default(0).notNull(),
    ownerId: pg
      .uuid("owner_id")
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => [
    // 查询所有 posts 按时间降序 /posts 页面
    pg.index("created_at_idx").on(t.createdAt.desc()),

    // 查询 ownerId 的所有 posts  按时间降序 /users/[userId]/posts 页面
    pg.index("owner_id_created_at_idx").on(t.ownerId, t.createdAt.desc()),
  ],
)
export const userLikesPostTable = pg.pgTable(
  "user_likes_post",
  {
    id: pg.serial().primaryKey(),
    userId: pg
      .uuid("user_id")
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    postId: pg
      .uuid("post_id")
      .references(() => postTable.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: pg
      .timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // ... 等 999 人点赞
    pg.index("post_id_created_at_idx").on(t.postId, t.createdAt.desc()),

    // userId 最近点赞的 postId
    pg.index("user_id_post_id_idx").on(t.userId, t.postId),

    // 防止重复
    pg.unique("user_likes_post_uniq").on(t.userId, t.postId),
  ],
)
export const commentTable = pg.pgTable(
  "comments",
  {
    id: pg.uuid().primaryKey().defaultRandom(),
    content: pg.text(),
    createdAt: pg
      .timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    likesCount: pg.integer("likes_count").default(0).notNull(),
    commentsCount: pg.integer("comments_count").default(0).notNull(),
    ownerId: pg
      .uuid("owner_id")
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    postId: pg
      .uuid("post_id")
      .references(() => postTable.id, { onDelete: "cascade" })
      .notNull(),
    parentId: pg
      .uuid("parent_id")
      .references((): pg.AnyPgColumn => commentTable.id, {
        onDelete: "cascade",
      }),
  },
  (t) => [
    // 按时间倒序 获取 post 或 comment 的子 comment
    pg
      .index("post_id_parent_id_created_at_idx")
      .on(t.postId, t.parentId, t.createdAt.desc()),

    // 按点赞数倒序 获取 post 或 comment 的子 comment
    pg
      .index("post_id_parent_id_likes_count_idx")
      .on(t.postId, t.parentId, t.likesCount.desc()),
  ],
)
export const userLikesCommentTable = pg.pgTable(
  "user_likes_comment",
  {
    id: pg.serial().primaryKey(),
    userId: pg
      .uuid("user_id")
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    commentId: pg
      .uuid("comment_id")
      .references(() => commentTable.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: pg
      .timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // userId 最近点赞的 commentId
    pg.index("user_id_comment_id_idx").on(t.userId, t.commentId),

    // 防止重复
    pg.unique("user_likes_comment_uniq").on(t.userId, t.commentId),
  ],
)

export const likeableTypeEnum = pg.pgEnum("likeable_type", ["post", "comment"])
export const userLikesTable = pg.pgTable(
  "user_likes",
  {
    id: pg.serial().primaryKey(),
    userId: pg
      .uuid("user_id")
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    likeableType: likeableTypeEnum("likeable_type").notNull(),
    likeableId: pg.uuid("likeable_id").notNull(),
    createdAt: pg
      .timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // likeableId 的最近点赞用户
    pg.index("likeable_id_created_at_idx").on(t.likeableId, t.createdAt.desc()),

    // userId 的最近点赞
    pg.index("user_id_created_at_idx").on(t.userId, t.createdAt.desc()),

    // 防止重复
    pg.unique("user_likes_uniq").on(t.userId, t.likeableId),
  ],
)

export const relations = defineRelations(
  {
    userTable,
    refreshTokenTable,
    userFollowsUserTable,
    postTable,
    userLikesPostTable,
    commentTable,
    userLikesCommentTable,
    userLikesTable,
  },
  (r) => ({
    //

    userTable: {
      followers: r.many.userTable({
        from: r.userTable.id,
        to: r.userTable.id,
      }),
      followees: r.many.userTable({
        from: r.userTable.id,
        to: r.userTable.id,
      }),
    },

    // userFollowsUserTable:{},

    postTable: {
      owner: r.one.userTable({
        from: r.postTable.ownerId,
        to: r.userTable.id,
      }),
    },

    userLikesPostTable: {
      user: r.one.userTable({
        from: r.userLikesPostTable.userId,
        to: r.userTable.id,
      }),
      post: r.one.postTable({
        from: r.userLikesPostTable.postId,
        to: r.postTable.id,
      }),
    },

    commentTable: {
      owner: r.one.userTable({
        from: r.commentTable.ownerId,
        to: r.userTable.id,
      }),
    },

    userLikesCommentTable: {
      user: r.one.userTable({
        from: r.userLikesCommentTable.userId,
        to: r.userTable.id,
      }),
      comment: r.one.commentTable({
        from: r.userLikesCommentTable.commentId,
        to: r.commentTable.id,
      }),
    },

    //
  }),
)
