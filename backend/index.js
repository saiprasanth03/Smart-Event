// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');

// dotenv.config();

// // Global error handlers - prevent silent crashes
// process.on('unhandledRejection', (reason, promise) => {
//     console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
// });
// process.on('uncaughtException', (err) => {
//     console.error('UNCAUGHT EXCEPTION:', err);
// });

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Routes
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/events', require('./routes/eventRoutes'));
// app.use('/api/registrations', require('./routes/registrationRoutes'));
// app.use('/api/analytics', require('./routes/analyticsRoutes'));
// app.get('/api/certificate/:registrationId', require('./utils/certificateGenerator').generateCertificate);

// const PORT = process.env.PORT || 5000;
// const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-event';

// console.log('--- Database Config ---');
// console.log('URI:', MONGO_URI.startsWith('mongodb+srv') ? 'Cloud Atlas Connected (SRV)' : 'Local/Other Connection');
// if (!process.env.MONGO_URI) {
//     console.warn('WARNING: process.env.MONGO_URI is undefined. Using local fallback.');
// }

// mongoose.connect(MONGO_URI)
//     .then(() => console.log('Successfully connected to MongoDB!'))
//     .catch(err => {
//         console.error('CRITICAL: MongoDB connection error!');
//         console.error('Error Details:', err.message);
//         if (err.message.includes('whitelist')) {
//             console.error('ADVICE: Check your IP Whitelist in MongoDB Atlas.');
//         }
//     });

// app.get('/', (req, res) => {
//     res.send('Smart Event Management API is running...');
// });

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });




const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

/* ---------------- GLOBAL ERROR HANDLERS ---------------- */

process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED REJECTION:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

/* ---------------- MIDDLEWARE ---------------- */

// Allow requests from frontend (Vercel)
app.use(
  cors({
    origin: ["http://localhost:5173", "https://smart-event-iota.vercel.app", "https://smart-event-56qg.onrender.com"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(express.json());

/* ---------------- ROUTES ---------------- */

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/registrations", require("./routes/registrationRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

const { generateCertificate } = require("./utils/certificateGenerator");
app.get("/api/certificate/:registrationId", generateCertificate);

/* ---------------- DATABASE ---------------- */

const PORT = process.env.PORT || 5000;

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/smart-event";

console.log("---- Database Configuration ----");

if (process.env.MONGO_URI) {
  console.log("Using MongoDB Atlas Cloud");
} else {
  console.warn("WARNING: Using Local MongoDB fallback");
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);

    if (err.message.includes("whitelist")) {
      console.error(
        "TIP: Add your Render server IP to MongoDB Atlas Network Access"
      );
    }
  });

/* ---------------- TEST ROUTE ---------------- */

app.get("/", (req, res) => {
  res.send("Smart Event Management API is running...");
});

/* ---------------- SERVER ---------------- */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});