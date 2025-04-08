// src/tools/get_characters/index.ts
import { CharacterDataWrapperSchema } from "../schemas.js";
import { httpRequest, serializeQueryParams } from "../../utils.js";
import { GetCharactersSchema } from "./schemas.js";
import { markdownInstructions } from "../../instructions.js";

export const get_characters = {
    description: `Fetch Marvel characters with optional filters. ${markdownInstructions}`,
    schema: GetCharactersSchema,
    handler: async (args: any) => {
        const argsParsed = GetCharactersSchema.parse(args);
        const res = await httpRequest('/characters', serializeQueryParams(argsParsed));
        return CharacterDataWrapperSchema.parse(res);
    }
};