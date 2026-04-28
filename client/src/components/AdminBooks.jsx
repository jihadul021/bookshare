import React, { useState, useEffect, useCallback } from 'react';
import getImageUrl from '../utils/getImageUrl';
import './AdminBooks.css';
import { buildApiUrl, getApiErrorMessage } from '../utils/apiUrl';

const getAuthToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem('bookshareUser') || '{}');
    return user.token || null;
  } catch {
    return null;
  }
};

const AdminBooks = ({ onViewBook }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      let url = buildApiUrl(`/api/admin/books?page=${page}&limit=10`);
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const token = getAuthToken();
      if (!token) throw new Error('No token found');

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Failed to fetch books'));
      }

      const data = await response.json();
      setBooks(data.books);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error loading books');
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleRemoveBook = async (bookId) => {
    const confirmed = window.confirm('Are you sure you want to remove this book from the platform?');
    if (!confirmed) {
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(buildApiUrl(`/api/admin/books/${bookId}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Failed to remove book'));
      }

      setBooks((currentBooks) => currentBooks.filter((book) => book._id !== bookId));
    } catch (err) {
      setError(err.message || 'Error removing book');
    }
  };

  if (loading && books.length === 0) {
    return <div className="books-loading">Loading books...</div>;
  }

  return (
    <div className="admin-books">
      <h1>Book Management</h1>

      {error && <div className="error-message">{error}</div>}

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="search-input"
        />
      </div>

      {/* Books Grid */}
      <div className="books-grid">
        {books.map((book) => (
          <div key={book._id} className="book-card">
            {book.images && book.images[0] && (
              <div className="book-image">
                <img src={getImageUrl(book.images[0])} alt={book.title} />
              </div>
            )}
            <div className="book-info">
              <h3>{book.title}</h3>
              <p className="author">{book.author}</p>

              <div className="book-stats">
                <div className="stat">
                  <label>Price</label>
                  <span>Tk {book.price}</span>
                </div>
                <div className="stat">
                  <label>Stock</label>
                  <span>{book.stock ?? 0} copies</span>
                </div>
                <div className="stat">
                  <label>Sold</label>
                  <span>{book.totalSold} copies</span>
                </div>
              </div>

              <div className="book-availability">
                <label>Status:</label>
                <span className={`status ${book.isAvailable ? 'available' : 'unavailable'}`}>
                  {book.isAvailable ? '✅ Available' : '❌ Unavailable'}
                </span>
              </div>

              <div className="book-seller">
                <label>Seller:</label>
                <span>{book.seller ? book.seller.name : 'Unknown'}</span>
              </div>

              <div className="book-condition">
                <label>Condition:</label>
                <span>{book.condition}</span>
              </div>

              <div className="book-actions">
                <button
                  type="button"
                  className="btn-view-book"
                  title="View book"
                  onClick={() => onViewBook?.(book._id)}
                >
                  👁️ View
                </button>
                <button
                  type="button"
                  className="btn-remove-book"
                  title="Remove book"
                  onClick={() => handleRemoveBook(book._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {books.length === 0 && !loading && (
        <div className="no-books">
          <p>No books found</p>
        </div>
      )}

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="pagination-btn"
        >
          Previous
        </button>
        <span className="page-info">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="pagination-btn"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminBooks;
