import express from 'express'
import OpenAI from 'openai'

const router = express.Router()

// Initialize client lazily to ensure env vars are loaded
let client = null

function getClient() {
  if (!client) {
    if (!process.env.GITHUB_TOKEN && !process.env.OPENAI_API_KEY) {
      throw new Error(
        "Neither GITHUB_TOKEN nor OPENAI_API_KEY is configured. Please add one to your .env file."
      )
    }
    
    client = new OpenAI({
      baseURL: process.env.GITHUB_TOKEN 
        ? 'https://models.inference.ai.azure.com'
        : undefined,
      apiKey: process.env.GITHUB_TOKEN || process.env.OPENAI_API_KEY
    })
  }
  return client
}

router.post('/', async (req, res) => {
  try {
    const { messages, resumeData, jobDescription } = req.body

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(resumeData, jobDescription)
    
    // Prepare messages for OpenAI
    const openAIMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ]

    // Call AI API (GitHub Models or OpenAI)
    const modelName = process.env.GITHUB_TOKEN 
      ? 'gpt-4o-mini'  // GitHub Models - free tier
      : 'gpt-4-turbo-preview'  // OpenAI
    
    const aiClient = getClient()
    const completion = await aiClient.chat.completions.create({
      model: modelName,
      messages: openAIMessages,
      temperature: 0.2,
      max_tokens: 1800
    })

    const aiResponse = completion.choices[0].message.content

    // Parse if AI returns updated resume data
    let updatedResume = parseResumeUpdate(aiResponse, resumeData)

    // Fallback 1: try to heuristically extract a JSON object from the AI response
    if (!updatedResume) {
      try {
        let jsonText = aiResponse.trim()
        jsonText = jsonText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '')
        const firstBrace = jsonText.indexOf('{')
        const lastBrace = jsonText.lastIndexOf('}')
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const candidate = jsonText.substring(firstBrace, lastBrace + 1)
          try {
            const parsed = JSON.parse(candidate)
            // merge like parseResumeUpdate would
            updatedResume = {
              ...resumeData,
              ...(typeof parsed.summary === 'string' && parsed.summary.trim().length > 0 ? { summary: parsed.summary } : {}),
              ...(Array.isArray(parsed.skills) && parsed.skills.length > 0 ? { skills: parsed.skills } : {}),
              ...(Array.isArray(parsed.experience) && parsed.experience.length > 0 ? { experience: parsed.experience } : {}),
              ...(Array.isArray(parsed.education) && parsed.education.length > 0 ? { education: parsed.education } : {})
            }
          } catch (err) {
            // ignore parse errors and try the extractor
          }
        }
      } catch (err) {
        console.warn('Heuristic JSON extraction failed', err)
      }
    }

    // Fallback 2: ask the model to extract JSON only (if still not parsed)
    if (!updatedResume) {
      try {
        const extractorSystem = 'You are a strict JSON extractor. From the provided text, find and return a single JSON object that matches the resume update schema. Return ONLY the JSON object and nothing else.'
        const extractorUser = `Extract JSON from the following assistant output. If no JSON is present, construct a JSON object with empty arrays/strings where appropriate but do NOT invent experience entries.\n\n---\n${aiResponse}\n---\n`

        const extractorCompletion = await aiClient.chat.completions.create({
          model: modelName,
          messages: [
            { role: 'system', content: extractorSystem },
            { role: 'user', content: extractorUser }
          ],
          temperature: 0,
          max_tokens: 800
        })

        const extractedText = extractorCompletion.choices?.[0]?.message?.content || ''
        let cleaned = extractedText.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '')
        const firstBrace = cleaned.indexOf('{')
        const lastBrace = cleaned.lastIndexOf('}')
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleaned = cleaned.substring(firstBrace, lastBrace + 1)
          const parsed = JSON.parse(cleaned)
          updatedResume = {
            ...resumeData,
            ...(typeof parsed.summary === 'string' && parsed.summary.trim().length > 0 ? { summary: parsed.summary } : {}),
            ...(Array.isArray(parsed.skills) && parsed.skills.length > 0 ? { skills: parsed.skills } : {}),
            ...(Array.isArray(parsed.experience) && parsed.experience.length > 0 ? { experience: parsed.experience } : {}),
            ...(Array.isArray(parsed.education) && parsed.education.length > 0 ? { education: parsed.education } : {})
          }
        }
      } catch (err) {
        console.error('Extractor attempt failed:', err)
      }
    }

    res.json({
      message: aiResponse,
      updatedResume: updatedResume
    })

  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      message: `Error: ${error.message}`
    })
  }
})

function buildSystemPrompt(resumeData, jobDescription) {
  return `You are an expert resume writer and ATS specialist. Your job is to convert the provided resume (JSON) and job description into a tailored, recruiter-facing, metric-driven resume update.

Current Resume Data:
${JSON.stringify(resumeData, null, 2)}

${jobDescription ? `Job Description:\n${jobDescription}\n\n` : ''}

Primary goals and instructions:
- Rewrite each experience entry's responsibility bullets to be concise, action-oriented, and focused on measurable impact (use %, counts, $, time saved, or other KPIs when possible).
- For each role provide 3–5 bullets. Bullets should be 10–20 words when possible, start with a strong action verb, and include one metric when available.
- Prioritize keywords and skills found in the job description; surface them naturally in bullets.
- Do NOT invent jobs, companies, dates, or specific technical implementations. If a metric is unknown, either (A) ask the user for clarification in a follow-up, or (B) include a plausible estimate marked with [ESTIMATE].
- Suggest additions to the top-level "skills" array if they are relevant and truthful.
- Keep language clear and avoid vague adjectives ("responsible for"). Prefer results-focused phrasing ("increased X by Y").
 - Optionally suggest a small set (2-4) of relevant project ideas or portfolio items that the candidate could add under a "projects" section. These suggested projects should be clearly labeled as suggestions (include a boolean field "suggested": true for each) and must NOT be presented as real past employment or experience. Each suggested project should include a short "title", a one-line "summary", and one measurable "impact" or metric where possible (use [ESTIMATE] if guessing). Only include "projects" when they would meaningfully strengthen the resume for the job.

Output format rules (strict):
- At the end of your response, return ONLY a JSON object between the exact markers below. Do not include any extra commentary outside the markers.
- The JSON schema should include summary, skills, experience (array of {title, company, duration, responsibilities:[]}), and education if provided. Only include fields you are updating; do not remove fields omitted by the AI unless they are empty arrays or empty strings.
 - The JSON schema may also include an optional "projects" array of suggested project objects: { "title": "...", "summary": "...", "impact": "...", "suggested": true }.

Example (illustrative):
Input experience responsibility: "Built API endpoints and fixed performance issues in production."\nJob requires: "reduce latency, scale services, PostgreSQL"
Output bullets might include:
- "Designed and implemented scalable REST APIs, reducing average latency by 42% through query optimization and caching."
- "Refactored PostgreSQL queries and added indexes, increasing throughput 3x and lowering error rate 15%."

Return the update as JSON exactly between these markers:
###RESUME_UPDATE###
{
  "summary": "...updated summary...",
  "skills": ["skill1","skill2"],
  "experience": [
    { "title": "...", "company": "...", "duration": "...", "responsibilities": ["bullet 1","bullet 2"] }
  ],
  "education": []
}
###END_UPDATE###

Maintain a professional, recruiter-friendly tone and return ONLY the JSON object between the markers.`
}

function parseResumeUpdate(aiResponse, currentResume) {
  try {
    // Look for JSON update in the AI response
    const updateMatch = aiResponse.match(/###RESUME_UPDATE###\n([\s\S]*?)\n###END_UPDATE###/)
    
    if (updateMatch) {
      const updateData = JSON.parse(updateMatch[1])
      
      // Merge with current resume, only updating fields that are provided
      return {
        ...currentResume,
        ...(typeof updateData.summary === 'string' && updateData.summary.trim().length > 0 ? { summary: updateData.summary } : {}),
        ...(Array.isArray(updateData.skills) && updateData.skills.length > 0 ? { skills: updateData.skills } : {}),
        ...(Array.isArray(updateData.experience) && updateData.experience.length > 0 ? { experience: updateData.experience } : {}),
        ...(Array.isArray(updateData.education) && updateData.education.length > 0 ? { education: updateData.education } : {}),
        ...(Array.isArray(updateData.projects) && updateData.projects.length > 0 ? { projects: updateData.projects } : {})
      }
    }
  } catch (error) {
    console.error('Failed to parse resume update:', error)
  }
  
  return null
}

export default router
