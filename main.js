document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "bookshelf_app";
  const bookForm = document.getElementById("bookForm");
  const searchForm = document.getElementById("searchBook");
  const incompleteList = document.getElementById("incompleteBookList");
  const completeList = document.getElementById("completeBookList");

  const getBooks = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  };

  const saveBooks = (books) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  };

  const createBookElement = (book) => {
    const div = document.createElement("div");
    div.setAttribute("data-bookid", book.id);
    div.setAttribute("data-testid", "bookItem");
    div.className = "book-card";
    div.innerHTML = `
      <h3 data-testid="bookItemTitle">${book.title}</h3>
      <p data-testid="bookItemAuthor">Penulis: ${book.author}</p>
      <p data-testid="bookItemYear">Tahun: ${book.year}</p>
      <div class="action-buttons">
        <button data-testid="bookItemIsCompleteButton">
          ${book.isComplete ? "Belum selesai dibaca" : "Selesai dibaca"}
        </button>
        <button data-testid="bookItemDeleteButton">Hapus Buku</button>
        <button data-testid="bookItemEditButton">Edit Buku</button>
      </div>
    `;
    return div;
  };

  const renderBooks = (booksToRender = null) => {
    const books = booksToRender || getBooks();
    incompleteList.innerHTML = "";
    completeList.innerHTML = "";

    books.forEach((book) => {
      const bookElement = createBookElement(book);
      const targetList = book.isComplete ? completeList : incompleteList;
      targetList.appendChild(bookElement);
    });
  };

  const toggleCompleteStatus = (bookId) => {
    const books = getBooks();
    const bookIndex = books.findIndex((b) => b.id === bookId);
    if (bookIndex !== -1) {
      books[bookIndex].isComplete = !books[bookIndex].isComplete;
      saveBooks(books);
      renderBooks();
    }
  };

  const deleteBook = (bookId) => {
    const books = getBooks();
    const book = books.find((b) => b.id === bookId);
    if (book) {
      const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus buku "${book.title}"?`);
      if (confirmDelete) {
        const updatedBooks = books.filter((b) => b.id !== bookId);
        saveBooks(updatedBooks);
        renderBooks();
      }
    }
  };

  const showEditModal = (bookId) => {
    const books = getBooks();
    const book = books.find((b) => b.id === bookId);
    if (!book) return;

    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">×</span>
        <h2>Edit Buku</h2>
        <form id="editForm">
          <input type="hidden" id="editBookId" value="${book.id}" />
          <div>
            <label for="editBookTitle">Judul</label>
            <input id="editBookTitle" type="text" value="${book.title}" required />
          </div>
          <div>
            <label for="editBookAuthor">Penulis</label>
            <input id="editBookAuthor" type="text" value="${book.author}" required />
          </div>
          <div>
            <label for="editBookYear">Tahun</label>
            <input id="editBookYear" type="number" value="${book.year}" required />
          </div>
          <div>
            <label for="editBookIsComplete">Selesai dibaca</label>
            <input id="editBookIsComplete" type="checkbox" ${book.isComplete ? "checked" : ""} />
          </div>
          <button type="submit">Simpan Perubahan</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector(".close");
    closeBtn.addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    const editForm = modal.querySelector("#editForm");
    editForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const updatedBook = {
        id: bookId,
        title: editForm.querySelector("#editBookTitle").value,
        author: editForm.querySelector("#editBookAuthor").value,
        year: parseInt(editForm.querySelector("#editBookYear").value),
        isComplete: editForm.querySelector("#editBookIsComplete").checked,
      };

      const books = getBooks();
      const bookIndex = books.findIndex((b) => b.id === bookId);
      if (bookIndex !== -1) {
        books[bookIndex] = updatedBook;
        saveBooks(books);
        renderBooks();
        document.body.removeChild(modal);
      }
    });
  };

  bookForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newBook = {
      id: Date.now().toString(),
      title: document.getElementById("bookFormTitle").value,
      author: document.getElementById("bookFormAuthor").value,
      year: parseInt(document.getElementById("bookFormYear").value),
      isComplete: document.getElementById("bookFormIsComplete").checked,
    };
    const books = getBooks();
    books.push(newBook);
    saveBooks(books);
    renderBooks();
    bookForm.reset();
  });

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const searchTerm = document.getElementById("searchBookTitle").value.toLowerCase();
    const books = getBooks().filter((b) =>
      b.title.toLowerCase().includes(searchTerm)
    );
    renderBooks(books);
  });

  document.addEventListener("click", (e) => {
    const bookId = e.target.closest("[data-bookid]")?.dataset.bookid;
    if (!bookId) return;

    const target = e.target.dataset.testid;
    if (target === "bookItemIsCompleteButton") {
      toggleCompleteStatus(bookId);
    } else if (target === "bookItemDeleteButton") {
      deleteBook(bookId);
    } else if (target === "bookItemEditButton") {
      showEditModal(bookId);
    }
  });

  renderBooks();
});