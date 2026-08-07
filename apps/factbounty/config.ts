import { z } from 'zod';

export const ConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  FACTBOUNTY_DEMO_MODE: z.union([z.boolean(), z.string()]).transform(val => {
    if (typeof val === 'boolean') return val;
    if (val === 'false' || val === '0') return false;
    return Boolean(val);
  }).default(true),
  FACTBOUNTY_JWT_SECRET: z.string().min(16).default('factbounty_development_jwt_secret_32bytes_min'),
  FACTBOUNTY_PUBLIC_BASE_URL: z.string().url().default('http://localhost:3000'),
  FACTBOUNTY_DATA_PATH: z.string().optional(),
  PAYMENT_PROVIDER: z.enum(['simulator', 'stripe']).default('simulator'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().default('us-east-1'),
  S3_ENDPOINT: z.string().optional(),
  S3_PUBLIC_BASE_URL: z.string().optional()
});

export type FactBountyConfig = z.infer<typeof ConfigSchema>;

export function loadConfig(env: Record<string, string | undefined> = process.env): FactBountyConfig {
  const parsed = ConfigSchema.safeParse(env);
  if (!parsed.success) {
    console.error('Invalid FactBounty Environment Configuration:', parsed.error.format());
    throw new Error('FactBounty startup failed: Invalid environment configuration.');
  }
  return parsed.data;
}
