const getKey = () => import.meta.env.VITE_GEMINI_KEY || ''

async function callGemini(prompt) {
  const key = getKey()
  if (!key) return null

  // v1 API — correct for free tier
  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-001',
    'gemini-1.0-pro',
  ]

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${key}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
        }),
      })
      const data = await res.json()
      if (data.error) { console.warn(model, data.error.message); continue }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) continue
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) continue
      return JSON.parse(match[0])
    } catch (e) { console.warn(model, e.message); continue }
  }
  return null
}

export async function generateFullPlan(profile) {
  const totalWeeks = Math.ceil(profile.duration / 7)
  const classLabel = {
    '11': 'Class 11 India',
    '12': 'Class 12 India',
    'gap': 'Gap year India'
  }[profile.class] || 'Class 12 India'

  const prompt = `You are a life coach for Indian students. Create a ${profile.duration}-day plan.

Student: ${profile.name}, ${classLabel}, ${profile.stream}
Target: ${profile.target}
Interests: ${profile.interests.join(', ')}
Goals: ${profile.goals.join(', ')}

Make exactly ${totalWeeks} weeks with 5-6 tasks each.
Tasks must be VERY specific with chapter/exercise numbers.
Finance tasks = learning only, NEVER investment advice.
Use free resources: NCERT, YouTube, Zerodha Varsity.

Return ONLY valid JSON, no extra text:
{"planTitle":"title","totalWeeks":${totalWeeks},"northStar":"vision","weeks":[{"weekNum":1,"theme":"theme","focus":"focus","tasks":[{"area":"Academic","title":"task","detail":"exact steps","duration":45,"resource":"free resource"}]}]}`

  return await callGemini(prompt)
}