const API_KEY = "your-newsapi.ai-key-here";

// currently unused function that just fetches some articles based on a keyword
async function getArticles(keyword = "Portugal", lang = "eng") {
  const response = await fetch(
    "https://newsapi.ai/api/v1/article/getArticles",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keyword,
        lang,
        resultType: "articles",
        apiKey: API_KEY,
      }),
    }
  );
  const data = await response.json();
  return data.articles?.results || [];
}

// fetches 100 articles from SUPPOSEDLY the last 10 minutes
// but in practice seems to return a lot of older articles as well
async function getArticleStream() {
  const response = await fetch(
    "https://eventregistry.org/api/v1/minuteStreamArticles",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recentActivityArticlesUpdatesAfterMinsAgo: 10,
        recentActivityArticlesMaxArticleCount: 100,
        dataType: "news",
        lang: "eng",
        articleBodyLen: -1,
        apiKey: API_KEY,
      }),
    }
  );
  
  console.log("Status:", response.status);

  const text = await response.text();
  console.log("Raw response text:", text);

  try {
    const data = JSON.parse(text);
    console.log("Parsed data keys:", Object.keys(data));
    return data;
  } catch (err) {
    console.error("JSON parse error:", err);
    return [];
  }
}

// fetches articles that were added after a specific article URI
// does not guarantee that all returned articles are newer than the given URI, which is handled in the main code
async function getArticleStreamAfterUri(lastUri) {
  const response = await fetch(
    "https://eventregistry.org/api/v1/minuteStreamArticles",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recentActivityArticlesNewsUpdatesAfterUri: lastUri,
        recentActivityArticlesUpdatesAfterMinsAgo: 10,
        recentActivityArticlesMaxArticleCount: 100,
        dataType: "news",
        lang: "eng",
        articleBodyLen: -1,
        apiKey: API_KEY,
      }),
    }
  );
  
  console.log("Status:", response.status);

  const text = await response.text();
  console.log("Raw response text:", text);

  try {
    const data = JSON.parse(text);
    console.log("Parsed data keys:", Object.keys(data));
    return data;
  } catch (err) {
    console.error("JSON parse error:", err);
    return [];
  }
}

// sends text to local emotion detection server and gets back emotion scores
async function getEmotion(text) {
  const response = await fetch("http://localhost:8000/emotion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  });

  const data = await response.json();
  return data.emotion;
}
