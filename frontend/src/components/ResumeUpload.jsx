import { useState } from 'react'
import axios from 'axios'

export default function ResumeUpload({ setResumeData, setMessages }) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus('❌ Please upload a PDF or Word document')
      return
    }

    setIsUploading(true)
    setUploadStatus('📤 Uploading and parsing your resume...')

    const formData = new FormData()
    formData.append('resume', file)

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        setResumeData(response.data.resumeData)
        setUploadStatus('✅ Resume uploaded successfully!')
        
        const data = response.data.resumeData
        // Add success message to chat
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Perfect! I've parsed your resume and extracted:\n\n` +
                   `📝 Name: ${data.name}\n` +
                   `📧 Email: ${data.email}\n` +
                   `${data.skills.length > 0 ? `💼 Skills: ${data.skills.length} found\n` : ''}` +
                   `${data.experience.length > 0 ? `🏢 Experience: ${data.experience.length} positions\n` : ''}` +
                   `${data.education.length > 0 ? `🎓 Education: ${data.education.length} entries\n` : ''}` +
                   `\nNow paste a job description and ask me to:\n` +
                   `• "Tailor my resume for this job"\n` +
                   `• "Optimize my resume for [role]"\n` +
                   `• "Add missing keywords from the job posting"`
        }])

        setTimeout(() => setUploadStatus(''), 3000)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('❌ Error uploading resume. Please try again.')
      setTimeout(() => setUploadStatus(''), 3000)
    } finally {
      setIsUploading(false)
      event.target.value = '' // Reset file input
    }
  }

  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      <label className="block cursor-pointer">
        <div className="flex items-center justify-center gap-2 p-3 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            {isUploading ? 'Uploading...' : 'Upload Resume (PDF/Word)'}
          </span>
        </div>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="hidden"
        />
      </label>
      {uploadStatus && (
        <p className="mt-2 text-sm text-center">{uploadStatus}</p>
      )}
    </div>
  )
}
