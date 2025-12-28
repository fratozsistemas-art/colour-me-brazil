import { z } from 'zod';

const envSchema = z.object({
  VITE_BASE44_APP_ID: z.string().min(1),
  VITE_BASE44_SERVER_URL: z.string().url(),
  VITE_BASE44_FUNCTIONS_VERSION: z.string().default('v1'),
  VITE_ENABLE_ANALYTICS: z.string().optional(),
});

export const validateEnv = () => {
  const parsed = envSchema.safeParse(import.meta.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => issue.message).join(', ');
    throw new Error(`Invalid environment configuration: ${issues}`);
  }
  return parsed.data;
};
