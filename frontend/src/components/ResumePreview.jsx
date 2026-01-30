export default function ResumePreview({ resumeData }) {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
        <h1 className="text-4xl font-bold mb-2">{resumeData.name}</h1>
        <div className="flex flex-wrap gap-4 text-sm">
          <span>📧 {resumeData.email}</span>
          <span>📱 {resumeData.phone}</span>
          {resumeData.location && <span>📍 {resumeData.location}</span>}
          {resumeData.linkedin && <span>🔗 {resumeData.linkedin}</span>}
        </div>
      </div>

      <div className="p-8">
        {/* Summary Section */}
        {resumeData.summary && (
          <section className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-blue-600 pb-2">
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
          </section>
        )}

        {/* Experience Section */}
        {resumeData.experience && resumeData.experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-blue-600 pb-2">
              Work Experience
            </h2>
            {resumeData.experience.map((exp, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{exp.title}</h3>
                    <p className="text-gray-600">{exp.company}</p>
                  </div>
                  <span className="text-gray-500 text-sm">{exp.duration}</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {exp.responsibilities?.map((resp, idx) => (
                    <li key={idx}>{resp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {/* Education Section */}
        {resumeData.education && resumeData.education.length > 0 && (
          <section className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-blue-600 pb-2">
              Education
            </h2>
            {resumeData.education.map((edu, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{edu.degree}</h3>
                    <p className="text-gray-600">{edu.school}</p>
                  </div>
                  <span className="text-gray-500 text-sm">{edu.year}</span>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Skills Section */}
        {resumeData.skills && resumeData.skills.length > 0 && (
          <section className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-blue-600 pb-2">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
