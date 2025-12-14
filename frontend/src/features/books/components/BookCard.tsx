import { Link } from 'react-router-dom';
import { Book } from '../types';
import { Tag } from '@/shared/components/ui/Tag';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const poster = book.images.find(img => img.coverType === 'cover') || book.images[0];
  const posterUrl = poster ? poster.url : undefined;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg bg-zinc-50 shadow-xs ring-1 ring-zinc-900/5 transition hover:shadow-md dark:bg-zinc-900 dark:ring-white/10">
      <div className="aspect-[2/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={book.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400">
            <span className="text-4xl font-bold opacity-20">{book.title.charAt(0)}</span>
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex gap-1">
          {book.monitored && (
            <Tag variant="small" color="primary">Monitored</Tag>
          )}
          {!book.releaseDate && (
             <Tag variant="small" color="amber">Announced</Tag>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white line-clamp-2">
          <Link to={`/book/${book.id}`} className="hover:underline focus:outline-hidden">
            <span className="absolute inset-0" aria-hidden="true" />
            {book.title}
          </Link>
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {book.releaseDate ? new Date(book.releaseDate).getFullYear() : 'TBA'}
        </p>
      </div>
    </div>
  );
}
