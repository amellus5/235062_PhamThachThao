
const express = require("express");
const Book = require("../models/Book");

const router = express.Router();

// GET: Lay danh sach sach va tim kiem
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};

    if (search && search.trim()) {
      const keyword = search.trim();
      filter = {
        $or: [
          { bookId: { $regex: keyword, $options: "i" } },
          { title: { $regex: keyword, $options: "i" } },
          { author: { $regex: keyword, $options: "i" } },
          { category: { $regex: keyword, $options: "i" } }
        ]
      };
    }

    const books = await Book.find(filter).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET: Lay chi tiet sach theo MongoDB ID
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Khong tim thay sach" });
    }

    res.json(book);
  } catch (error) {
    res.status(400).json({ message: "ID sach khong hop le" });
  }
});

// POST: Them sach
router.post("/", async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Ma sach da ton tai" });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
});

// PUT: Cap nhat sach
router.put("/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ message: "Khong tim thay sach" });
    }

    res.json(book);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Ma sach da ton tai" });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(400).json({ message: error.message });
  }
});

// DELETE: Xoa sach
router.delete("/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Khong tim thay sach" });
    }

    res.json({ message: "Xoa sach thanh cong", book });
  } catch (error) {
    res.status(400).json({ message: "ID sach khong hop le" });
  }
});

module.exports = router;
