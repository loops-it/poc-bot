// src/app.ts
import express from "express";
import path from "path";
import indexRouter from "./routes/index";


const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../src/views"));

// Static files
app.use(express.static(path.join(__dirname, "../src/public")));


// Routes
app.use("/", indexRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
