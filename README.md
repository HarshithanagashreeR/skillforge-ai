# 🚀 SkillForge AI

An AI-powered career intelligence platform designed to help software engineers analyze their skills, map knowledge gaps, discover real-world jobs, and build personalized learning roadmaps.

## ✨ Features

- **Forge AI Assistant**: Interactive chatbot powered by Google's Gemini 2.0 Flash model.
- **Skill Analyzer**: Interactive radar charts and visual diagnostics to pinpoint your strengths and weaknesses.
- **Live Job Market**: Real-time job listings integrated with the Adzuna API.
- **Daily Focus Quiz**: Timed engineering quizzes to sharpen your technical knowledge and maintain your learning streak.
- **Learning Roadmaps**: Auto-generated paths tailored to your target engineering role.
- **Google Authentication**: Secure, one-tap login using Google Identity Services.
- **Fully Responsive**: Seamless, premium "glassmorphism" UI experience across both desktop and mobile devices.

## 🛠️ Built With

- **HTML / CSS / JavaScript** (No complex frameworks, pure vanilla SPA)
- **Google Gemini API** (AI generation and chatbot)
- **Google Identity Services** (OAuth 2.0 Authentication)
- **Adzuna API** (Live job aggregating)
- **Chart.js & Three.js** (Data visualization and background canvas elements)

## 🚀 How to Run Locally

You don't need any complex build tools like Node.js or Webpack to run this site locally.

1. Clone or download the repository.
2. Open your terminal in the project folder.
3. Start a local Python server:
   ```bash
   python3 -m http.server 8080
   ```
4. Open your browser and navigate to `http://localhost:8080`.

## 🌐 Deploying to Netlify (Recommended)

This application is built as a highly optimized, single-page application (SPA), making it perfect for free static hosting platforms like Netlify. 

**Deployment takes less than 60 seconds:**

1. Go to **[Netlify Drop](https://app.netlify.com/drop)**.
2. Drag and drop the `SkillForage AI` folder directly onto the page.
3. Netlify will instantly upload your files and generate a live, public URL containing your site.
4. *(Optional)* You can claim a custom Netlify subdomain by going to Site Settings > Domain Management.

*Note: Since the Gemini API key is securely embedded into the frontend code to call the Google Generative AI API directly, no additional backend or environment variable configuration is required for basic deployment.*

## 🔒 A Note on Google Sign-In

To ensure Google Login works on your live site, you must authorize your deployment URL:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **APIs & Services > Credentials**.
3. Edit your OAuth 2.0 Client ID.
4. Under **Authorized JavaScript origins**, click "Add URI" and paste your live Netlify URL (e.g., `https://69b47eb96810d78d66d11aa6--enchanting-smakager-fad338.netlify.app/p`).
5. Save your changes.

---
*SkillForge AI — Master Your Engineering Career.*
