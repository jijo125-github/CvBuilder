import { useState } from 'react'
import ChatInterface from './components/ChatInterface'
import ResumePreview from './components/ResumePreview'
import JobDescriptionInput from './components/JobDescriptionInput'
import ResumeUpload from './components/ResumeUpload'

function App() {
  const [resumeData, setResumeData] = useState({
    name: 'Your Name',
    email: 'your.email@example.com',
    phone: '(123) 456-7890',
    summary: 'Experienced professional with expertise in...',
    experience: [],
    education: [],
    skills: [],
    projects: []
  })
  
  const [jobDescription, setJobDescription] = useState('')
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI resume assistant. Upload your base resume or paste a job description to get started. I can help you customize your resume to match any job!'
    }
  ])

  const parseJobDescription = async (description) => {
    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: 'Please tailor my resume to the provided job description and return suggested resume updates in the response.' }
          ],
          resumeData,
          jobDescription: description
        })
      })
      const data = await resp.json()
      // Return the backend response so the caller can preview/apply
      return data
    } catch (err) {
      console.error('Failed to parse job description:', err)
      return null
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Side - Chat Interface */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">AI Resume Builder</h1>
          <p className="text-sm text-gray-600 mt-1">Customize your resume with AI</p>
        </div>
        <ResumeUpload 
          setResumeData={setResumeData}
          setMessages={setChatMessages}
        />
        <JobDescriptionInput 
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          parseJobDescription={parseJobDescription}
          resumeData={resumeData}
          setResumeData={setResumeData}
        />
        
        <ChatInterface 
          messages={chatMessages}
          setMessages={setChatMessages}
          resumeData={resumeData}
          setResumeData={setResumeData}
          jobDescription={jobDescription}
        />
      </div>

      {/* Right Side - Resume Preview */}
      <div className="flex-1 overflow-auto p-8">
        <ResumePreview resumeData={resumeData} />
      </div>
    </div>
  )
}

export default App
