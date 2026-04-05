// ── Gemini API — FREE, no credit card needed ──────────────────────
// Get key at: https://aistudio.google.com/app/apikey

const getKey = () => import.meta.env.VITE_GEMINI_KEY || ''

async function callGemini(prompt, maxTokens = 8192) {
  const key = getKey()
  if (!key || key === 'AIzaSy_your_key_here') {
    console.warn('⚠️ Gemini key not set. Add VITE_GEMINI_KEY to Vercel environment variables.')
    return null
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: maxTokens,
        },
      }),
    })

    const data = await res.json()
    if (data.error) throw new Error(data.error.message)

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('Empty response from Gemini')
    return text
  } catch (err) {
    console.error('Gemini API error:', err.message)
    return null
  }
}

function parseJSON(raw) {
  if (!raw) return null
  try {
    const clean = raw
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    return JSON.parse(clean)
  } catch {
    // Try to extract JSON from response
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) {
      try { return JSON.parse(match[0]) } catch { return null }
    }
    return null
  }
}

// ── MAIN FUNCTION: ONE call → complete week-by-week plan ──────────
export async function generateFullPlan(profile) {
  const totalWeeks = Math.ceil(profile.duration / 7)

  const classLabel = {
    '11': 'Class 11 student',
    '12': 'Class 12 student',
    'gap': 'Gap year student (after Class 12)',
  }[profile.class] || 'Class 12 student'

  const prompt = `You are an expert academic and life coach for Indian students.

Create a complete ${profile.duration}-day execution plan for this student:
- Name: ${profile.name}
- Level: ${classLabel}
- Stream: ${profile.stream}
- Primary Target: ${profile.target}
- Interests: ${profile.interests.join(', ')}
- Goals: ${profile.goals.join(', ')}

RULES:
1. Create exactly ${totalWeeks} weeks
2. Each week: 5-7 specific, actionable tasks
3. Tasks must be VERY specific (not "study math" but "Complete NCERT Chapter 5 Integration — solve all examples + Exercise 5.1 to 5.3")
4. Mix areas each week: Academic, Finance basics, Mindset/habits, Skills, Projects
5. Progress builds week over week (early weeks = foundation, later weeks = advanced)
6. Finance tasks = ONLY learning/understanding (e.g., "Read about compound interest", "Watch what is a SIP video") — never tell to invest money
7. For ${profile.class} level — make tasks age-appropriate and relevant to Indian student life
8. Resources must be REAL and FREE (NCERT, YouTube channels, specific apps, Zerodha Varsity for finance, etc.)

Return ONLY valid JSON (no markdown, no explanation):
{
  "planTitle": "Inspiring 1-line title for this plan",
  "totalWeeks": ${totalWeeks},
  "northStar": "1-line inspiring vision for where ${profile.name} will be after ${profile.duration} days",
  "weeks": [
    {
      "weekNum": 1,
      "theme": "Week theme name",
      "focus": "1-line what this week is about",
      "tasks": [
        {
          "area": "Academic",
          "title": "Very specific task title",
          "detail": "Exactly what to do — specific chapters, pages, questions, actions",
          "duration": 45,
          "resource": "Specific free resource (book/app/YouTube channel/website)"
        }
      ]
    }
  ]
}`

  const raw = await callGemini(prompt, 8192)
  return parseJSON(raw)
}
