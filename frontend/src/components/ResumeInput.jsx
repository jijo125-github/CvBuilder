import { useState } from 'react'

export default function ResumeInput({ resumeData, setResumeData }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [formData, setFormData] = useState(resumeData)

  const handleSubmit = (e) => {
    e.preventDefault()
    setResumeData(formData)
    setIsExpanded(false)
  }

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { title: '', company: '', duration: '', responsibilities: [''] }]
    })
  }

  const addSkill = () => {
    const skill = prompt('Enter skill:')
    if (skill) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skill]
      })
    }
  }

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700">Your Resume Data</span>
          <svg
            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isExpanded && (
        <div className="p-4 pt-0 max-h-96 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({...formData, summary: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.skills.map((skill, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {skill}
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        skills: formData.skills.filter((_, i) => i !== idx)
                      })}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >×</button>
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={addSkill}
                className="text-sm text-blue-600 hover:text-blue-800"
              >+ Add Skill</button>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
            >
              Save Resume Data
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
