const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
      unique: true,
      ref: "User",
    },
    items: [
      {
        productId: {
          type: ObjectId,
          required: true,
          ref: "Product",
        },
        quantity: {
          type: Number,
          required: true
        },
        _id: false,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    totalItems: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
