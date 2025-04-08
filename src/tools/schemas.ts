import { z } from 'zod';

// Shared schema components
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

export const ListSchema = (itemSchema: z.ZodTypeAny) =>
  z.object({
    available: z.number(),
    returned: z.number(),
    collectionURI: z.string(),
    items: z.array(itemSchema),
  });

// Character schema
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

// Schema for text objects associated with comics (e.g., descriptions)
const TextObjectSchema = z.object({
  type: z.string(),
  language: z.string(),
  text: z.string(),
});

// Schema for date objects associated with comics
const ComicDateSchema = z.object({
  type: z.string(),
  date: z.string(),
});

// Schema for price objects associated with comics
const ComicPriceSchema = z.object({
  type: z.string(),
  price: z.number(),
});

// Schema for creators associated with comics
const CreatorSummarySchema = z.object({
  resourceURI: z.string().url(),
  name: z.string(),
  role: z.string(),
});

const CreatorListSchema = z.object({
  available: z.number(),
  returned: z.number(),
  collectionURI: z.string().url(),
  items: z.array(CreatorSummarySchema),
});

// Schema for characters appearing in comics
const CharacterSummarySchema = z.object({
  resourceURI: z.string().url(),
  name: z.string(),
  role: z.string().optional(),
});

const CharacterListSchema = z.object({
  available: z.number(),
  returned: z.number(),
  collectionURI: z.string().url(),
  items: z.array(CharacterSummarySchema),
});

const StoryListSchema = z.object({
  available: z.number(),
  returned: z.number(),
  collectionURI: z.string().url(),
  items: z.array(StorySummarySchema),
});

const EventListSchema = z.object({
  available: z.number(),
  returned: z.number(),
  collectionURI: z.string().url(),
  items: z.array(EventSummarySchema),
});

// Schema for comic resources
const ComicSchema = z.object({
  id: z.number(),
  digitalId: z.number(),
  title: z.string(),
  issueNumber: z.number(),
  variantDescription: z.string(),
  description: z.string().nullable(),
  modified: z.string(),
  isbn: z.string(),
  upc: z.string(),
  diamondCode: z.string(),
  ean: z.string(),
  issn: z.string(),
  format: z.string(),
  pageCount: z.number(),
  textObjects: z.array(TextObjectSchema),
  resourceURI: z.string().url(),
  urls: z.array(UrlSchema),
  series: SeriesSummarySchema,
  variants: z.array(ComicSummarySchema),
  collections: z.array(ComicSummarySchema),
  collectedIssues: z.array(ComicSummarySchema),
  dates: z.array(ComicDateSchema),
  prices: z.array(ComicPriceSchema),
  thumbnail: ImageSchema,
  images: z.array(ImageSchema),
  creators: CreatorListSchema,
  characters: CharacterListSchema,
  stories: StoryListSchema,
  events: EventListSchema,
});

// Schema for the data container holding comic resources
const ComicDataContainerSchema = z.object({
  offset: z.number(),
  limit: z.number(),
  total: z.number(),
  count: z.number(),
  results: z.array(ComicSchema),
});

// Schema for the entire response from the /v1/public/comics endpoint
export const ComicDataWrapperSchema = z.object({
  code: z.number(),
  status: z.string(),
  copyright: z.string(),
  attributionText: z.string(),
  attributionHTML: z.string(),
  data: ComicDataContainerSchema,
  etag: z.string(),
});

// Shared HTML response schema
export const HtmlResponseSchema = z.object({
  html: z.string(),
  count: z.number(),
  total: z.number(),
  message: z.string()
});

