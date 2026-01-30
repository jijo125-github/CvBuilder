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
      temperature: 0.7,
      max_tokens: 1500
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
  return `You are an expert resume consultant and career advisor. Your role is to help users customize their resumes based on job descriptions.

Current Resume Data:
${JSON.stringify(resumeData, null, 2)}

${jobDescription ? `Job Description:\n${jobDescription}\n\n` : ''}

Your responsibilities:
1. Analyze the job description and identify key skills, qualifications, and requirements
2. Suggest specific changes to the resume to better match the job
3. Rewrite bullet points to highlight relevant experience
4. Recommend skills to emphasize or add
5. Suggest improvements to the professional summary
6. Maintain honesty - never fabricate experience

IMPORTANT: When you suggest changes, return them in this JSON format at the end of your response:
###RESUME_UPDATE###
{
  "summary": "Updated professional summary...",
  "skills": ["skill1", "skill2", ...],
  "experience": [{"title": "...", "company": "...", "duration": "...", "responsibilities": ["..."]}]
}
###END_UPDATE###

Be conversational, helpful, and encouraging. Focus on helping the user present their actual skills and experience in the best light for the target role.`
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
