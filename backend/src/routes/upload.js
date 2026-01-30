import express from 'express'
import multer from 'multer'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only PDF and Word documents are allowed'))
    }
  }
})

router.post('/', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    let extractedText = ''

    // Parse PDF
    if (req.file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(req.file.buffer)
      extractedText = pdfData.text
    }
    // Parse DOCX
    else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer })
      extractedText = result.value
    }
    // Parse DOC (older format)
    else if (req.file.mimetype === 'application/msword') {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer })
      extractedText = result.value
    }

    // Parse the extracted text into structured resume data
    const resumeData = parseResumeText(extractedText)

    res.json({
      success: true,
      message: 'Resume parsed successfully',
      resumeData: resumeData,
      rawText: extractedText.substring(0, 1000) // Send first 1000 chars for debugging
    })

  } catch (error) {
    console.error('Error parsing resume:', error)
    res.status(500).json({
      success: false,
      message: `Error parsing resume: ${error.message}`
    })
  }
})

function parseResumeText(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line)
  
  const resumeData = {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    summary: '',
    experience: [],
    education: [],
    skills: []
  }

  // Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/)
  if (emailMatch) {
    resumeData.email = emailMatch[0]
  }

  // Extract phone
  const phoneMatch = text.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
  if (phoneMatch) {
    resumeData.phone = phoneMatch[0]
  }

  // Extract LinkedIn
  const linkedinMatch = text.match(/(?:linkedin\.com\/in\/)([\w-]+)|(?:LinkedIn:\s*)([\w-]+)/i)
  if (linkedinMatch) {
    resumeData.linkedin = linkedinMatch[1] || linkedinMatch[2]
  }

  // Extract name (usually first line that's not email/phone)
  for (const line of lines.slice(0, 5)) {
    if (!line.includes('@') && !line.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) && line.length > 3 && line.length < 50) {
      resumeData.name = line
      break
    }
  }

  // Extract skills
  const skillsMatch = text.match(/(?:SKILLS?|TECHNICAL SKILLS?|CORE COMPETENCIES|TECHNOLOGIES)[:\n]+([\s\S]*?)(?=\n\n[A-Z]|EXPERIENCE|EDUCATION|PROJECTS|$)/i)
  if (skillsMatch) {
    const skillsText = skillsMatch[1]
    const skills = skillsText.split(/[,•|·\n]/)
      .map(s => s.trim())
      .filter(s => s && s.length > 1 && s.length < 50 && !s.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i))
    resumeData.skills = [...new Set(skills)].slice(0, 25)
  }

  // Extract summary
  const summaryMatch = text.match(/(?:SUMMARY|PROFESSIONAL SUMMARY|OBJECTIVE|PROFILE|ABOUT)[:\n]+([\s\S]*?)(?=\n\n[A-Z]|EXPERIENCE|SKILLS|EDUCATION|$)/i)
  if (summaryMatch) {
    resumeData.summary = summaryMatch[1].trim().substring(0, 600)
  }

  // Extract work experience
  const experienceMatch = text.match(/(?:EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|PROFESSIONAL EXPERIENCE)[:\n]+([\s\S]*?)(?=\n\n[A-Z]|EDUCATION|SKILLS|PROJECTS|$)/i)
  if (experienceMatch) {
    const expText = experienceMatch[1]
    const expBlocks = expText.split(/\n\n+/)
    
    for (const block of expBlocks) {
      const blockLines = block.split('\n').filter(l => l.trim())
      if (blockLines.length < 2) continue
      
      const exp = {
        title: '',
        company: '',
        duration: '',
        responsibilities: []
      }
      
      // First line usually has title and/or company
      const firstLine = blockLines[0]
      const titleCompanyMatch = firstLine.match(/^(.+?)(?:\s+at\s+|\s+@\s+|\s+-\s+)(.+)$/i)
      if (titleCompanyMatch) {
        exp.title = titleCompanyMatch[1].trim()
        exp.company = titleCompanyMatch[2].trim()
      } else {
        exp.title = firstLine
      }
      
      // Look for date patterns
      const dateMatch = block.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})\s*[-–—to]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|Present|Current)/i)
      if (dateMatch) {
        exp.duration = `${dateMatch[1]} - ${dateMatch[2]}`
      }
      
      // Extract responsibilities (lines starting with bullet points or action verbs)
      for (let i = 1; i < blockLines.length; i++) {
        const line = blockLines[i].replace(/^[•·\-–—*]\s*/, '').trim()
        if (line.length > 10 && !line.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)) {
          // Check if it's not a date or company name
          if (!exp.company && line.match(/\b(Inc|LLC|Corp|Ltd|Company|Technologies)\b/i)) {
            exp.company = line
          } else if (line.length > 15) {
            exp.responsibilities.push(line)
          }
        }
      }
      
      if (exp.title && (exp.responsibilities.length > 0 || exp.company)) {
        resumeData.experience.push(exp)
      }
    }
  }

  // Extract education
  const educationMatch = text.match(/(?:EDUCATION|ACADEMIC|QUALIFICATIONS)[:\n]+([\s\S]*?)(?=\n\n[A-Z]|EXPERIENCE|SKILLS|PROJECTS|$)/i)
  if (educationMatch) {
    const eduText = educationMatch[1]
    const eduBlocks = eduText.split(/\n\n+/)
    
    for (const block of eduBlocks) {
      const blockLines = block.split('\n').filter(l => l.trim())
      if (blockLines.length === 0) continue
      
      const edu = {
        degree: '',
        school: '',
        year: ''
      }
      
      // Look for degree keywords
      const degreeMatch = block.match(/(Bachelor|Master|PhD|B\.S\.|M\.S\.|B\.A\.|M\.A\.|Associate|Doctorate)[^,\n]*/i)
      if (degreeMatch) {
        edu.degree = degreeMatch[0].trim()
      } else {
        edu.degree = blockLines[0]
      }
      
      // Look for university/college
      const schoolMatch = block.match(/(University|College|Institute|School)[^\n]*/i)
      if (schoolMatch) {
        edu.school = schoolMatch[0].trim()
      }
      
      // Look for year
      const yearMatch = block.match(/\b(19|20)\d{2}\b/)
      if (yearMatch) {
        edu.year = yearMatch[0]
      }
      
      if (edu.degree) {
        resumeData.education.push(edu)
      }
    }
  }

  return resumeData
}

export default router
