import { Book } from '../types';
import { BookCard } from './BookCard';

interface BookListProps {
  books: Book[];
}

export function BookList({ books }: BookListProps) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
