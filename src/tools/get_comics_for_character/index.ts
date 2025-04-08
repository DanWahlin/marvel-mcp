// src/tools/get_comics_for_character/index.ts
import { ComicDataWrapperSchema } from "../schemas.js";
import { httpRequest, serializeQueryParams } from "../../utils.js";
import { GetComicsForCharacterSchema } from "./schemas.js";
import { markdownInstructions } from "../../instructions.js";

export const get_comics_for_character = {
    description: `Fetch Marvel comics filtered by character ID and optional filters. ${markdownInstructions}`,
    schema: GetComicsForCharacterSchema,
    handler: async (args: any) => {
        const { characterId, ...rest } = GetComicsForCharacterSchema.parse(args);
        const res = await httpRequest(`/characters/${characterId}/comics`, serializeQueryParams(rest));
        return ComicDataWrapperSchema.parse(res);
    }
};