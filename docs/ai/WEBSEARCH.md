# Web Search with OpenAI Built-in Tool

## Overview

KimuntuPro AI uses OpenAI's built-in `web_search` tool via the Responses API to provide up-to-date information retrieval. This eliminates the need for third-party search providers like Tavily, Serp, or Bing.

## How It Works

### 1. Built-in Tool Integration

The OpenAI Responses API includes a native `web_search` tool that can be enabled by passing it in the tools array:

```typescript
import { OpenAIClient, buildWebSearchTools } from '@kimuntupro/ai-core';

const client = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
});

const tools = buildWebSearchTools();
// Returns: [{ type: "web_search" }]
```

### 2. Usage Patterns

#### A. Direct Programmatic Search

For programmatic searches initiated by the planner/executor:

```typescript
import { OpenAIClient, webSearch } from '@kimuntupro/ai-core';

const client = new OpenAIClient();

const result = await webSearch(client, {
  query: 'latest trends in AI 2025',
  n: 8, // max results (1-10)
  tenantId: 'business-123',
  userId: 'user-456',
});

console.log(result);
// {
//   query: 'latest trends in ai 2025',
//   results: [
//     {
//       title: 'AI Trends 2025: What to Expect',
//       snippet: 'The AI landscape is evolving rapidly...',
//       url: 'https://example.com/ai-trends-2025'
//     },
//     // ... more results
//   ],
//   cached?: boolean // true if returned from cache
// }
```

#### B. As a Tool in chatWithTools()

For AI-driven tool usage where the model decides when to search:

```typescript
import { OpenAIClient, buildWebSearchToolSpec } from '@kimuntupro/ai-core';

const client = new OpenAIClient();
const { spec, handler } = buildWebSearchToolSpec(client);

const response = await client.chatWithTools({
  messages: [
    { role: 'user', content: 'What are the latest AI trends in 2025?' },
  ],
  tools: [spec],
  toolHandlers: {
    web_search: handler,
  },
});

console.log(response.text);
// Model decides to call web_search and includes citations
```

#### C. In the Executor (Stage B)

The executor automatically enables web search when `plan.requires_web_search === true`:

```typescript
// In executor logic:
if (plan.requires_web_search) {
  // Include web search tool
  const tools = buildWebSearchTools();

  // Optionally pre-fetch web context
  const webContext = await webSearch(client, {
    query: extractedQuery,
    tenantId,
    userId,
  });

  // Combine RAG + Web context for generation
  const finalAnswer = await client.chat({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `RAG context: ${ragContext}\n\nWeb context: ${webContext}\n\nUser query: ${query}` },
    ],
  });
}
```

## Environment Configuration

Add these variables to your `.env` file:

```bash
# Web Search Configuration (OpenAI Built-in)
OPENAI_WEB_SEARCH_ENABLED=true           # Feature flag
OPENAI_WEB_SEARCH_MAX_RESULTS=8          # Max results per search (1-10)
WEBSEARCH_RATE_LIMIT=100                 # Requests per minute per tenant
WEBSEARCH_CACHE_TTL_SEC=300              # Cache TTL in seconds (5 minutes)
WEBSEARCH_BLOCKLIST=                     # Comma-separated blocked domains
WEBSEARCH_ALLOWLIST=                     # Comma-separated allowed domains (if set, only these)
```

### Feature Flag

- `OPENAI_WEB_SEARCH_ENABLED=true`: Enables web search (default)
- `OPENAI_WEB_SEARCH_ENABLED=false`: Disables web search, throws error if called

### Rate Limiting

- Per-tenant rate limiting using token bucket algorithm
- `WEBSEARCH_RATE_LIMIT`: Number of requests per minute per tenant
- Prevents abuse and controls costs

### Caching

- In-memory LRU cache with TTL
- `WEBSEARCH_CACHE_TTL_SEC`: How long to cache results (default: 5 minutes)
- Queries are normalized (lowercase, trim, collapse whitespace) for cache keys
- Reduces redundant API calls and improves response time

### Content Filtering

#### Blocklist

Block specific domains from results:

```bash
WEBSEARCH_BLOCKLIST=spam.com,unreliable.com
```

#### Allowlist

Only allow specific domains (more restrictive):

```bash
WEBSEARCH_ALLOWLIST=trustworthy.com,verified.org
```

## API Reference

### `webSearch(client, options)`

Perform a web search using OpenAI's built-in tool.

**Parameters:**
- `client: OpenAIClient` - OpenAI client instance
- `options: WebSearchOptions`
  - `query: string` - Search query (max 500 chars)
  - `n?: number` - Max results (1-10, default: 8)
  - `tenantId: string` - Tenant ID for rate limiting
  - `userId: string` - User ID for tracking

**Returns:** `Promise<WebSearchResponse>`
- `query: string` - Normalized query
- `results: WebSearchResult[]` - Array of results
  - `title: string` - Result title
  - `snippet: string` - Result snippet/description
  - `url: string` - Result URL
- `cached?: boolean` - True if returned from cache

**Throws:**
- Error if web search is disabled
- Error if query is empty or too long
- Error if rate limit exceeded

### `buildWebSearchTools()`

Build tool definition array for OpenAI client.

**Returns:** `ChatCompletionTool[]`
- `[{ type: "web_search" }]`

### `buildWebSearchToolSpec(client)`

Build ToolSpec for use with `chatWithTools()`.

**Parameters:**
- `client: OpenAIClient` - OpenAI client instance

**Returns:** `{ spec: ToolSpec, handler: ToolHandler }`
- `spec`: Tool specification for OpenAI
- `handler`: Async function to execute the search

## Request/Response Examples

### Basic Search

**Request:**
```typescript
const result = await webSearch(client, {
  query: 'OpenAI GPT-4o features',
  n: 5,
  tenantId: 'tenant-123',
  userId: 'user-456',
});
```

**Response:**
```json
{
  "query": "openai gpt-4o features",
  "results": [
    {
      "title": "GPT-4o: OpenAI's New Flagship Model",
      "snippet": "GPT-4o brings multimodal capabilities including vision, audio, and text...",
      "url": "https://openai.com/index/hello-gpt-4o/"
    },
    {
      "title": "GPT-4o Features and Pricing",
      "snippet": "Explore the advanced features of GPT-4o, including improved reasoning...",
      "url": "https://example.com/gpt4o-features"
    }
  ]
}
```

### Cached Search

**Request (second time with same query):**
```typescript
const result = await webSearch(client, {
  query: 'OpenAI GPT-4o features',
  n: 5,
  tenantId: 'tenant-123',
  userId: 'user-456',
});
```

**Response:**
```json
{
  "query": "openai gpt-4o features",
  "results": [ /* same results */ ],
  "cached": true
}
```

### Rate Limited

**Request (after exceeding limit):**
```typescript
const result = await webSearch(client, {
  query: 'some query',
  tenantId: 'tenant-123',
  userId: 'user-456',
});
```

**Error:**
```
Error: Rate limit exceeded for tenant tenant-123. Please try again later.
```

## Cost Considerations

### Token Usage

Web search uses the underlying chat model (typically `gpt-4o-mini`) which incurs token costs:

- **Input tokens**: System prompt + user query
- **Output tokens**: Search results formatted as JSON/markdown
- **Tool invocation**: OpenAI handles the actual web search backend

**Typical costs per search:**
- Input: ~100-200 tokens
- Output: ~500-1000 tokens (depending on number of results)
- Estimated cost: $0.0001 - $0.0003 per search (with gpt-4o-mini)

### Cost Controls

1. **Rate Limiting**: Prevents runaway usage per tenant
2. **Caching**: Reduces redundant searches (5-minute TTL by default)
3. **Result Truncation**: Limit `n` parameter to cap output tokens
4. **Max Output Tokens**: Executor caps at 4000 tokens for web search calls

## Citations and Sources

When web search is used in the executor, results are tagged with citations:

```markdown
**Answer:**
According to recent reports, AI trends in 2025 include...

**Web sources:**
- [AI Trends 2025](https://example.com/ai-trends)
- [OpenAI GPT-4o Features](https://openai.com/gpt-4o)
```

## Limitations

1. **Model Dependency**: The model decides when to call the tool (in `chatWithTools` mode)
2. **Result Format**: Results are extracted from model output, which may vary
3. **No Real-time Guarantees**: Results depend on OpenAI's backend web crawling
4. **Rate Limits**: Subject to both our rate limits and OpenAI's API limits
5. **Cost**: Each search incurs LLM token costs (input + output)

## Testing

Run web search tests:

```bash
cd packages/ai-core
npm test tests/tools/openaiWebSearch.test.ts
```

Run all tools tests:

```bash
cd packages/ai-core
npm test tests/tools/
```

## Business Track Integration

Web search is fully integrated with Business Track features:

- **Usage Tracking**: `tenantId` and `userId` are required for all searches
- **Rate Limiting**: Per-tenant to prevent abuse
- **Cost Attribution**: Can be tracked via `onUsage` callback in `OpenAIClient`
- **Assistant Type**: Can differentiate between `plan`, `execute`, etc.

Example with usage tracking:

```typescript
const client = new OpenAIClient({
  onUsage: async (metrics) => {
    console.log('Web search usage:', {
      tenantId: 'tenant-123',
      userId: 'user-456',
      assistantType: 'execute',
      tool: 'web_search',
      tokensIn: metrics.tokensIn,
      tokensOut: metrics.tokensOut,
      costCents: metrics.costCents,
    });
  },
});
```

## Migration from Third-Party Providers

If migrating from Tavily, Serp, or Bing:

1. Remove API keys from `.env`
2. Update `.env` with OpenAI web search config (see above)
3. Replace provider-specific calls with `webSearch(client, options)`
4. Update rate limits and cache settings as needed
5. Test with your existing queries

**Benefits:**
- No third-party API keys required
- Unified billing with OpenAI
- Consistent model + tool experience
- Built-in caching and rate limiting
- Simpler maintenance

## Troubleshooting

### Web search disabled error

**Error:** `OpenAI web search is disabled. Set OPENAI_WEB_SEARCH_ENABLED=true`

**Solution:** Add `OPENAI_WEB_SEARCH_ENABLED=true` to your `.env` file.

### Rate limit exceeded

**Error:** `Rate limit exceeded for tenant {tenantId}. Please try again later.`

**Solution:**
- Wait for rate limit to reset (tokens refill per minute)
- Increase `WEBSEARCH_RATE_LIMIT` if needed
- Implement exponential backoff in client code

### Empty results

**Possible causes:**
1. Query too specific or obscure
2. All results filtered by blocklist/allowlist
3. OpenAI backend failure (check model's response)

**Solution:**
- Broaden query
- Review blocklist/allowlist settings
- Check error logs for underlying API failures

### Cache not working

**Check:**
1. Queries are normalized (case-insensitive, whitespace collapsed)
2. `WEBSEARCH_CACHE_TTL_SEC` is set (default: 300)
3. `n` parameter matches (cache key includes it)

## Future Enhancements

Potential improvements for future steps:

1. **Persistent Cache**: Redis/Memcached for multi-instance deployments
2. **Advanced Filtering**: Domain ranking, content quality scoring
3. **Parallel Searches**: Multiple queries in batch
4. **Result Summarization**: LLM-powered summary of top results
5. **Citation Tracking**: Detailed provenance for compliance
6. **Analytics Dashboard**: Search query trends, cost attribution

---

**Last Updated:** Step 5 - OpenAI Web Search Implementation
**Related Docs:**
- `/docs/ai/EXECUTOR.md` - Executor integration
- `/docs/ai/PLANNER.md` - Planning with web search requirements
- `/docs/business-track-parity-mapping.md` - Business Track features
