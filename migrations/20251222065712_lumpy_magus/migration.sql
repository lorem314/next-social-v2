CREATE TYPE "likeable_type" AS ENUM('post', 'comment');--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"content" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"comments_count" integer DEFAULT 0 NOT NULL,
	"owner_id" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	"parent_id" uuid
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"content" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"comments_count" integer DEFAULT 0 NOT NULL,
	"owner_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" serial PRIMARY KEY,
	"value" varchar NOT NULL,
	"owner_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_follows_user" (
	"id" serial PRIMARY KEY,
	"follower_id" uuid NOT NULL,
	"followee_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_follows_user_uniq" UNIQUE("follower_id","followee_id")
);
--> statement-breakpoint
CREATE TABLE "user_likes_comment" (
	"id" serial PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"comment_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_likes_comment_uniq" UNIQUE("user_id","comment_id")
);
--> statement-breakpoint
CREATE TABLE "user_likes_post" (
	"id" serial PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_likes_post_uniq" UNIQUE("user_id","post_id")
);
--> statement-breakpoint
CREATE TABLE "user_likes" (
	"id" serial PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"likeable_type" "likeable_type" NOT NULL,
	"likeable_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_likes_uniq" UNIQUE("user_id","likeable_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"email" varchar NOT NULL UNIQUE,
	"name" varchar NOT NULL,
	"about" text,
	"hashed_password" varchar NOT NULL,
	"salt" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"followers_count" integer DEFAULT 0 NOT NULL,
	"followees_count" integer DEFAULT 0 NOT NULL,
	"posts_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX "post_id_parent_id_created_at_idx" ON "comments" ("post_id","parent_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "post_id_parent_id_likes_count_idx" ON "comments" ("post_id","parent_id","likes_count" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "posts" ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "owner_id_created_at_idx" ON "posts" ("owner_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "value_idx" ON "refresh_tokens" ("value");--> statement-breakpoint
CREATE INDEX "follower_id_created_at_idx" ON "user_follows_user" ("follower_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "followee_id_created_at_idx" ON "user_follows_user" ("followee_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "user_id_comment_id_idx" ON "user_likes_comment" ("user_id","comment_id");--> statement-breakpoint
CREATE INDEX "post_id_created_at_idx" ON "user_likes_post" ("post_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "user_id_post_id_idx" ON "user_likes_post" ("user_id","post_id");--> statement-breakpoint
CREATE INDEX "likeable_id_created_at_idx" ON "user_likes" ("likeable_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "user_id_created_at_idx" ON "user_likes" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "followers_count_idx" ON "users" ("followers_count" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "email_idx" ON "users" ("email");--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_owner_id_users_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_comments_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_owner_id_users_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_owner_id_users_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_follows_user" ADD CONSTRAINT "user_follows_user_follower_id_users_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_follows_user" ADD CONSTRAINT "user_follows_user_followee_id_users_id_fkey" FOREIGN KEY ("followee_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_likes_comment" ADD CONSTRAINT "user_likes_comment_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_likes_comment" ADD CONSTRAINT "user_likes_comment_comment_id_comments_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_likes_post" ADD CONSTRAINT "user_likes_post_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_likes_post" ADD CONSTRAINT "user_likes_post_post_id_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_likes" ADD CONSTRAINT "user_likes_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;