import { cookies } from 'next/headers';

export const maxDuration = 30;

const BACKEND_API = process.env.API_URL || 'http://127.0.0.1:8000/api/v1';
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

interface ToolCall {
    id: string;
    type: string;
    function: { name: string; arguments: string };
}

async function executeTool(name: string, args: Record<string, unknown>, token: string) {
    switch (name) {
        case 'searchMedia': {
            const url = new URL(`${BACKEND_API}/media/search`);
            url.searchParams.set('query', args.query as string);
            const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) return { results: [], error: 'Failed to search media.' };
            const data = await res.json();
            return { results: data.results?.slice(0, 3) || [], error: null };
        }
        case 'getUserLibrary': {
            const res = await fetch(`${BACKEND_API}/watchlist`, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) return { library: [], error: 'Failed to fetch user library.' };
            const data = await res.json();
            return { library: data.map((item: any) => ({ title: item.title, mediaType: item.mediaType, status: item.status, year: item.year })), error: null };
        }
        case 'addToLibrary': {
            const res = await fetch(`${BACKEND_API}/watchlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ title: args.title, mediaType: args.mediaType, year: args.year, status: args.status, notes: args.notes }),
            });
            if (!res.ok) { const err = await res.json(); return { success: false, item: null, error: err.detail || 'Failed to add item.' }; }
            const data = await res.json();
            return { success: true, item: data, error: null };
        }
        default:
            return { error: `Unknown tool: ${name}` };
    }
}

const TOOLS = [
    {
        type: 'function',
        function: {
            name: 'searchMedia',
            description: 'Search for a movie, tv show, or anime title to get its exact details (type, year, overview).',
            parameters: {
                type: 'object',
                properties: { query: { type: 'string', description: 'The title to search for.' } },
                required: ['query'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'getUserLibrary',
            description: 'Fetch the user\'s current watchlist/library to see what they have watched or want to watch.',
            parameters: { type: 'object', properties: {}, required: [] },
        },
    },
    {
        type: 'function',
        function: {
            name: 'addToLibrary',
            description: 'Add a specific movie, tv show, or anime to the user\'s library.',
            parameters: {
                type: 'object',
                properties: {
                    title: { type: 'string', description: 'The exact title of the media.' },
                    mediaType: { type: 'string', description: 'The type of media: movie, tv, or anime.' },
                    year: { type: 'number', description: 'The release year.' },
                    status: { type: 'string', description: 'The status: watched, pending, or wishlist.' },
                    notes: { type: 'string', description: 'A short AI-generated review or trivia.' },
                },
                required: ['title', 'mediaType', 'year', 'status'],
            },
        },
    },
];

const SYSTEM_PROMPT = `You are Vault Intelligence, a premium, highly knowledgeable film critic and personal media library manager. Your goal is to help the user discover amazing content, organize their library, and provide personalized recommendations.

CAPABILITIES & INSTRUCTIONS:

1. **Semantic & Vibe Search**: If a user asks for "that movie about dreams" or "a sad movie about space", first use your own internal knowledge to identify the exact movie title (e.g. Inception, Interstellar). Then, use the searchMedia tool with that exact title to get the TMDB details.

2. **Adding to Library**: ONLY use the addToLibrary tool when the user EXPLICITLY asks you to add something (e.g. "add this to my list", "put it in my library", "add to my watchlist"). NEVER add items proactively or on your own initiative. When you do add, provide a short, engaging 1-2 sentence personalized review or trivia in the notes field.

3. **Recommendations**: If a user asks for recommendations based on their taste, use the getUserLibrary tool to analyze their current watchlist (pay attention to genres and highly rated/watched items). Then suggest 2-3 NEW items they haven't seen yet, explaining exactly why they will like them based on their library.

BEHAVIOR:
- Never apologize excessively. Be confident, concise, and sophisticated.
- Do not narrate your tool usage (don't say "I will now search for..."). Just do it.
- Format your text beautifully using markdown (bolding titles, using bullet points).`;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        return new Response('Unauthorized', { status: 401 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
        return new Response('Missing DEEPSEEK_API_KEY', { status: 500 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            try {
                let conversation = [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...messages,
                ];

                let keepGoing = true;
                while (keepGoing) {
                    const apiRes = await fetch(DEEPSEEK_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${apiKey}`,
                        },
                        body: JSON.stringify({
                            model: 'deepseek-chat',
                            messages: conversation,
                            tools: TOOLS,
                            stream: true,
                        }),
                    });

                    if (!apiRes.ok) {
                        const errBody = await apiRes.text();
                        console.error('DeepSeek API error:', apiRes.status, errBody);
                        controller.enqueue(encoder.encode(`[Error: DeepSeek API returned ${apiRes.status}]`));
                        break;
                    }

                    const reader = apiRes.body!.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '';
                    let assistantMessage = '';
                    const toolCalls: ToolCall[] = [];

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        buffer += decoder.decode(value, { stream: true });

                        const lines = buffer.split('\n');
                        buffer = lines.pop() || '';

                        for (const line of lines) {
                            const trimmed = line.trim();
                            if (!trimmed || !trimmed.startsWith('data: ')) continue;
                            const data = trimmed.slice(6);
                            if (data === '[DONE]') continue;

                            try {
                                const parsed = JSON.parse(data);
                                const delta = parsed.choices?.[0]?.delta;
                                if (!delta) continue;

                                if (delta.content) {
                                    assistantMessage += delta.content;
                                    controller.enqueue(encoder.encode(delta.content));
                                }

                                if (delta.tool_calls) {
                                    for (const tc of delta.tool_calls) {
                                        const idx = tc.index;
                                        if (!toolCalls[idx]) {
                                            toolCalls[idx] = {
                                                id: tc.id || '',
                                                type: 'function',
                                                function: { name: tc.function?.name || '', arguments: '' },
                                            };
                                        }
                                        if (tc.id) toolCalls[idx].id = tc.id;
                                        if (tc.function?.name) toolCalls[idx].function.name = tc.function.name;
                                        if (tc.function?.arguments) toolCalls[idx].function.arguments += tc.function.arguments;
                                    }
                                }
                            } catch {}
                        }
                    }

                    if (toolCalls.length === 0) {
                        keepGoing = false;
                        break;
                    }

                    conversation.push({ role: 'assistant', content: assistantMessage || null, tool_calls: toolCalls.map(tc => ({ id: tc.id, type: 'function', function: tc.function })) } as any);

                    for (const tc of toolCalls) {
                        try {
                            const args = JSON.parse(tc.function.arguments);
                            const result = await executeTool(tc.function.name, args, token);
                            const resultStr = JSON.stringify(result);
                            conversation.push({ role: 'tool', tool_call_id: tc.id, content: resultStr });
                        } catch (e) {
                            conversation.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify({ error: String(e) }) });
                        }
                    }
                }
            } catch (e: any) {
                console.error('Chat error:', e);
                controller.enqueue(encoder.encode(`[Error: ${e.message}]`));
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' },
    });
}
