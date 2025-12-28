import { tool } from 'ai';
import { z } from 'zod';
import {
  Album,
  searchByGenre,
  searchByYear,
  searchByYearRange,
  searchByArtist,
  searchByTitle,
  searchByLabel,
  searchByFormat,
  getRandomAlbums,
  getCollectionStats,
} from './discogs';

// Helper to format albums for both text response and structured data
function formatResults(albums: Album[], limit = 20) {
  const limited = albums.slice(0, limit);
  return {
    count: albums.length,
    albums: limited,
    hasMore: albums.length > limit,
    summary: limited.map(a => `"${a.title}" by ${a.artist} (${a.year})`).join(', '),
  };
}

export function createCollectionTools(albums: Album[]) {
  return {
    searchByGenre: tool({
      description: 'Search albums by genre or style (e.g., "jazz", "electronic", "punk", "ambient", "hip hop", "soul", "funk"). This searches both main genres and sub-styles.',
      inputSchema: z.object({
        genre: z.string().describe('The genre or style to search for'),
      }),
      execute: async ({ genre }) => formatResults(searchByGenre(albums, genre)),
    }),

    searchByYear: tool({
      description: 'Search albums released in a specific year',
      inputSchema: z.object({
        year: z.number().describe('The release year to search for'),
      }),
      execute: async ({ year }) => formatResults(searchByYear(albums, year)),
    }),

    searchByDecade: tool({
      description: 'Search albums from a specific decade (e.g., 1980s, 1990s, 2000s)',
      inputSchema: z.object({
        decade: z.number().describe('The starting year of the decade (e.g., 1990 for the 1990s)'),
      }),
      execute: async ({ decade }) => formatResults(searchByYearRange(albums, decade, decade + 9)),
    }),

    searchByArtist: tool({
      description: 'Search albums by artist name',
      inputSchema: z.object({
        artist: z.string().describe('The artist name to search for'),
      }),
      execute: async ({ artist }) => formatResults(searchByArtist(albums, artist), 50),
    }),

    searchByTitle: tool({
      description: 'Search albums by title',
      inputSchema: z.object({
        title: z.string().describe('The album title to search for'),
      }),
      execute: async ({ title }) => formatResults(searchByTitle(albums, title)),
    }),

    searchByLabel: tool({
      description: 'Search albums by record label (e.g., "Blue Note", "Warp", "Sub Pop", "ECM")',
      inputSchema: z.object({
        label: z.string().describe('The record label to search for'),
      }),
      execute: async ({ label }) => formatResults(searchByLabel(albums, label)),
    }),

    searchByFormat: tool({
      description: 'Search albums by format (e.g., "vinyl", "LP", "CD", "cassette", "7\\"", "12\\"")',
      inputSchema: z.object({
        format: z.string().describe('The format to search for'),
      }),
      execute: async ({ format }) => formatResults(searchByFormat(albums, format)),
    }),

    getRandomRecommendation: tool({
      description: 'Get random album recommendations from the collection. Use this when the user wants a surprise, random pick, or asks "what should I listen to?"',
      inputSchema: z.object({
        count: z.number().min(1).max(10).default(5).describe('Number of random albums to suggest'),
      }),
      execute: async ({ count }) => {
        const results = getRandomAlbums(albums, count);
        return {
          count: results.length,
          albums: results,
          hasMore: false,
          summary: results.map(a => `"${a.title}" by ${a.artist}`).join(', '),
        };
      },
    }),

    getCollectionStats: tool({
      description: 'Get statistics about the entire collection: total count, top genres, albums by decade, most collected artists. Use this when user asks about their collection overview or stats.',
      inputSchema: z.object({}),
      execute: async () => {
        const stats = getCollectionStats(albums);
        return {
          ...stats,
          topGenresFormatted: stats.topGenres.map(([genre, count]) => `${genre} (${count})`).join(', '),
          byDecadeFormatted: stats.byDecade.map(([decade, count]) => `${decade}: ${count}`).join(', '),
          topArtistsFormatted: stats.topArtists.map(([artist, count]) => `${artist} (${count})`).join(', '),
        };
      },
    }),

    combinedSearch: tool({
      description: 'Search with multiple criteria combined (e.g., "jazz from the 1960s", "electronic albums on Warp Records", "90s hip hop on vinyl")',
      inputSchema: z.object({
        genre: z.string().optional().describe('Genre/style filter'),
        artist: z.string().optional().describe('Artist name filter'),
        yearFrom: z.number().optional().describe('Start year (inclusive)'),
        yearTo: z.number().optional().describe('End year (inclusive)'),
        label: z.string().optional().describe('Record label filter'),
        format: z.string().optional().describe('Format filter'),
      }),
      execute: async ({ genre, artist, yearFrom, yearTo, label, format }) => {
        let results = [...albums];

        if (genre) {
          results = results.filter(a =>
            a.genres.some(g => g.toLowerCase().includes(genre.toLowerCase())) ||
            a.styles.some(s => s.toLowerCase().includes(genre.toLowerCase()))
          );
        }
        if (artist) {
          results = results.filter(a =>
            a.artist.toLowerCase().includes(artist.toLowerCase())
          );
        }
        if (yearFrom !== undefined) {
          results = results.filter(a => a.year >= yearFrom);
        }
        if (yearTo !== undefined) {
          results = results.filter(a => a.year <= yearTo);
        }
        if (label) {
          results = results.filter(a =>
            a.labels.some(l => l.toLowerCase().includes(label.toLowerCase()))
          );
        }
        if (format) {
          results = results.filter(a =>
            a.formats.some(f => f.toLowerCase().includes(format.toLowerCase()))
          );
        }

        return formatResults(results);
      },
    }),
  };
}
