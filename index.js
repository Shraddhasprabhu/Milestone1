const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());

let articles = [];

// Load articles from file (optional persistence)
const loadArticles = () => {
  if (fs.existsSync("articles.json")) {
    const data = fs.readFileSync("articles.json");
    articles = JSON.parse(data);
  }
};

// Save articles to file (optional persistence)
const saveArticles = () => {
  fs.writeFileSync("articles.json", JSON.stringify(articles, null, 2));
};

// Endpoint to add a new article
app.post("/articles", (req, res) => {
  const { title, content, tags } = req.body;
  if (!title || !content || !tags) {
    return res.status(400).json({ error: "Title, content, and tags are required." });
  }

  const newArticle = {
    id: articles.length + 1,
    title,
    content,
    tags,
    date: new Date(),
  };

  articles.push(newArticle);
  saveArticles();
  res.status(201).json(newArticle);
});

// Endpoint to search articles
app.get("/articles/search", (req, res) => {
  const { keyword, tag, sortBy } = req.query;

  // Filter by keyword or tag
  let filteredArticles = articles.filter(article => {
    const keywordMatch = keyword
      ? article.title.includes(keyword) || article.content.includes(keyword)
      : true;

    const tagMatch = tag ? article.tags.includes(tag) : true;

    return keywordMatch && tagMatch;
  });

  // Sort results by relevance or date
  if (sortBy === "relevance" && keyword) {
    filteredArticles.sort((a, b) => {
      const freqA =
        (a.title.match(new RegExp(keyword, "gi")) || []).length +
        (a.content.match(new RegExp(keyword, "gi")) || []).length;
      const freqB =
        (b.title.match(new RegExp(keyword, "gi")) || []).length +
        (b.content.match(new RegExp(keyword, "gi")) || []).length;
      return freqB - freqA;
    });
  } else if (sortBy === "date") {
    filteredArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  res.json(filteredArticles);
});

// Endpoint to retrieve a full article by ID
app.get("/articles/:id", (req, res) => {
  const { id } = req.params;
  const article = articles.find(a => a.id === parseInt(id));

  if (!article) {
    return res.status(404).json({ error: "Article not found." });
  }

  res.json(article);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  loadArticles();
  console.log(`Server is running on http://localhost:${PORT}`);
});
