# Discogs RAG

Chat with your vinyl collection using natural language. Ask for jazz albums, 90s records, or anything from your Discogs collection.

## Features

- Natural language queries against your Discogs collection
- Visual album art display in responses
- Search by genre, year, decade, artist, label, format
- Random recommendations
- Collection statistics
- Built with Vercel AI SDK v6

## Setup

### 1. Get your API keys

- **Discogs**: Go to [discogs.com/settings/developers](https://www.discogs.com/settings/developers) and generate a personal access token
- **OpenAI**: Get an API key from [platform.openai.com](https://platform.openai.com/api-keys)

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```
DISCOGS_TOKEN=your_discogs_token
DISCOGS_USERNAME=your_discogs_username
OPENAI_API_KEY=your_openai_key
```

### 3. Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Example Queries

- "What jazz albums do I have?"
- "Show me something from the 90s"
- "Any electronic music on Warp Records?"
- "Surprise me with something random"
- "What are my collection stats?"
- "60s soul on vinyl"

## Tech Stack

- Next.js 16
- Vercel AI SDK v6
- Tailwind CSS
- OpenAI GPT-4o-mini
- Discogs API

## How It Works

1. Your Discogs collection is fetched and cached on first request
2. The LLM uses tool calling to search your collection
3. Album results are displayed with cover art and metadata
4. Clicking an album opens it on Discogs

## License

MIT
