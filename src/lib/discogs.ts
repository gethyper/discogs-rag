const DISCOGS_API = 'https://api.discogs.com';

export interface DiscogsRelease {
  id: number;
  instance_id: number;
  rating: number;
  basic_information: {
    id: number;
    title: string;
    year: number;
    resource_url: string;
    thumb: string;
    cover_image: string;
    formats: Array<{
      name: string;
      qty: string;
      descriptions?: string[];
    }>;
    labels: Array<{
      name: string;
      catno: string;
    }>;
    artists: Array<{
      name: string;
      id: number;
    }>;
    genres: string[];
    styles: string[];
  };
  date_added: string;
}

export interface CollectionResponse {
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    items: number;
  };
  releases: DiscogsRelease[];
}

export interface Album {
  id: number;
  title: string;
  artist: string;
  year: number;
  genres: string[];
  styles: string[];
  formats: string[];
  labels: string[];
  dateAdded: string;
  rating: number;
  thumb: string;
  coverImage: string;
}

function transformRelease(release: DiscogsRelease): Album {
  const info = release.basic_information;
  return {
    id: info.id,
    title: info.title,
    artist: info.artists.map(a => a.name.replace(/ \(\d+\)$/, '')).join(', '),
    year: info.year,
    genres: info.genres,
    styles: info.styles,
    formats: info.formats.map(f => f.name),
    labels: info.labels.map(l => l.name),
    dateAdded: release.date_added,
    rating: release.rating,
    thumb: info.thumb,
    coverImage: info.cover_image,
  };
}

export async function fetchCollection(username: string, token: string): Promise<Album[]> {
  const albums: Album[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = `${DISCOGS_API}/users/${username}/collection/folders/0/releases?page=${page}&per_page=100`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Discogs token=${token}`,
        'User-Agent': 'DiscogsRAG/1.0',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Discogs API error: ${response.status} ${response.statusText}`);
    }

    const data: CollectionResponse = await response.json();

    totalPages = data.pagination.pages;
    albums.push(...data.releases.map(transformRelease));

    page++;

    // Respect rate limiting
    if (page <= totalPages) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return albums;
}

// Simple in-memory cache for the collection
let cachedCollection: Album[] | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getCollection(): Promise<Album[]> {
  const username = process.env.DISCOGS_USERNAME;
  const token = process.env.DISCOGS_TOKEN;

  if (!username || !token) {
    throw new Error('Missing DISCOGS_USERNAME or DISCOGS_TOKEN environment variables');
  }

  const now = Date.now();
  if (cachedCollection && now - cacheTime < CACHE_DURATION) {
    return cachedCollection;
  }

  cachedCollection = await fetchCollection(username, token);
  cacheTime = now;
  return cachedCollection;
}

// Collection query helpers
export function searchByGenre(albums: Album[], genre: string): Album[] {
  const searchTerm = genre.toLowerCase();
  return albums.filter(album =>
    album.genres.some(g => g.toLowerCase().includes(searchTerm)) ||
    album.styles.some(s => s.toLowerCase().includes(searchTerm))
  );
}

export function searchByYear(albums: Album[], year: number): Album[] {
  return albums.filter(album => album.year === year);
}

export function searchByYearRange(albums: Album[], startYear: number, endYear: number): Album[] {
  return albums.filter(album => album.year >= startYear && album.year <= endYear);
}

export function searchByArtist(albums: Album[], artist: string): Album[] {
  const searchTerm = artist.toLowerCase();
  return albums.filter(album =>
    album.artist.toLowerCase().includes(searchTerm)
  );
}

export function searchByTitle(albums: Album[], title: string): Album[] {
  const searchTerm = title.toLowerCase();
  return albums.filter(album =>
    album.title.toLowerCase().includes(searchTerm)
  );
}

export function searchByLabel(albums: Album[], label: string): Album[] {
  const searchTerm = label.toLowerCase();
  return albums.filter(album =>
    album.labels.some(l => l.toLowerCase().includes(searchTerm))
  );
}

export function searchByFormat(albums: Album[], format: string): Album[] {
  const searchTerm = format.toLowerCase();
  return albums.filter(album =>
    album.formats.some(f => f.toLowerCase().includes(searchTerm))
  );
}

export function getRandomAlbums(albums: Album[], count: number): Album[] {
  const shuffled = [...albums].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getCollectionStats(albums: Album[]) {
  const genreCounts: Record<string, number> = {};
  const decadeCounts: Record<string, number> = {};
  const artistCounts: Record<string, number> = {};

  for (const album of albums) {
    for (const genre of album.genres) {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    }

    if (album.year > 0) {
      const decade = `${Math.floor(album.year / 10) * 10}s`;
      decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
    }

    artistCounts[album.artist] = (artistCounts[album.artist] || 0) + 1;
  }

  return {
    totalAlbums: albums.length,
    topGenres: Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
    byDecade: Object.entries(decadeCounts)
      .sort((a, b) => a[0].localeCompare(b[0])),
    topArtists: Object.entries(artistCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
  };
}
