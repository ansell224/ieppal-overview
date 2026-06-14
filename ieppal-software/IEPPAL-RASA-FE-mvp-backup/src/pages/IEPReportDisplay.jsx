import React, { useState, useEffect } from "react";
import { apiClient } from "../apiClient";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

export default function IEPReportDisplay() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [error, setError] = useState(null);
  const [caseHistorySections, setCaseHistorySections] = useState([]);

  const studentId = searchParams.get('studentId');
  const reportId = searchParams.get('reportId');

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        if (studentId) {
          if (reportId) {
            const data = await apiClient.getIEPReport(studentId, reportId);
            const reports = await apiClient.getStudentReports(studentId);
            const report = reports.find(r => r.id === parseInt(reportId));
            if (report && data.student) {
              setReportData({ student: data.student, report });
              if (report.type === 'caseHistory') {
                const config = await apiClient.getFormConfig('caseHistory');
                if (config?.config) setCaseHistorySections(JSON.parse(config.config));
              }
            } else {
              setError('Report not found');
            }
          } else {
            const data = await apiClient.getIEPReport(studentId);
            setReportData(data);
          }
        } else {
          setError('No student ID provided');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [studentId, reportId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !reportData) {
    return (
      <>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-800 dark:text-neutral-200">
          {error || 'No IEP Report Available'}
        </h2>
        <button
          onClick={() => navigate('/classrooms')}
          className="mt-4 flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
        >
          <span className="text-base leading-none">&lsaquo;</span>
          <span>Back to Classrooms</span>
        </button>
      </>
    );
  }

  const { student, goals = [], iedReport, report } = reportData;
  const currentReport = report || iedReport;
  const isCaseHistory = currentReport?.type === 'caseHistory';
  const skillsData = currentReport && !isCaseHistory ? JSON.parse(currentReport.content || '{}') : {};
  const caseHistoryData = currentReport && isCaseHistory ? JSON.parse(currentReport.content || '{}') : null;

  const handleExportPDF = async () => {
    setExportingPdf(true);

    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);

      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;

    // Title header
    doc.setFillColor(55, 65, 81);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("INDIVIDUAL EDUCATION PLAN", pageWidth / 2, 18, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(209, 213, 219);
    doc.text(isCaseHistory ? "Case History Report" : "Skills Assessment Report", pageWidth / 2, 28, { align: "center" });

    // Student info section
    doc.setFillColor(229, 231, 235);
    doc.roundedRect(margin, 48, pageWidth - margin * 2, 9, 2, 2, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text("STUDENT INFORMATION", margin + 3, 54);

    const studentTableData = [
      {
        col1: { content: "Student Name", styles: { fontStyle: "bold", textColor: [75, 85, 99] } },
        col2: student.name || "N/A",
        col3: { content: "Grade", styles: { fontStyle: "bold", textColor: [75, 85, 99] } },
        col4: student.level || "N/A"
      },
      {
        col1: { content: "Classroom", styles: { fontStyle: "bold", textColor: [75, 85, 99] } },
        col2: student.classroom?.name || "N/A",
        col3: { content: "Teacher", styles: { fontStyle: "bold", textColor: [75, 85, 99] } },
        col4: student.teacher?.name || "N/A"
      },
      {
        col1: { content: "Date", styles: { fontStyle: "bold", textColor: [75, 85, 99] } },
        col2: currentReport ? new Date(currentReport.createdAt).toLocaleDateString() : "N/A",
        col3: { content: "Version", styles: { fontStyle: "bold", textColor: [75, 85, 99] } },
        col4: currentReport?.version || "N/A"
      }
    ];

    autoTable(doc, {
      startY: 59,
      body: studentTableData,
      columns: [
        { dataKey: "col1" },
        { dataKey: "col2" },
        { dataKey: "col3" },
        { dataKey: "col4" }
      ],
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 3, textColor: [31, 41, 55] },
      columnStyles: {
        col1: { cellWidth: (pageWidth - margin * 2) * 0.22, fontStyle: "bold" },
        col2: { cellWidth: (pageWidth - margin * 2) * 0.28 },
        col3: { cellWidth: (pageWidth - margin * 2) * 0.22, fontStyle: "bold" },
        col4: { cellWidth: (pageWidth - margin * 2) * 0.28 }
      },
      margin: { left: margin, right: margin }
    });

    let currentY = doc.lastAutoTable.finalY + 12;

    const sections = isCaseHistory
      ? getOrganizedCaseHistory(caseHistoryData, caseHistorySections)
      : getOrganizedSkills(skillsData);

    sections.forEach((section, idx) => {
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }

      // Section header
      doc.setFillColor(229, 231, 235);
      doc.roundedRect(margin, currentY, pageWidth - margin * 2, 9, 2, 2, "F");
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(31, 41, 55);
      doc.text(section.title, margin + 3, currentY + 6);
      currentY += 11;

      const data = isCaseHistory ? section.fields : section.skills;
      const tableData = data.map(item => ([
        { content: isCaseHistory ? item.name : item.name, styles: { fontStyle: "bold", textColor: [75, 85, 99] } },
        { content: isCaseHistory ? item.value : item.assessment, styles: { textColor: [31, 41, 55] } }
      ]));

      autoTable(doc, {
        startY: currentY,
        body: tableData,
        columns: [
          { dataKey: "col1" },
          { dataKey: "col2" }
        ],
        theme: "grid",
        styles: {
          fontSize: 9.5,
          cellPadding: 4,
          lineColor: [209, 213, 219],
          lineWidth: 0.2
        },
        columnStyles: {
          col1: { cellWidth: (pageWidth - margin * 2) * 0.32, fillColor: [249, 250, 251] },
          col2: { cellWidth: (pageWidth - margin * 2) * 0.68, fillColor: [255, 255, 255] }
        },
        margin: { left: margin, right: margin }
      });

      currentY = doc.lastAutoTable.finalY + 8;
    });

      doc.save(`${student.name || "Report"}_${isCaseHistory ? 'CaseHistory' : 'SkillsAssessment'}.pdf`);
    } catch (exportError) {
      setError(exportError.message || 'Failed to export PDF');
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <>



        <div className="p-8 flex justify-end">
          <button
            onClick={handleExportPDF}
            disabled={exportingPdf}
            className="px-5 py-2 bg-neutral-800 text-white text-sm rounded-lg hover:bg-neutral-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            {exportingPdf ? 'Exporting...' : 'Export to PDF'}
          </button>
        </div>

        <div
          id="reportContent"
          className="pt-8 p-8 w-full max-w-7xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
              {isCaseHistory ? 'Case History' : 'Skills Assessment'} for {student.name || "N/A"}
            </h1>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm mb-6">
            <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
              STUDENT INFORMATION
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <InfoRow label="Student Name" value={student.name} />
                <InfoRow label="Classroom" value={student.classroom?.name} />
                <InfoRow label="Created Date" value={currentReport ? new Date(currentReport.createdAt).toLocaleDateString() : 'N/A'} />
              </div>
              <div className="space-y-4">
                <InfoRow label="Grade" value={student.level} />
                <InfoRow label="Teacher Name" value={student.teacher?.name} />
                <InfoRow label="Version" value={currentReport?.version} />
              </div>
            </div>
          </div>

          {isCaseHistory ? (
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm mb-6">
              <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
                CASE HISTORY
              </h2>
              <div className="space-y-6">
                {getOrganizedCaseHistory(caseHistoryData, caseHistorySections).map((section, idx) => (
                  <div key={idx} className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-3 pb-2 border-b dark:border-neutral-600">{section.title}</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {section.fields.map((field, i) => (
                        <InfoRow key={i} label={field.name} value={field.value} />
                      ))}
                    </div>
                  </div>
                ))}
                {getOrganizedCaseHistory(caseHistoryData, caseHistorySections).length === 0 && (
                  <p className="text-neutral-600 dark:text-neutral-300 italic">No case history data available</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm mb-6">
              <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
                SKILLS ASSESSMENT
              </h2>
              <div className="space-y-6">
                {getOrganizedSkills(skillsData).map((section, idx) => (
                  <div key={idx} className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-3 pb-2 border-b dark:border-neutral-600">{section.title}</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {section.skills.map((skill, i) => (
                        <InfoRow key={i} label={skill.name} value={skill.assessment} />
                      ))}
                    </div>
                  </div>
                ))}
                {getOrganizedSkills(skillsData).length === 0 && (
                  <p className="text-neutral-600 dark:text-neutral-300 italic">No skills assessment data available</p>
                )}
              </div>
            </div>
          )}


        </div>

        <div className="p-8 flex justify-center">
          <button
            onClick={() => navigate(`/student/${studentId}`)}
            className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
          >
            Return to Student View
          </button>
        </div>
    </>
  );
}

const getOrganizedCaseHistory = (data, sections) => {
  if (!data || !sections || sections.length === 0) return [];

  return sections.map(section => ({
    title: section.title,
    fields: section.fields
      .filter(field => data[field.label] != null && data[field.label] !== '' && data[field.label] !== false)
      .map(field => ({
        name: field.label,
        value: typeof data[field.label] === 'object'
          ? Object.entries(data[field.label]).filter(([k, v]) => v === true).map(([k]) => k).join(', ') || 'N/A'
          : String(data[field.label])
      }))
  })).filter(section => section.fields.length > 0);
};

const getOrganizedSkills = (skillsData) => {
  const sections = [
    { title: "Cognitive--Perceptual", skills: ["Attention", "Observation", "Comprehension", "Imitation", "Memory"] },
    { title: "Body Awareness & Visual Tracking", skills: ["Body Awareness", "Body Image", "Posture", "Balance", "Muscle Control", "Muscle Co-ordination", "Movement Observation", "Visual Tracking"] },
    { title: "Gross Motor & Manipulation", skills: ["Locomotor & Non-Locomotor", "Dimensions/Planes", "Qualities of Movement", "Directionality/Laterality", "Spatial Awareness", "Body Language"] },
    { title: "Manipulation & Tool Use", skills: ["Grasp", "Release", "Manipulation & Tool Use", "Bilateral Skills"] },
    { title: "Listening & Sound Matching", skills: ["Listening", "Sound Differentiation", "Matching Sound"] },
    { title: "Speech Sound Skills", skills: ["Sound Identification", "Sound Imitation", "Sound/Word Sequencing", "Vocabulary", "Comprehension & Expression"] },
    { title: "Sentence & Voice Qualities", skills: ["Sentence & Voice Qualities", "Modulation", "Volume", "Pitch", "Speed"] },
    { title: "Speech Clarity", skills: ["Tone", "Stress", "Clarity", "Pause", "Punctuation", "Articulation", "Diction"] },
    { title: "Social & Problem-Solving", skills: ["Emotions", "Relationships", "Role Play", "Understanding of Role Required + Execution", "Environmental Understanding", "Problem Solving", "Geographical Distinctions", "Creativity"] },
    { title: "Visual Discrimination & Memory", skills: ["Visual Discriminations", "Shapes", "Alphabets", "Words", "Sentences", "Scripts", "Visual Motor Skills", "Visual Sequential Memory"] }
  ];

  return sections.map(section => ({
    title: section.title,
    skills: section.skills
      .filter(skill => skillsData[skill])
      .map(skill => ({
        name: skill,
        assessment: typeof skillsData[skill] === 'object' ? JSON.stringify(skillsData[skill], null, 2) : skillsData[skill]
      }))
  })).filter(section => section.skills.length > 0);
};

// Simply renders a label + value row
const InfoRow = ({ label, value }) => (
  <div className="border-b border-neutral-300 dark:border-neutral-600 pb-2">
    <p className="font-semibold text-neutral-700 dark:text-neutral-300">{label}</p>
    <p className="text-neutral-900 dark:text-neutral-100">{value || "N/A"}</p>
  </div>
);

// Renders a heading + multi-line paragraph
const FormattedSection = ({ title, content }) => (
  <div className="mb-2">
    <h4 className="font-medium text-neutral-600 dark:text-neutral-300 mb-1">{title}</h4>
    <p className="text-neutral-800 dark:text-neutral-200 text-sm whitespace-pre-wrap">{content || "N/A"}</p>
  </div>
);
