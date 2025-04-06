import { 
    CharacterDataWrapperSchema, 
    ComicDataWrapperSchema, 
    GenerateComicsHtmlSchema, 
    GetCharacterByIdSchema, 
    GetCharactersSchema, 
    GetComicByIdSchema, 
    GetComicCharactersSchema, 
    GetComicsForCharacterSchema, 
    GetComicsSchema, 
    HtmlResponseSchema
} from "./schemas.js";
import { generateComicsHtml, httpRequest, serializeQueryParams } from "./utils.js";

export const marvelTools = {
    get_characters: {
        description: 'Fetch Marvel characters with optional filters',
        schema: GetCharactersSchema,
        handler: async (args: any) => {
            const argsParsed = GetCharactersSchema.parse(args);
            const res = await httpRequest('/characters', serializeQueryParams(argsParsed));
            return CharacterDataWrapperSchema.parse(res);
        }
    },
    get_character_by_id: {
        description: 'Fetch a Marvel character by ID',
        schema: GetCharacterByIdSchema,
        handler: async (args: any) => {
            const argsParsed = GetCharacterByIdSchema.parse(args);
            const res = await httpRequest(`/characters/${argsParsed.characterId}`);
            return CharacterDataWrapperSchema.parse(res);
        }
    },
    get_comics_for_character: {
        description: 'Fetch Marvel comics filtered by character ID and optional filters',
        schema: GetComicsForCharacterSchema,
        handler: async (args: any) => {
            const { characterId, ...rest } = GetComicsForCharacterSchema.parse(args);
            const res = await httpRequest(`/characters/${characterId}/comics`, serializeQueryParams(rest));
            return ComicDataWrapperSchema.parse(res);
        }
    },
    get_comics: {
        description: 'Fetches lists of Marvel comics with optional filters',
        schema: GetComicsSchema,
        handler: async (args: any) => {
            const argsParsed = GetComicsSchema.parse(args);
            const res = await httpRequest(`/comics`, serializeQueryParams(argsParsed));
            return ComicDataWrapperSchema.parse(res);
        }
    },
    get_comic_by_id: {
        description: 'Fetch a single Marvel comic by ID',
        schema: GetComicByIdSchema,
        handler: async (args: any) => {
            const argsParsed = GetComicByIdSchema.parse(args);
            const res = await httpRequest(`/comics/${argsParsed.comicId}`);
            return ComicDataWrapperSchema.parse(res);
        }
    },
    get_characters_for_comic: {
        description: 'Fetch Marvel characters for a given comic',
        schema: GetComicCharactersSchema,
        handler: async (args: any) => {
            const { comicId, ...rest } = GetComicCharactersSchema.parse(args);
            const res = await httpRequest(`/comics/${comicId}/characters`, serializeQueryParams(rest));
            return CharacterDataWrapperSchema.parse(res);
        }
    },
    // generate_comics_html: {
    //     description: 'Create an HTML page displaying Marvel comics with their images',
    //     schema: GenerateComicsHtmlSchema,
    //     handler: async (args: any) => {
    //         const argsParsed = GenerateComicsHtmlSchema.parse(args);
    //         const pageTitle = argsParsed.title || 'Marvel Comics';
            
    //         // Remove title from query parameters
    //         const { title, ...queryParams } = argsParsed;
            
    //         // Fetch comics data from Marvel API
    //         const res = await httpRequest(`/comics`, serializeQueryParams(queryParams));
    //         const comicsData = ComicDataWrapperSchema.parse(res);
            
    //         // Generate HTML
    //         const html = generateComicsHtml(comicsData.data.results, pageTitle);
            
    //         // Return both the HTML and metadata about the result
    //         return HtmlResponseSchema.parse({
    //             html,
    //             count: comicsData.data.count,
    //             total: comicsData.data.total,
    //             message: `Generated HTML view for ${comicsData.data.count} comics (out of ${comicsData.data.total} total matches)`
    //         });
    //     }
    // }
};

export type ToolName = keyof typeof marvelTools;