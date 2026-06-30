import { pgTable, text, timestamp, decimal, integer, uuid, pgEnum, jsonb, index, boolean } from 'drizzle-orm/pg-core';

export const investorTypeEnum = pgEnum('investor_type', ['retail', 'institutional']);
export const loanStatusEnum = pgEnum('loan_status', ['pending', 'approved', 'active', 'completed', 'defaulted']);
export const userRoleEnum = pgEnum('user_role', ['admin', 'superadmin']);
export const tenantStatusEnum = pgEnum('tenant_status', ['pending', 'active', 'frozen']);
export const subscriptionPlanEnum = pgEnum('subscription_plan', ['monthly', 'yearly', 'percentage', 'none']);

// New enums for the comprehensive subscription system
export const subscriptionBillingCycleEnum = pgEnum('subscription_billing_cycle', ['monthly', 'yearly']);
export const subscriptionTypeEnum = pgEnum('subscription_type', ['fixed', 'percentage']);
export const tenantSubscriptionStatusEnum = pgEnum('tenant_subscription_status', ['trial', 'active', 'past_due', 'canceled', 'unpaid']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'open', 'paid', 'void', 'uncollectible']);

export const selectedPlanEnum = pgEnum('selected_plan', ['monthly', 'yearly', 'lifetime']);

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  status: tenantStatusEnum('status').default('pending').notNull(),
  subscriptionStatus: text('subscription_status', { enum: ['trial', 'active', 'expired'] }).default('trial').notNull(),
  subscriptionPlan: subscriptionPlanEnum('subscription_plan').default('none').notNull(),
  subscriptionEndDate: timestamp('subscription_end_date'),
  selectedPlan: selectedPlanEnum('selected_plan'),
  planPrice: integer('plan_price'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const subscriptionRequests = pgTable('subscription_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  requestedPlan: subscriptionPlanEnum('requested_plan').notNull(),
  paymentMethod: text('payment_method', { enum: ['cash', 'whatsapp'] }).notNull(),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).default('pending').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('sub_req_tenant_idx').on(table.tenantId)
]);

export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: subscriptionTypeEnum('type').default('fixed').notNull(),
  price: decimal('price', { precision: 12, scale: 2 }),
  percentageRate: decimal('percentage_rate', { precision: 5, scale: 2 }),
  billingCycle: subscriptionBillingCycleEnum('billing_cycle').default('monthly').notNull(),
  features: jsonb('features'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tenantSubscriptions = pgTable('tenant_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  planId: uuid('plan_id').references(() => subscriptionPlans.id).notNull(),
  status: tenantSubscriptionStatusEnum('status').default('trial').notNull(),
  startDate: timestamp('start_date').defaultNow().notNull(),
  endDate: timestamp('end_date'),
  gracePeriodEnd: timestamp('grace_period_end'),
  autoRenew: boolean('auto_renew').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('tenant_subscriptions_tenant_idx').on(table.tenantId),
  index('tenant_subscriptions_plan_idx').on(table.planId)
]);

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  subscriptionId: uuid('subscription_id').references(() => tenantSubscriptions.id).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  status: invoiceStatusEnum('status').default('draft').notNull(),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('invoices_tenant_idx').on(table.tenantId),
  index('invoices_subscription_idx').on(table.subscriptionId),
  index('invoices_status_idx').on(table.status)
]);

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  type: text('type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('notifications_tenant_idx').on(table.tenantId),
  index('notifications_is_read_idx').on(table.isRead)
]);


export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firebaseUid: text('firebase_uid').unique().notNull(),
  tenantId: uuid('tenant_id').references(() => tenants.id),
  role: userRoleEnum('role').default('admin').notNull(),
  fullName: text('full_name'),
  email: text('email'),
  phoneNumber: text('phone_number'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('users_tenant_idx').on(table.tenantId)
]);

export const investors = pgTable('investors', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  name: text('name').notNull(),
  capital: decimal('capital', { precision: 12, scale: 2 }).notNull(),
  type: investorTypeEnum('type').default('retail').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('investors_tenant_idx').on(table.tenantId),
  index('investors_created_at_idx').on(table.createdAt)
]);

export const cardBatches = pgTable('card_batches', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  batchName: text('batch_name').notNull(),
  quantity: integer('quantity').notNull(),
  remainingQuantity: integer('remaining_quantity').notNull(),
  wholesalePrice: decimal('wholesale_price', { precision: 12, scale: 2 }).notNull(),
  totalCost: decimal('total_cost', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('card_batches_tenant_idx').on(table.tenantId)
]);

export const loans = pgTable('loans', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  borrowerName: text('borrower_name').notNull(),
  phone: text('phone'),
  address: text('address'),
  job: text('job'),
  
  assetValue: decimal('asset_value', { precision: 12, scale: 2 }).notNull(),
  totalDebt: decimal('total_debt', { precision: 12, scale: 2 }).notNull(),
  tenure: integer('tenure').notNull(),
  marketCardValue: decimal('market_card_value', { precision: 12, scale: 2 }),
  saleCardValue: decimal('sale_card_value', { precision: 12, scale: 2 }),
  
  disbursementType: text('disbursement_type').default('cash').notNull(),
  cardBatchId: uuid('card_batch_id').references(() => cardBatches.id),
  cardsAllocated: integer('cards_allocated').default(0),
  cardWholesalePrice: decimal('card_wholesale_price', { precision: 12, scale: 2 }),
  
  score: text('score').default('A').notNull(),
  status: loanStatusEnum('status').default('active').notNull(),
  
  nextDue: timestamp('next_due'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('loans_tenant_idx').on(table.tenantId),
  index('loans_status_idx').on(table.status),
  index('loans_borrower_name_idx').on(table.borrowerName)
]);

export const kycApplications = pgTable('kyc_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  status: text('status').default('pending').notNull(),
  riskLevel: text('risk_level').default('low').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('kyc_applications_tenant_idx').on(table.tenantId),
  index('kyc_applications_status_idx').on(table.status)
]);

export const loanScheduleEnum = pgEnum('schedule_status', ['pending', 'paid', 'late', 'defaulted']);

export const loanSchedules = pgTable('loan_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  loanId: uuid('loan_id').references(() => loans.id).notNull(),
  installmentNumber: integer('installment_number').notNull(),
  dueDate: timestamp('due_date').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal('paid_amount', { precision: 12, scale: 2 }).default('0'),
  status: loanScheduleEnum('status').default('pending').notNull(),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('loan_schedules_tenant_idx').on(table.tenantId),
  index('loan_schedules_loan_idx').on(table.loanId),
  index('loan_schedules_status_idx').on(table.status),
  index('loan_schedules_due_date_idx').on(table.dueDate)
]);

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  userId: uuid('user_id'), // Optional in case of system actions, but mostly referencing users.id
  action: text('action').notNull(), 
  entityType: text('entity_type').notNull(), 
  entityId: text('entity_id').notNull(),
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('audit_logs_tenant_idx').on(table.tenantId),
  index('audit_logs_created_at_idx').on(table.createdAt)
]);

export const investorDistributions = pgTable('investor_distributions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  investorId: uuid('investor_id').references(() => investors.id).notNull(),
  loanId: uuid('loan_id').references(() => loans.id).notNull(),
  scheduleId: uuid('schedule_id').references(() => loanSchedules.id).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('investor_distributions_tenant_idx').on(table.tenantId),
  index('investor_distributions_investor_idx').on(table.investorId),
  index('investor_distributions_loan_idx').on(table.loanId),
  index('investor_distributions_schedule_idx').on(table.scheduleId)
]);

export const contactMessages = pgTable('contact_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
