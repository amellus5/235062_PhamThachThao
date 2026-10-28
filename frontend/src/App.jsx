
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const emptyBook = {
  bookId: "",
  title: "",
  author: "",
  category: "",
  publisher: "",
  publishYear: new Date().getFullYear(),
  isbn: "",
  quantity: 0,
  description: "",
};

function App() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyBook);
  const [editingId, setEditingId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadBooks(keyword = "") {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("/api/books", {
        params: keyword.trim() ? { search: keyword.trim() } : {},
      });
      setBooks(res.data);
    } catch {
      setError("Không tải được sách. Vui lòng kiểm tra backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks("");
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadBooks(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function resetForm() {
    setForm(emptyBook);
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const payload = {
      ...form,
      publishYear: Number(form.publishYear),
      quantity: Number(form.quantity),
    };

    try {
      if (editingId) {
        await axios.put(`/api/books/${editingId}`, payload);
        alert("Cập nhật sách thành công!");
      } else {
        await axios.post("/api/books", payload);
        alert("Thêm sách thành công!");
      }

      resetForm();
      await loadBooks(search);
    } catch (err) {
      setError(
        err.response?.data?.message || "Lưu sách thất bại. Hãy kiểm tra dữ liệu."
      );
    }
  }

  function editBook(book) {
    setEditingId(book._id);
    setForm({
      bookId: book.bookId,
      title: book.title,
      author: book.author,
      category: book.category,
      publisher: book.publisher,
      publishYear: book.publishYear,
      isbn: book.isbn,
      quantity: book.quantity,
      description: book.description || "",
    });
    setDetail(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteBook(book) {
    if (!window.confirm(`Bạn có chắc muốn xóa "${book.title}" không?`)) return;

    try {
      await axios.delete(`/api/books/${book._id}`);
      setDetail(null);
      await loadBooks(search);
    } catch (err) {
      setError(err.response?.data?.message || "Xóa sách thất bại.");
    }
  }

  const totalQuantity = books.reduce(
    (sum, book) => sum + Number(book.quantity || 0),
    0
  );

  return (
    <main className="app">
      <header className="hero">
        <div className="hero-icon">📚</div>
        <div>
          <p className="eyebrow">BOOK MANAGEMENT SYSTEM</p>
          <h1>Quản lý sách</h1>
          <p className="subtitle">
            Quản lý kho sách đơn giản, nhanh chóng và hiệu quả
          </p>
        </div>
      </header>

      <section className="stats">
        <article className="stat-card">
          <span>Tổng đầu sách</span>
          <strong>{books.length}</strong>
        </article>
        <article className="stat-card">
          <span>Tổng số lượng</span>
          <strong>{totalQuantity}</strong>
        </article>
        <article className="stat-card">
          <span>Số thể loại</span>
          <strong>{new Set(books.map((b) => b.category)).size}</strong>
        </article>
      </section>

      {error && <div className="alert">{error}</div>}

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">BOOK INFORMATION</p>
            <h2>{editingId ? "Cập nhật sách" : "Thêm sách mới"}</h2>
          </div>
          {editingId && (
            <button className="btn btn-light" type="button" onClick={resetForm}>
              Hủy sửa
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {[
              ["bookId", "Mã sách"],
              ["title", "Tên sách"],
              ["author", "Tác giả"],
              ["category", "Thể loại"],
              ["publisher", "Nhà xuất bản"],
              ["publishYear", "Năm xuất bản"],
              ["isbn", "ISBN"],
              ["quantity", "Số lượng"],
            ].map(([name, label]) => (
              <label className="field" key={name}>
                <span>{label} *</span>
                <input
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  type={
                    name === "publishYear" || name === "quantity"
                      ? "number"
                      : "text"
                  }
                  min={
                    name === "quantity"
                      ? 0
                      : name === "publishYear"
                        ? 1
                        : undefined
                  }
                  required
                />
              </label>
            ))}

            <label className="field full-width">
              <span>Mô tả</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                placeholder="Nhập mô tả sách..."
              />
            </label>
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" type="submit">
              {editingId ? "Lưu thay đổi" : "+ Thêm sách"}
            </button>
            <button className="btn btn-light" type="button" onClick={resetForm}>
              Làm mới
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">YOUR COLLECTION</p>
            <h2>Danh sách sách</h2>
          </div>
          <span className="count-badge">{books.length} cuốn</span>
        </div>

        <input
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔎 Tìm mã sách, tên sách, tác giả, thể loại..."
        />

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã sách</th>
                <th>Tên sách</th>
                <th>Tác giả</th>
                <th>Thể loại</th>
                <th>Số lượng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id}>
                  <td><span className="book-code">{book.bookId}</span></td>
                  <td className="book-title">{book.title}</td>
                  <td>{book.author}</td>
                  <td><span className="category">{book.category}</span></td>
                  <td>{book.quantity}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-small btn-light"
                        type="button"
                        onClick={() => setDetail(book)}
                      >
                        Chi tiết
                      </button>
                      <button
                        className="btn btn-small btn-edit"
                        type="button"
                        onClick={() => editBook(book)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-small btn-delete"
                        type="button"
                        onClick={() => deleteBook(book)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && books.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty">Không tìm thấy sách.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan="6" className="empty">Đang tải dữ liệu...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {detail && (
        <div className="modal-backdrop" onClick={() => setDetail(null)}>
          <section className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              type="button"
              onClick={() => setDetail(null)}
            >
              ×
            </button>
            <p className="eyebrow">BOOK DETAILS</p>
            <h2>{detail.title}</h2>
            {[
              ["Mã sách", detail.bookId],
              ["Tác giả", detail.author],
              ["Thể loại", detail.category],
              ["Nhà xuất bản", detail.publisher],
              ["Năm xuất bản", detail.publishYear],
              ["ISBN", detail.isbn],
              ["Số lượng", detail.quantity],
              ["Mô tả", detail.description || "Chưa có mô tả"],
            ].map(([label, value]) => (
              <div className="detail-row" key={label}>
                <span>{label}</span><strong>{value}</strong>
              </div>
            ))}
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => editBook(detail)}
            >
              Sửa thông tin
            </button>
          </section>
        </div>
      )}

      <footer>Book Management · React · Express · MongoDB Atlas</footer>
    </main>
  );
}

export default App;
