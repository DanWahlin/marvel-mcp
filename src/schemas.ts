import { z } from 'zod';

// Schemas
export const GetCharactersSchema = z.object({
    name: z.string().optional(),
    nameStartsWith: z.string().optional(),
    modifiedSince: z.string().optional(),
    comics: z.string().optional(),
    series: z.string().optional(),
    events: z.string().optional(),
    stories: z.string().optional(),
    orderBy: z.string().optional(),
    limit: z.number().min(1).max(100).optional(),
    offset: z.number().optional(),
});

export const GetCharacterByIdSchema = z.object({
    characterId: z.number(),
});

export const UrlSchema = z.object({
    type: z.string(),
    url: z.string().url(),
});

export const ImageSchema = z.object({
    path: z.string(),
    extension: z.string(),
});

export const ComicSummarySchema = z.object({
    resourceURI: z.string(),
    name: z.string(),
});

export const StorySummarySchema = z.object({
    resourceURI: z.string(),
    name: z.string(),
    type: z.string(),
});

export const EventSummarySchema = z.object({
    resourceURI: z.string(),
    name: z.string(),
});

export const SeriesSummarySchema = z.object({
    resourceURI: z.string(),
    name: z.string(),
});

export const ListSchema = (itemSchema: z.ZodTypeAny) => z.object({
    available: z.number(),
    returned: z.number(),
    collectionURI: z.string(),
    items: z.array(itemSchema),
});

export const CharacterSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    modified: z.string(),
    resourceURI: z.string(),
    urls: z.array(UrlSchema),
    thumbnail: ImageSchema,
    comics: ListSchema(ComicSummarySchema),
    stories: ListSchema(StorySummarySchema),
    events: ListSchema(EventSummarySchema),
    series: ListSchema(SeriesSummarySchema),
});

export const CharacterDataContainerSchema = z.object({
    offset: z.number(),
    limit: z.number(),
    total: z.number(),
    count: z.number(),
    results: z.array(CharacterSchema),
});

export const CharacterDataWrapperSchema = z.object({
    code: z.number(),
    status: z.string(),
    copyright: z.string(),
    attributionText: z.string(),
    attributionHTML: z.string(),
    data: CharacterDataContainerSchema,
    etag: z.string(),
});