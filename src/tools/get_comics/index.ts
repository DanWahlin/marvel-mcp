// src/tools/get_comics/index.ts
import { ComicDataWrapperSchema } from "../schemas.js";
import { httpRequest, serializeQueryParams } from "../../utils.js";
import { GetComicsSchema } from "./schemas.js";
import { markdownInstructions } from "../../instructions.js";

export const get_comics = {
    description: `Fetches lists of Marvel comics with optional filters. ${markdownInstructions}`,
    schema: GetComicsSchema,
    handler: async (args: any) => {
        const argsParsed = GetComicsSchema.parse(args);
        const res = await httpRequest(`/comics`, serializeQueryParams(argsParsed));
        return ComicDataWrapperSchema.parse(res);
    }
};