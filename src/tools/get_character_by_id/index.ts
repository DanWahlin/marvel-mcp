// src/tools/get_character_by_id/index.ts
import { CharacterDataWrapperSchema } from "../schemas.js";
import { httpRequest } from "../../utils.js";
import { GetCharacterByIdSchema } from "./schemas.js";
import { markdownInstructions } from "../../instructions.js";

export const get_character_by_id = {
    description: `Fetch a Marvel character by ID.  ${markdownInstructions}`,
    schema: GetCharacterByIdSchema,
    handler: async (args: any) => {
        const argsParsed = GetCharacterByIdSchema.parse(args);
        const res = await httpRequest(`/characters/${argsParsed.characterId}`);
        return CharacterDataWrapperSchema.parse(res);
    }
};