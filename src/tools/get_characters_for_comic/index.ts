// src/tools/get_characters_for_comic/index.ts
import { CharacterDataWrapperSchema } from "../schemas.js";
import { httpRequest, serializeQueryParams } from "../../utils.js";
import { GetComicCharactersSchema } from "./schemas.js";
import { markdownInstructions } from "../../instructions.js";

export const get_characters_for_comic = {
    description: `Fetch Marvel characters for a given comic. ${markdownInstructions}`,
    schema: GetComicCharactersSchema,
    handler: async (args: any) => {
        const { comicId, ...rest } = GetComicCharactersSchema.parse(args);
        const res = await httpRequest(`/comics/${comicId}/characters`, serializeQueryParams(rest));
        return CharacterDataWrapperSchema.parse(res);
    }
};