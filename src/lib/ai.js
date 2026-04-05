// ── Gemini API — Free, works from browser ─────────────────────────
const getKey = () => import.meta.env.VITE_GEMINI_KEY || ''

async function callGemini(prompt) {
  const key = getKey()
  if (!key || key.includes('your_key')) return null

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }),
    })

    if (!res.ok) { console.error('Gemini error:', await res.json()); return null }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return null

    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(clean)
  } catch (err) {
    console.error('Gemini error:', err.message)
    return null
  }
}

// ── ONE call → complete week-by-week plan ─────────────────────────
export async function generateFullPlan(profile) {
  const totalWeeks = Math.ceil(profile.duration / 7)
  const classLabel = {
    '11': 'Class 11 student in India',
    '12': 'Class 12 student in India',
    'gap': 'Gap year student in India (after Class 12)',
  }[profile.class] || 'Class 12 student in India'

  const prompt = `You are an expert life coach for Indian students. Create a complete execution plan.

Student Profile:
- Name: ${profile.name}
- Level: ${classLabel}
- Stream: ${profile.stream}
- Primary Target: ${profile.target}
- Interests: ${profile.interests.join(', ')}
- Goals: ${profile.goals.join(', ')}
- Duration: ${profile.duration} days (${totalWeeks} weeks)

Create exactly ${totalWeeks} weeks with 5-6 tasks each week.

Rules:
1. Tasks must be VERY specific (not "study math" but "NCERT Ch.5 Integration — solve Exercise 5.1 all questions")
2. Each week mix: Academic, Finance, Mindset, Skill, Project
3. Finance tasks = learning only (e.g., "Watch What is SIP on Zerodha Varsity") — NEVER say to invest money
4. Resources must be real and free (NCERT, YouTube, Zerodha Varsity, specific apps)
5. Progress builds week over week
6. Keep tasks realistic for a ${classLabel}

Return ONLY this JSON structure:
{
  "planTitle": "Short inspiring title",
  "totalWeeks": ${totalWeeks},
  "northStar": "1-line vision after ${profile.duration} days",
  "weeks": [
    {
      "weekNum": 1,
      "theme": "Week theme",
      "focus": "1-line focus",
      "tasks": [
        {
          "area": "Academic",
          "title": "Specific task",
          "detail": "Exactly what to do with chapter/exercise numbers",
          "duration": 45,
          "resource": "Free resource name"
        }
      ]
    }
  ]
}`

  return await callGemini(prompt)
}
