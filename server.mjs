import express from "express";
import path from "path";
import fetch from "node-fetch";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Enable __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Setup lowdb
const file = path.join(__dirname, "db.json");
const adapter = new JSONFile(file);
const defaultData = { cache: {} };
const db = new Low(adapter, defaultData);


// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// API route with caching
app.get("/api/search", async (req, res) => {
    const query = req.query.q?.trim().toLowerCase();
    if (!query) return res.status(400).json({ error: "Missing query" });

    try {
        const [itbookData, googleData, openLibraryData] = await Promise.all([
            fetch(`https://api.itbook.store/1.0/search/${query}`).then(res => res.json()),
            fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`).then(res => res.json()),
            fetch(`https://openlibrary.org/search.json?title=${query}`).then(res => res.json())
        ]);

        const result = { itbookData, googleData, openLibraryData };
        db.data.cache[query] = result;
        await db.write();

        res.json(result);
    } catch (error) {
        console.warn("🔌 API fetch failed, using cache (if available)");
        const cached = db.data.cache[query];
        if (cached) {
            res.json(cached);
        } else {
            res.status(500).json({ error: "API fetch failed and no cache found." });
        }
    }
});

// Root route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

//  Initialize DB and start server
(async () => {
    await db.read();
    if (!db.data) {
        db.data = { cache: {} };
        await db.write();
    }

    app.listen(PORT, () => {
        console.log(`📚 Book Tracer Server running at http://localhost:${PORT}`);
    });
})();
