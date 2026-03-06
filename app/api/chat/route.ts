import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const BACKEND_API = process.env.API_URL || 'http://127.0.0.1:8000/api/v1';

export async function POST(req: Request) {
    const { messages } = await req.json();

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        return new Response('Unauthorized', { status: 401 });
    }

    const google = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    const result = streamText({
        model: google('gemini-1.5-flash'),
        system: `You are Vault Intelligence, a premium, highly knowledgeable film critic and personal media library manager. Your goal is to help the user discover amazing content, organize their library, and provide personalized recommendations.
    
    CAPABILITIES & INSTRUCTIONS:
    
    1. **Semantic & Vibe Search**: If a user asks for "that movie about dreams" or "a sad movie about space", first use your own internal knowledge to identify the exact movie title (e.g. Inception, Interstellar). Then, use the \`searchMedia\` tool with that exact title to get the TMDB details.
    
    2. **Adding to Library & AI Reviews**: When adding a movie/show to the user's library, you MUST provide a short, engaging, 1-2 sentence personalized review or interesting trivia in the \`notes\` field of the \`addToLibrary\` tool. Make it sound premium and insightful.
    
    3. **Recommendations**: If a user asks for recommendations based on their taste, use the \`getUserLibrary\` tool to analyze their current watchlist (pay attention to genres and highly rated/watched items). Then suggest 2-3 NEW items they haven't seen yet, explaining exactly why they will like them based on their library.
    
    BEHAVIOR:
    - Never apologize excessively. Be confident, concise, and sophisticated.
    - Do not narrate your tool usage (don't say "I will now search for..."). Just do it.
    - Format your text beautifully using markdown (bolding titles, using bullet points).`,
        messages,
        tools: {
            searchMedia: tool({
                description: 'Search for a movie, tv show, or anime title to get its exact details (type, year, overview).',
                parameters: z.object({
                    query: z.string().describe('The title to search for.'),
                    type: z.enum(['movie', 'tv', 'anime']).optional().describe('The type of media. Optional but helpful.'),
                }),
                execute: async ({ query, type }: { query: string; type?: 'movie' | 'tv' | 'anime' }) => {
                    const url = new URL(`${BACKEND_API}/media/search`);
                    url.searchParams.set('query', query);
                    if (type) url.searchParams.set('type', type);

                    const res = await fetch(url.toString(), {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (!res.ok) {
                        return { error: 'Failed to search media.' };
                    }
                    const data = await res.json();
                    // Return top 3 matches to the AI
                    return { results: data.results?.slice(0, 3) || [] };
                },
            }),
            getUserLibrary: tool({
                description: 'Fetch the user\'s current watchlist/library to see what they have watched or want to watch. Use this to provide personalized recommendations.',
                parameters: z.object({}),
                execute: async () => {
                    const res = await fetch(`${BACKEND_API}/watchlist`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (!res.ok) {
                        return { error: 'Failed to fetch user library.' };
                    }
                    const data = await res.json();
                    // Return a simplified summary to avoid overwhelming the token limit
                    const summary = data.map((item: any) => ({
                        title: item.title,
                        mediaType: item.mediaType,
                        status: item.status,
                        year: item.year
                    }));
                    return { library: summary };
                },
            }),
            addToLibrary: tool({
                description: 'Add a specific movie, tv show, or anime to the user\'s library.',
                parameters: z.object({
                    title: z.string().describe('The exact title of the media.'),
                    mediaType: z.enum(['movie', 'tv', 'anime']).describe('The type of media.'),
                    year: z.number().optional().describe('The release year. Always provide this if known.'),
                    status: z.enum(['watched', 'pending', 'wishlist']).describe('The status to assign. Default to "wishlist" if user just says "add to my list".'),
                    notes: z.string().optional().describe('A short, engaging AI-generated review or trivia about this media.')
                }),
                execute: async ({ title, mediaType, year, status, notes }: { title: string; mediaType: 'movie' | 'tv' | 'anime'; year?: number; status: 'watched' | 'pending' | 'wishlist'; notes?: string }) => {
                    const res = await fetch(`${BACKEND_API}/watchlist`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            title,
                            mediaType,
                            year,
                            status,
                            notes
                        })
                    });

                    if (!res.ok) {
                        const err = await res.json();
                        return { success: false, error: err.detail || 'Failed to add item.' };
                    }

                    const data = await res.json();
                    return { success: true, item: data };
                },
            })
        },
    });

    return result.toTextStreamResponse();
}
