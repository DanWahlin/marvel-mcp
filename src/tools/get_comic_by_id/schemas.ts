// src/tools/get_comic_by_id/schemas.ts
import { z } from 'zod';

export const GetComicByIdSchema = z.object({
  comicId: z.number(),
});