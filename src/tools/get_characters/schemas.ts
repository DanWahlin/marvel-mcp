// src/tools/get_characters/schemas.ts
import { z } from 'zod';

export const GetCharactersSchema = z.object({
  name: z.string().optional(),
  nameStartsWith: z.string().optional(),
  modifiedSince: z.string().optional(),
  comics: z.string().optional(),
  series: z.string().optional(),
  events: z.string().optional(),
  stories: z.string().optional(),
  orderBy: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().optional(),
});