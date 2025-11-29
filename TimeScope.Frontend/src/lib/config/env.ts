/**
 * Environment variables configuration and validation
 * Uses Zod for type-safe environment variable validation
 */

import { z } from 'zod';

/**
 * Schema for environment variables validation
 * Ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  /** Base URL for the API backend */
  VITE_API_URL: z.string().url().default('http://localhost:8080/api'),

  /** Application environment (development, staging, production) */
  MODE: z.enum(['development', 'production', 'test']).default('development'),

  /** Enable development mode features */
  DEV: z.boolean().default(true),

  /** Enable production mode optimizations */
  PROD: z.boolean().default(false),
});

/**
 * Validates and exports environment variables
 * Throws an error if validation fails with detailed error messages
 */
function validateEnv() {
  try {
    return envSchema.parse({
      VITE_API_URL: import.meta.env.VITE_API_URL,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`)
        .join('\n');

      throw new Error(
        `Environment variable validation failed:\n${missingVars}\n\n` +
        'Please check your .env file and ensure all required variables are set.'
      );
    }
    throw error;
  }
}

/**
 * Validated environment variables
 * Use this instead of import.meta.env for type safety
 */
export const env = validateEnv();

/**
 * Type for environment variables
 */
export type Env = z.infer<typeof envSchema>;
