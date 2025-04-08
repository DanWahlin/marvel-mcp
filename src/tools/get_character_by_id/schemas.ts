// src/tools/get_character_by_id/schemas.ts
import { z } from 'zod';

export const GetCharacterByIdSchema = z.object({
  characterId: z.number(),
});