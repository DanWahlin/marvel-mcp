// src/tools/get_comic_by_id/index.ts
import { ComicDataWrapperSchema } from "../schemas.js";
import { httpRequest } from "../../utils.js";
import { GetComicByIdSchema } from "./schemas.js";
import { markdownInstructions } from "../../instructions.js";

export const get_comic_by_id = {
    description: `Fetch a single Marvel comic by ID. ${markdownInstructions}`,
    schema: GetComicByIdSchema,
    handler: async (args: any) => {
        const argsParsed = GetComicByIdSchema.parse(args);
        const res = await httpRequest(`/comics/${argsParsed.comicId}`);
        return ComicDataWrapperSchema.parse(res);
    }
};