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
    const updatedResume = parseResumeUpdate(aiResponse, resumeData)

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
  return `You are an expert resume consultant and career advisor. Your role is to convert the provided resume (JSON) and job description into a tailored, ATS-friendly resume update.

Current Resume Data:
${JSON.stringify(resumeData, null, 2)}

${jobDescription ? `Job Description:\n${jobDescription}\n\n` : ''}

Goals and rules:
- Identify the job's key skills, tools, and requirements.
- For each experience entry in the resume, rewrite existing responsibility bullets so they emphasize relevant skills from the job description while staying truthful to the user's original experience. Do NOT invent new jobs, companies, or durations.
- If the job mentions a specific tool (e.g., "AWS Connect") and the resume lists a related platform (e.g., "AWS services"), rephrase bullets to explicitly connect them (e.g., "Leveraged AWS services to ...; familiar with AWS contact-center concepts such as AWS Connect"). Avoid fabricating exact implementations—use generic language like "experience with AWS services" unless the resume already names specific services.
- Prefer action-driven, quantified bullets when information exists. Keep bullets concise (1-2 lines each).
- Also suggest added skills to the top-level \`skills\` array if they are relevant and truthful.

Example transformation (illustrative):
Input experience responsibility: "Managed AWS infrastructure and built automation scripts."
Job requires: "Experience with AWS Connect"
Output bullet (rewritten): "Managed AWS infrastructure and automation; applied AWS services in support of contact-center integrations and customer-routing workflows."

IMPORTANT: At the end of your response, ONLY include a JSON object wrapped between the markers below. Do not include any extra explanation outside the markers.
###RESUME_UPDATE###
{
  "summary": "...updated summary...",
  "skills": ["skill1","skill2"],
  "experience": [
    { "title": "...", "company": "...", "duration": "...", "responsibilities": ["rewritten bullet 1","rewritten bullet 2"] }
  ],
  "education": []
}
###END_UPDATE###

Maintain a helpful tone but return ONLY the JSON markers and content as specified.`
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
        ...(updateData.summary && { summary: updateData.summary }),
        ...(updateData.skills && { skills: updateData.skills }),
        ...(updateData.experience && { experience: updateData.experience }),
        ...(updateData.education && { education: updateData.education })
      }
    }
  } catch (error) {
    console.error('Failed to parse resume update:', error)
  }
  
  return null
}

export default router
