// Gemini AI — Fixed for 2026 models
const getKey = () => import.meta.env.VITE_GEMINI_KEY || ''

async function callGemini(prompt) {
  const key = getKey()
  if (!key) { console.error('VITE_GEMINI_KEY not found'); return null }

  // gemini-2.0-flash is the correct free model for 2026
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`

  console.log('Calling Gemini API...')

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      }),
    })

    const data = await res.json()

    if (data.error) {
      console.error('Gemini API error:', data.error.message)
      return null
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) { console.error('Empty response'); return null }

    console.log('Gemini response received, parsing...')

    // Extract JSON from response
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) { console.error('No JSON found in response'); return null }

    return JSON.parse(match[0])

  } catch (err) {
    console.error('Fetch error:', err.message)
    return null
  }
}

export async function generateFullPlan(profile) {
  const totalWeeks = Math.ceil(profile.duration / 7)
  const classLabel = {
    '11': 'Class 11 student in India',
    '12': 'Class 12 student in India',
    'gap': 'Gap year student in India after Class 12',
  }[profile.class] || 'Class 12 student in India'

  const prompt = `You are an expert life coach for Indian students.
Create a complete ${profile.duration}-day execution plan.

Student: ${profile.name}
Level: ${classLabel}
Stream: ${profile.stream}
Target: ${profile.target}
Interests: ${profile.interests.join(', ')}
Goals: ${profile.goals.join(', ')}

Instructions:
- Create exactly ${totalWeeks} weeks
- Each week has 5-6 specific tasks
- Mix areas every week: Academic, Finance, Mindset, Skill, Project
- Tasks must be VERY specific with chapter numbers and exercise numbers
- Finance tasks = education only, NEVER tell to invest real money
- Use only free resources: NCERT, YouTube channels, Zerodha Varsity, Khan Academy
- Tasks should progress in difficulty week over week

IMPORTANT: Return ONLY the JSON object below, no other text, no markdown:

{"planTitle":"inspiring title","totalWeeks":${totalWeeks},"northStar":"1-line vision statement","weeks":[{"weekNum":1,"theme":"Foundation","focus":"What this week builds","tasks":[{"area":"Academic","title":"specific task name","detail":"exact steps with chapter numbers","duration":45,"resource":"specific free resource"}]}]}`

  return await callGemini(prompt)
}
