CREATE TYPE "public"."selected_plan" AS ENUM('monthly', 'yearly', 'lifetime');--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "selected_plan" "selected_plan";--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "plan_price" integer;