import express from 'express'
import OpenAI from 'openai'

const router = express.Router()

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

router.post('/', async (req, res) => {
  try {
    const { messages, resumeData, jobDescription } = req.body

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        message: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.'
      })
    }

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

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
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

When suggesting resume updates, provide specific, actionable advice. If you're making concrete changes, format them clearly so they can be applied to the resume.

Be conversational, helpful, and encouraging. Focus on helping the user present their actual skills and experience in the best light for the target role.`
}

function parseResumeUpdate(aiResponse, currentResume) {
  // Simple parsing logic - in a real app, you'd use more sophisticated parsing
  // or have the AI return structured JSON
  
  // For now, return null and let updates be manual
  // You can enhance this to parse specific update commands from the AI
  return null
}

export default router
