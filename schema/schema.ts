import { pgTable, text, timestamp, decimal, integer, uuid, pgEnum, jsonb } from 'drizzle-orm/pg-core';

export const investorTypeEnum = pgEnum('investor_type', ['retail', 'institutional']);
export const loanStatusEnum = pgEnum('loan_status', ['pending', 'approved', 'active', 'completed', 'defaulted']);

export const investors = pgTable('investors', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  capital: decimal('capital', { precision: 12, scale: 2 }).notNull(),
  type: investorTypeEnum('type').default('retail').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const loans = pgTable('loans', {
  id: uuid('id').primaryKey().defaultRandom(),
  borrowerName: text('borrower_name').notNull(),
  phone: text('phone'),
  address: text('address'),
  job: text('job'),
  
  assetValue: decimal('asset_value', { precision: 12, scale: 2 }).notNull(),
  totalDebt: decimal('total_debt', { precision: 12, scale: 2 }).notNull(),
  tenure: integer('tenure').notNull(),
  marketCardValue: decimal('market_card_value', { precision: 12, scale: 2 }),
  saleCardValue: decimal('sale_card_value', { precision: 12, scale: 2 }),
  
  score: text('score').default('A').notNull(),
  status: loanStatusEnum('status').default('active').notNull(),
  
  schedule: jsonb('schedule').default([]).notNull(),
  nextDue: timestamp('next_due'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const kycApplications = pgTable('kyc_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  status: text('status').default('pending').notNull(),
  riskLevel: text('risk_level').default('low').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

