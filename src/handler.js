const { nanoid } = require('nanoid');
const books = require('./books');

const isValidBook = ({ name, pageCount, readPage }) => {
  if (!name) return 'Mohon isi nama buku';
  if (pageCount < readPage) return 'Jumlah halaman yang terbaca tidak boleh lebih besar dari total halaman dari buku';
  return null;
};

const getBookIndex = (id) => books.findIndex((book) => book.id === id);

const addBookHandler = (request, h) => {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;
  const error = isValidBook({ name, pageCount, readPage });
  if (error) {
    const response = h.response({ status: 'fail', message: `Gagal menambahkan buku. ${error}` });
    response.code(400);
    return response;
  }

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const finished = pageCount === readPage;
  const newBook = {
    id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt,
  };
  books.push(newBook);

  const response = h.response({ status: 'success', message: 'Buku berhasil ditambahkan', data: { bookId: id } });
  response.code(201);
  return response;
};

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;
  let filteredBooks = books;

  if (name) filteredBooks = filteredBooks.filter((book) => book.name.toLowerCase().includes(name.toLowerCase()));
  if (reading !== undefined) filteredBooks = filteredBooks.filter((book) => book.reading === !!+reading);
  if (finished !== undefined) filteredBooks = filteredBooks.filter((book) => book.finished === !!+finished);

  const response = h.response({
    status: 'success',
    // eslint-disable-next-line no-shadow
    data: { books: filteredBooks.map(({ id, name, publisher }) => ({ id, name, publisher })) },
  });
  response.code(200);
  return response;
};

const getBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const index = getBookIndex(id);
  const book = index !== -1 ? books[index] : null;

  if (book) {
    return { status: 'success', data: { book } };
  }

  const response = h.response({ status: 'fail', message: 'Buku tidak ditemukan' });
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;
  const updatedAt = new Date().toISOString();
  const index = getBookIndex(id);

  if (index === -1) {
    const response = h.response({ status: 'fail', message: 'Gagal memperbarui buku. Id tidak ditemukan' });
    response.code(404);
    return response;
  }

  const error = isValidBook({ name, pageCount, readPage });
  if (error) {
    const response = h.response({ status: 'fail', message: `Gagal memperbarui buku. ${error}` });
    response.code(400);
    return response;
  }

  const finished = pageCount === readPage;
  books[index] = {
    ...books[index], name, year, author, summary, publisher, pageCount, readPage, finished, reading, updatedAt,
  };

  const response = h.response({ status: 'success', message: 'Buku berhasil diperbarui' });
  response.code(200);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const index = getBookIndex(id);

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({ status: 'success', message: 'Buku berhasil dihapus' });
    response.code(200);
    return response;
  }

  const response = h.response({ status: 'fail', message: 'Buku gagal dihapus. Id tidak ditemukan' });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
