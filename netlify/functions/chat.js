exports.handler = async (event) => {
  const GEMINI_KEY = "AIzaSyAg5wjInxn0seGHHpN6Hhb-dxQGdheazc0";
  const MODEL = "gemini-2.0-flash";
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  try {
    const { message, userName, targetCareer } = JSON.parse(event.body || "{}");
    if (!message) return { statusCode: 400, headers, body: JSON.stringify({ error: "No message provided" }) };
    const prompt = `You are Forge AI, a friendly expert engineering career advisor built into SkillForge AI. The user's name is ${userName || "Engineer"} and they are targeting ${targetCareer || "Software Engineer"}. Be concise (max 3 sentences), encouraging and practical.\n\nUser: ${message}`;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 200 } })
    });
    if (!res.ok) {
      const err = await res.json();
      if (err.error?.code === 429) return { statusCode: 429, headers, body: JSON.stringify({ error: "Daily free limit reached. Try again tomorrow!" }) };
      throw new Error(err.error?.message || "Gemini API error");
    }
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I could not generate a response.";
    return { statusCode: 200, headers, body: JSON.stringify({ reply: text }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error: " + e.message }) };
  }
};
