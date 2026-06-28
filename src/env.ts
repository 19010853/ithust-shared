import dotenv from 'dotenv';

interface LoadEnvOptions {
  paths?: string[];
}

export function loadEnv(options?: LoadEnvOptions): void {
  if (options?.paths && options.paths.length > 0) {
    for (const path of options.paths) {
      const result = dotenv.config({ path });
      if (!result.error) break;
    }
  } else {
    dotenv.config();
  }
}

export function stripInlineComment(value: string | undefined): string {
  if (!value) return '';
  return value.split(/\s+#/)[0].trim();
}

export function parseCsv(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}
