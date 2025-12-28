import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { getCollection } from '@/lib/discogs';
import { createCollectionTools } from '@/lib/tools';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Fetch the user's collection
  const collection = await getCollection();

  // Create tools with the collection data
  const tools = createCollectionTools(collection);

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `You are a helpful assistant that knows everything about the user's vinyl/music collection on Discogs.
You have access to their complete collection of ${collection.length} albums.

When users ask about their collection, use the available tools to search and find albums.
Be conversational and enthusiastic about music. You can make recommendations, find connections between albums,
and help them rediscover gems in their collection.

When you find albums, describe them briefly and mention interesting details like the year, genre, or label.
If a search returns many results, summarize them and highlight a few notable ones.

Always respond in a friendly, music-lover tone. Feel free to ask follow-up questions about their taste.`,
    messages,
    tools,
  });

  return result.toUIMessageStreamResponse();
}
