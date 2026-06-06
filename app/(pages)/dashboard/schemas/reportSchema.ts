import { z } from 'zod';

export const createReportSchema = z.object({
  title: z
    .string()
    .min(3, 'Judul minimal 3 karakter')
    .max(100, 'Judul maksimal 100 karakter'),
  type: z.enum(['COMPLAINT', 'SUGGESTION'] as const),
  description: z
    .string()
    .min(10, 'Deskripsi minimal 10 karakter')
    .max(1000, 'Deskripsi maksimal 1000 karakter'),
});

export type CreateReportFormData = z.infer<typeof createReportSchema>;
