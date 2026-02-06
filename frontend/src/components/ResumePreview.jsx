import { useRef, useState } from 'react'
import html2pdf from 'html2pdf.js'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import { saveAs } from 'file-saver'

export default function ResumePreview({ resumeData }) {
  const resumeRef = useRef()
  const [selectedTemplate, setSelectedTemplate] = useState('faang')
  console.log('ResumePreview resumeData:', resumeData)

  const downloadPDF = () => {
    const element = resumeRef.current
    const opt = {
      margin: 0.25,
      filename: `${resumeData.name.replace(/\s+/g, '_')}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.75 },
      html2canvas: { 
        scale: 1.5,
        useCORS: true,
        letterRendering: true,
        logging: false
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['css', 'legacy'] }
    }
    html2pdf().set(opt).from(element).save()
  }

  const previewPDF = async () => {
    const element = resumeRef.current
    const opt = {
      margin: 0.25,
      filename: `${resumeData.name.replace(/\s+/g, '_')}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.75 },
      html2canvas: { 
        scale: 1.5,
        useCORS: true,
        letterRendering: true,
        logging: false
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['css', 'legacy'] }
    }

    try {
      const worker = html2pdf().set(opt).from(element)
      // Generate PDF and get jsPDF instance, then export blob
      const pdf = await worker.toPdf().get('pdf')
      const blob = pdf.output('blob')
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (err) {
      console.error('PDF preview failed:', err)
      // fallback: trigger save
      html2pdf().set(opt).from(element).save()
    }
  }

  const downloadWord = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: resumeData.name,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun(`${resumeData.email} | ${resumeData.phone}`)
            ],
            spacing: { after: 400 }
          }),
          
          ...(resumeData.summary ? [
            new Paragraph({
              text: "PROFESSIONAL SUMMARY",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 200 }
            }),
            new Paragraph({
              text: resumeData.summary,
              spacing: { after: 400 }
            })
          ] : []),
          
          ...(resumeData.skills?.length > 0 ? [
            new Paragraph({
              text: "SKILLS",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 200 }
            }),
            new Paragraph({
              text: resumeData.skills.join(' • '),
              spacing: { after: 200 }
            })
          ] : [])
        ]
      }]
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, `${resumeData.name.replace(/\s+/g, '_')}_Resume.docx`)
  }

  const FAANGTemplate = () => (
    <div className="max-w-4xl mx-auto bg-white p-6">
      {/* Header - Clean and Minimal */}
      <header className="border-b border-gray-800 pb-3 mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{resumeData.name}</h1>
        <div className="flex flex-wrap gap-3 text-xs text-gray-700">
          <span>{resumeData.email}</span>
          {resumeData.phone && <span>• {resumeData.phone}</span>}
          {resumeData.location && <span>• {resumeData.location}</span>}
          {resumeData.linkedin && <span>• {resumeData.linkedin}</span>}
        </div>
      </header>

      {/* Summary - Compact */}
      {resumeData.summary && (
        <section className="mb-4" style={{ pageBreakInside: 'auto', breakInside: 'auto' }}>
          <p className="text-sm text-gray-800 leading-relaxed">{resumeData.summary}</p>
        </section>
      )}

      {/* Skills - One line format */}
      {resumeData.skills && resumeData.skills.length > 0 && (
        <section className="mb-4" style={{ pageBreakInside: 'auto', breakInside: 'auto' }}>
          <h2 className="text-sm font-bold text-gray-900 uppercase mb-1.5 tracking-wide">Technical Skills</h2>
          <p className="text-sm text-gray-800 leading-relaxed">
            {resumeData.skills.join(' • ')}
          </p>
        </section>
      )}

      {/* Experience - Compact with impact */}
      {resumeData.experience && resumeData.experience.length > 0 && (
        <section className="mb-4" style={{ pageBreakInside: 'auto', breakInside: 'auto' }}>
          <h2 className="text-sm font-bold text-gray-900 uppercase mb-2 tracking-wide">Experience</h2>
          {resumeData.experience.map((exp, index) => {
            const firstResp = exp.responsibilities?.[0]
            const otherResps = exp.responsibilities?.slice(1) || []
            return (
              <div key={index} className="mb-3" style={{ pageBreakInside: 'auto', breakInside: 'auto' }}>
                {/* Keep header + first bullet together to avoid orphaned headers */}
                <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">{exp.title}</h3>
                      <span className="text-xs text-gray-600">@ {exp.company}</span>
                    </div>
                    <span className="text-xs text-gray-600">{exp.duration}</span>
                  </div>
                  {firstResp && (
                    <ul className="list-none space-y-0.5 text-sm text-gray-800 leading-relaxed mt-1">
                      <li className="pl-3 relative before:content-['▸'] before:absolute before:left-0 before:text-gray-400">
                        {firstResp}
                      </li>
                    </ul>
                  )}
                </div>

                {otherResps.length > 0 && (
                  <ul className="list-none space-y-0.5 text-sm text-gray-800 leading-relaxed mt-1">
                    {otherResps.map((resp, idx) => (
                      <li key={idx} className="pl-3 relative before:content-['▸'] before:absolute before:left-0 before:text-gray-400">
                        {resp}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </section>
      )}

      {/* Education - Minimal */}
      {resumeData.education && resumeData.education.length > 0 && (
        <section className="mb-4" style={{ pageBreakInside: 'auto', breakInside: 'auto' }}>
          <h2 className="text-sm font-bold text-gray-900 uppercase mb-1.5 tracking-wide">Education</h2>
          {resumeData.education.map((edu, index) => (
            <div key={index} className="flex justify-between text-sm text-gray-800 mb-1">
              <div>
                <span className="font-semibold">{edu.degree}</span>
                <span className="text-gray-600"> • {edu.school}</span>
              </div>
              <span className="text-gray-600">{edu.year}</span>
            </div>
          ))}
        </section>
      )}

      {/* Accomplishments - Optional */}
      {resumeData.accomplishments && resumeData.accomplishments.length > 0 && (
        <section className="mb-4" style={{ pageBreakInside: 'auto', breakInside: 'auto' }}>
          <h2 className="text-sm font-bold text-gray-900 uppercase mb-1.5 tracking-wide">Achievements</h2>
          <ul className="list-none space-y-0.5 text-sm text-gray-800 leading-relaxed">
            {resumeData.accomplishments.map((a, i) => (
              <li key={i} className="pl-3 relative before:content-['▸'] before:absolute before:left-0 before:text-gray-400">
                {a}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-3 mb-4 justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTemplate('faang')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              selectedTemplate === 'faang'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            FAANG
          </button>
          <button
            onClick={() => setSelectedTemplate('modern')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              selectedTemplate === 'modern'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Modern
          </button>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={previewPDF}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 transition-colors"
          >
            Preview PDF
          </button>
          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
          <button
            onClick={downloadWord}
            className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Word
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div ref={resumeRef}>
          {selectedTemplate === 'faang' ? (
            <FAANGTemplate />
          ) : (
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
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
                {resumeData.summary && (
                  <section className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-blue-600 pb-2">
                      Professional Summary
                    </h2>
                    <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
                  </section>
                )}

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
                        <ul className="list-disc list-inside space-y-2 text-gray-700 pl-5">
                          {exp.responsibilities?.map((resp, idx) => (
                            <li key={idx} className="leading-relaxed">{resp}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </section>
                )}

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

                {resumeData.accomplishments && resumeData.accomplishments.length > 0 && (
                  <section className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-blue-600 pb-2">
                      Accomplishments
                    </h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 pl-5">
                      {resumeData.accomplishments.map((a, i) => (
                        <li key={i} className="leading-relaxed">{a}</li>
                      ))}
                    </ul>
                  </section>
                )}

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
          )}
        </div>
      </div>
    </div>
  )
}
