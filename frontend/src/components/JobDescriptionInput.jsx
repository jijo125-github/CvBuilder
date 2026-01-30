import { useState } from 'react'

export default function JobDescriptionInput({ jobDescription, setJobDescription }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700">Job Description</span>
          <svg
            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {jobDescription && !isExpanded && (
          <p className="text-sm text-gray-500 mt-1 truncate">
            {jobDescription.substring(0, 50)}...
          </p>
        )}
      </button>
      
      {isExpanded && (
        <div className="p-4 pt-0">
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here to tailor your resume..."
            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      )}
    </div>
  )
}
