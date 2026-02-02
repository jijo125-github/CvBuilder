import { useState } from 'react'

export default function JobDescriptionInput({ jobDescription, setJobDescription, parseJobDescription, resumeData, setResumeData }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [parsedData, setParsedData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const handleParse = async () => {
    if (!jobDescription.trim()) return
    try {
      setError('')
      setLoading(true)
      const data = await parseJobDescription(jobDescription)
      setParsedData(data)
      // If backend returned an updatedResume, open preview for confirmation
      if (data && data.updatedResume) setShowPreview(true)
    } catch (err) {
      console.error(err)
      setError('Failed to parse job description. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const applyUpdatedResume = () => {
    if (!parsedData || !parsedData.updatedResume) return
    setResumeData(parsedData.updatedResume)
    setShowPreview(false)
    setParsedData(null)
  }

  const cancelPreview = () => {
    setShowPreview(false)
    // keep parsedData in case user wants to re-open
  }

  const renderDiff = (original, updated) => {
    const keys = ['name','email','phone','location','linkedin','summary','skills','accomplishments','experience','education']
    const diffs = []
    for (const k of keys) {
      const o = original?.[k]
      const u = updated?.[k]
      const same = JSON.stringify(o || '') === JSON.stringify(u || '')
      if (!same) diffs.push({ key: k, before: o, after: u })
    }
    if (diffs.length === 0) return <p className="text-sm text-gray-600">No changes detected.</p>
    return (
      <div className="space-y-3">
        {diffs.map((d) => (
          <div key={d.key} className="p-3 border rounded bg-gray-50">
            <div className="text-sm font-semibold text-gray-800">{d.key}</div>
            <div className="text-xs text-gray-500 mt-1">Before:</div>
            <pre className="whitespace-pre-wrap text-sm text-gray-700">{typeof d.before === 'string' ? d.before || '—' : JSON.stringify(d.before, null, 2)}</pre>
            <div className="text-xs text-gray-500 mt-1">After:</div>
            <pre className="whitespace-pre-wrap text-sm text-gray-700">{typeof d.after === 'string' ? d.after || '—' : JSON.stringify(d.after, null, 2)}</pre>
          </div>
        ))}
      </div>
    )
  }

  const renderResumeColumn = (r) => {
    return (
      <div className="p-4">
        <h4 className="text-lg font-bold text-gray-800">{r?.name || '—'}</h4>
        <div className="text-sm text-gray-600 mt-1">{r?.email || ''} {r?.phone ? ` • ${r.phone}` : ''}</div>
        {r?.summary && (
          <div className="mt-3">
            <div className="text-sm font-semibold text-gray-700">Summary</div>
            <p className="text-sm text-gray-700 mt-1">{r.summary}</p>
          </div>
        )}

        {r?.skills && r.skills.length > 0 && (
          <div className="mt-3">
            <div className="text-sm font-semibold text-gray-700">Skills</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {r.skills.map((s, i) => (
                <span key={i} className="px-2 py-1 bg-gray-100 text-sm text-gray-800 rounded-full">{s}</span>
              ))}
            </div>
          </div>
        )}

        {r?.accomplishments && r.accomplishments.length > 0 && (
          <div className="mt-3">
            <div className="text-sm font-semibold text-gray-700">Accomplishments</div>
            <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
              {r.accomplishments.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        )}

        {r?.experience && r.experience.length > 0 && (
          <div className="mt-3">
            <div className="text-sm font-semibold text-gray-700">Experience</div>
            <div className="mt-2 space-y-3">
              {r.experience.map((e, idx) => (
                <div key={idx} className="p-2 border rounded bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{e.title || '—'}</div>
                      <div className="text-xs text-gray-500">{e.company || ''}</div>
                    </div>
                    <div className="text-xs text-gray-500">{e.duration || ''}</div>
                  </div>
                  {e.responsibilities && e.responsibilities.length > 0 && (
                    <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
                      {e.responsibilities.map((resp, i2) => (
                        <li key={i2}>{resp}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

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
        <div className="p-4 pt-0 max-h-96 overflow-auto">
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here to tailor your resume..."
            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={loading}
          />
          <button
            onClick={handleParse}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Tailoring...
              </>
            ) : (
              'Parse Job Description'
            )}
          </button>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          {parsedData && (
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Suggestions</h3>
                <div className="text-sm text-gray-500">{(parsedData.skills?.length || 0) + (parsedData.requirements?.length || 0)} items</div>
              </div>

              {/* Skills as chips with add buttons */}
              {parsedData.skills && parsedData.skills.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">Skills</div>
                    <button
                      onClick={() => {
                        // add all skills to resumeData
                        const existing = resumeData.skills || []
                        const toAdd = parsedData.skills.filter(s => !existing.includes(s))
                        if (toAdd.length) setResumeData({ ...resumeData, skills: [...existing, ...toAdd] })
                      }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Add all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {parsedData.skills.map((skill, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                        <span className="text-sm text-gray-800">{skill}</span>
                        <button
                          onClick={() => {
                            const existing = resumeData.skills || []
                            if (!existing.includes(skill)) setResumeData({ ...resumeData, skills: [...existing, skill] })
                          }}
                          className="text-xs text-green-600 hover:underline"
                        >
                          +
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements / Qualifications */}
              {parsedData.requirements && parsedData.requirements.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700">Requirements</div>
                  <ul className="list-disc list-inside text-gray-700 mt-2">
                    {parsedData.requirements.map((r, i) => (
                      <li key={i} className="text-sm">{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {showPreview && parsedData && parsedData.updatedResume && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center"
              onClick={cancelPreview}
            >
              <div className="absolute inset-0 bg-black opacity-40"></div>
              <div
                className="relative w-11/12 md:w-3/4 lg:w-2/3 bg-white rounded-lg shadow-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Tailored Resume Preview</h3>
                  <div className="text-sm text-gray-500">Review changes before applying</div>
                </div>
                <div className="flex divide-x max-h-[60vh]">
                  <div className="w-1/2 overflow-auto p-4">
                    <div className="text-sm text-gray-500 mb-2">Before</div>
                    {renderResumeColumn(resumeData)}
                  </div>
                  <div className="w-1/2 overflow-auto p-4 bg-gray-50">
                    <div className="text-sm text-gray-500 mb-2">After</div>
                    {renderResumeColumn(parsedData.updatedResume)}
                  </div>
                </div>
                <div className="p-4 flex justify-end gap-2 border-t">
                  <button onClick={applyUpdatedResume} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Apply Changes</button>
                  <button onClick={cancelPreview} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
