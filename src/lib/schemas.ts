import { z } from 'zod';

export const kpiSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  helper: z.string().optional()
});

export const kpiPeriodSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  kpis: z.array(kpiSchema),
  monthlyHighlights: z.array(z.string()).optional(),
  thisMonthActions: z.array(z.string()).optional(),
  nextMonthActions: z.array(z.string()).optional()
});

export const initiativeSchema = z.object({
  title: z.string().min(1),
  status: z.enum(['active', 'paused', 'monitoring', 'planning']),
  details: z.string().min(1)
});

export const ecommerceSchema = z
  .object({
    revenue: z.string().optional().default(""),
    conversionRate: z.string().optional().default(""),
    returningCustomers: z.string().optional().default(""),
    topProduct: z.string().optional().default(""),
    avgOrderValue: z.string().optional().default(""),
    cartAbandonment: z.string().optional().default("")
  })
  .optional();

export const adsSchema = z
  .object({
    spend: z.string().optional().default(""),
    roas: z.string().optional().default(""),
    cpa: z.string().optional().default(""),
    impressions: z.string().optional().default(""),
    ctr: z.string().optional().default(""),
    bestChannel: z.string().optional().default("")
  })
  .optional();

export const clientPayloadSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  industry: z.string().min(1),
  summary: z.string().min(1),
  kpiPeriods: z.array(kpiPeriodSchema),
  monthlyHighlights: z.array(z.string()),
  thisMonthActions: z.array(z.string()),
  nextMonthActions: z.array(z.string()),
  initiatives: z.array(initiativeSchema),
  ecommerce: ecommerceSchema,
  ads: adsSchema
});

export type ClientPayload = z.infer<typeof clientPayloadSchema>;
