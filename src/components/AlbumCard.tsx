'use client';

import Image from 'next/image';

interface Album {
  id: number;
  title: string;
  artist: string;
  year: number;
  genres: string[];
  styles: string[];
  formats: string[];
  labels: string[];
  thumb: string;
  coverImage: string;
}

interface AlbumCardProps {
  album: Album;
}

export function AlbumCard({ album }: AlbumCardProps) {
  const imageUrl = album.coverImage || album.thumb || '/placeholder.png';

  return (
    <a
      href={`https://www.discogs.com/release/${album.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
    >
      <div className="aspect-square relative bg-zinc-800">
        {imageUrl && imageUrl !== '/placeholder.png' ? (
          <Image
            src={imageUrl}
            alt={`${album.title} by ${album.artist}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            unoptimized // Discogs images don't need Next.js optimization
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-12.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 5.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
            </svg>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-white truncate group-hover:text-orange-400 transition-colors">
          {album.title}
        </h3>
        <p className="text-sm text-zinc-400 truncate">{album.artist}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
          {album.year > 0 && <span>{album.year}</span>}
          {album.year > 0 && album.formats.length > 0 && <span>•</span>}
          {album.formats.length > 0 && <span>{album.formats[0]}</span>}
        </div>
        {album.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {album.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}

interface AlbumGridProps {
  albums: Album[];
}

export function AlbumGrid({ albums }: AlbumGridProps) {
  if (albums.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
      {albums.map((album) => (
        <AlbumCard key={`${album.id}-${album.title}`} album={album} />
      ))}
    </div>
  );
}
