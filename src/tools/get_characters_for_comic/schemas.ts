// src/tools/get_characters_for_comic/schemas.ts
import { z } from 'zod';
import { GetComicByIdSchema } from '../get_comic_by_id/schemas.js';

export const GetComicCharactersSchema = GetComicByIdSchema.extend({
  name: z.string().optional(),
  nameStartsWith: z.string().optional(),
  modifiedSince: z.string().optional(),
  series: z.string().optional(),
  events: z.string().optional(),
  stories: z.string().optional(),
  orderBy: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().optional(),
});