
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    bookId: {
      type: String,
      required: [true, "Ma sach la bat buoc"],
      unique: true,
      trim: true
    },
    title: {
      type: String,
      required: [true, "Ten sach la bat buoc"],
      trim: true
    },
    author: {
      type: String,
      required: [true, "Tac gia la bat buoc"],
      trim: true
    },
    category: {
      type: String,
      required: [true, "The loai la bat buoc"],
      trim: true
    },
    publisher: {
      type: String,
      required: [true, "Nha xuat ban la bat buoc"],
      trim: true
    },
    publishYear: {
      type: Number,
      required: [true, "Nam xuat ban la bat buoc"],
      min: 1
    },
    isbn: {
      type: String,
      required: [true, "ISBN la bat buoc"],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, "So luong la bat buoc"],
      min: 0
    },
    description: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Book", bookSchema);
