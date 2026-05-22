CREATE TYPE "public"."tenant_status" AS ENUM('pending', 'active', 'frozen');--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "is_approved" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "status" "tenant_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "subscription_status" text DEFAULT 'trial' NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "subscription_end_date" timestamp;