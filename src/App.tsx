import { useState } from "react";
import "./App.css";
import { useDbClient } from "./hooks";
import { IBookItem } from "./lib/definitions";
import { searchBooks } from "./lib/search";

const PAGE_SIZE = 200;
const LANGUAGES = [
  "all",
  "arabic",
  "bengali",
  "bulgarian",
  "chinese",
  "croatian",
  "czech",
  "danish",
  "dutch",
  "english",
  "finnish",
  "french",
  "german",
  "greek",
  "hebrew",
  "hindi",
  "hungarian",
  "icelandic",
  "italian",
  "japanese",
  "korean",
  "marathi",
  "norwegian",
  "polish",
  "portuguese",
  "punjabi",
  "russian",
  "serbian",
  "slovak",
  "slovenian",
  "spanish",
  "swedish",
  "turkish",
];

function App() {
  const dbClient = useDbClient();
  const [query, setQuery] = useState<{
    text: string;
    offset: number;
    language: string | null;
  }>({
    text: "",
    offset: 0,
    language: null,
  });
  const [booksData, setBooksData] = useState<{
    books: IBookItem[];
    total: number;
  }>({ books: [], total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const libraryTable = "library.ebook";
  const libraryColumns =
    "ipfs_cid,title,author,extension,language,publisher,year,filesize, _score,_id";

  const handleSearchBooks = async () => {
    if (!dbClient || !query) return;

    setIsLoading(true);
    setBooksData({ books: [], total: 0 });
    try {
      const bookList = await searchBooks(
        query,
        libraryColumns,
        libraryTable,
        dbClient
      );
      setBooksData({ books: bookList.data, total: bookList.count });
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setQuery((prev) => ({ ...prev, offset: 0 }));
    handleSearchBooks();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery((prev) => ({ ...prev, text: e.target.value, offset: 0 }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuery((prev) => ({ ...prev, language: e.target.value }));
  };

  const handlePaginationClick = (offset: number) => {
    if (query.offset + offset < 0) return;
    setQuery((prev) => ({ ...prev, offset: prev.offset + offset }));
    handleSearchBooks();
  };

  return (
    <div className='search-container'>
      <h1 className='text-center my-4'>Book Search</h1>
      <form className='input-group mb-3' onSubmit={handleSubmit}>
        <input
          type='text'
          className='form-control form-input'
          placeholder='Search for books'
          value={query.text}
          onChange={handleSearchChange}
        />
        <button className='btn btn-primary' disabled={isLoading}>
          {isLoading ? <span className='sr-only'>Loading...</span> : "Search"}
        </button>
      </form>
      <select onChange={handleSelectChange}>
        {LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </option>
        ))}
      </select>
      <div className='list-container'>
        <div className='list-group'>
          {booksData.books.map((book) => (
            <a
              href={`https://cloudflare-ipfs.com/ipfs/${book.ipfs_cid}?filename=${book.title}.${book.extension}`}
              target='_blank'
              className='list-group-item'
              key={book._id}
            >
              <h5
                className='title-text'
                dangerouslySetInnerHTML={{
                  __html: book._highlight_title,
                }}
              ></h5>
              <p className='list-item-infos'>
                <span>Author: {book.author}</span>
                <span>Language: {book.language}</span>
              </p>
            </a>
          ))}
        </div>
        <div className='list-pagination-container'>
          <button
            className='list-pagination-button'
            onClick={() => handlePaginationClick(-PAGE_SIZE)}
            disabled={query.offset === 0}
          >
            Previous
          </button>
          <div className='list-pagination'>
            <p>
              {query.offset} - {query.offset + booksData.books.length}
            </p>
            <span>({booksData.total} entries total)</span>
          </div>
          <button
            className='list-pagination-button'
            onClick={() => handlePaginationClick(PAGE_SIZE)}
            disabled={booksData.books.length < PAGE_SIZE}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
