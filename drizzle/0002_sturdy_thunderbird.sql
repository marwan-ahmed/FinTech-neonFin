CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "card_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"batch_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"remaining_quantity" integer NOT NULL,
	"wholesale_price" numeric(12, 2) NOT NULL,
	"total_cost" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investor_distributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"investor_id" uuid NOT NULL,
	"loan_id" uuid NOT NULL,
	"schedule_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "loan_schedules" ADD COLUMN "installment_number" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "loan_schedules" ADD COLUMN "paid_amount" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "disbursement_type" text DEFAULT 'cash' NOT NULL;--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "card_batch_id" uuid;--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "cards_allocated" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "card_wholesale_price" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_batches" ADD CONSTRAINT "card_batches_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investor_distributions" ADD CONSTRAINT "investor_distributions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investor_distributions" ADD CONSTRAINT "investor_distributions_investor_id_investors_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investor_distributions" ADD CONSTRAINT "investor_distributions_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investor_distributions" ADD CONSTRAINT "investor_distributions_schedule_id_loan_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."loan_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_idx" ON "audit_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "card_batches_tenant_idx" ON "card_batches" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "investor_distributions_tenant_idx" ON "investor_distributions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "investor_distributions_investor_idx" ON "investor_distributions" USING btree ("investor_id");--> statement-breakpoint
CREATE INDEX "investor_distributions_loan_idx" ON "investor_distributions" USING btree ("loan_id");--> statement-breakpoint
CREATE INDEX "investor_distributions_schedule_idx" ON "investor_distributions" USING btree ("schedule_id");--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_card_batch_id_card_batches_id_fk" FOREIGN KEY ("card_batch_id") REFERENCES "public"."card_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "investors_tenant_idx" ON "investors" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "investors_created_at_idx" ON "investors" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "kyc_applications_tenant_idx" ON "kyc_applications" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "kyc_applications_status_idx" ON "kyc_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "loan_schedules_tenant_idx" ON "loan_schedules" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "loan_schedules_loan_idx" ON "loan_schedules" USING btree ("loan_id");--> statement-breakpoint
CREATE INDEX "loan_schedules_status_idx" ON "loan_schedules" USING btree ("status");--> statement-breakpoint
CREATE INDEX "loan_schedules_due_date_idx" ON "loan_schedules" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "loans_tenant_idx" ON "loans" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "loans_status_idx" ON "loans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "loans_borrower_name_idx" ON "loans" USING btree ("borrower_name");--> statement-breakpoint
CREATE INDEX "users_tenant_idx" ON "users" USING btree ("tenant_id");