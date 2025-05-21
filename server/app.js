require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./db"); // import the DB connection
const stripe = require("stripe")(process.env.STRIPE_SECRET);

//mongoose connect//
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ MongoDB connected");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;


// ✅ Allow requests from your frontend
app.use(cors({
  origin: "http://localhost:3001", // use your frontend's port (3000 or 3001)
  credentials: true
}));

app.use(express.json());

// ✅ Stripe Checkout Session API
app.post("http://localhost:7000/api/create-checkout-session", async (req, res) => {

  try {
    const { products } = req.body;

    const lineItems = products.map((product) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: product.dish,
          images: [product.imgdata],
        },
        unit_amount: product.price * 100,
      },
      quantity: product.qnty,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3001/success", // 🔁 make sure this matches your frontend
      cancel_url: "http://localhost:3001/cancel",
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe session error:", error.message);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// ✅ Listen on port 7000
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
