import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { apiClient } from '../apiClient';
import LoadingSpinner from '../components/LoadingSpinner';
import RichTextEditor from '../components/RichTextEditor';
import DateFieldInput from '../components/DateFieldInput';
import TimeFieldInput from '../components/TimeFieldInput';

function formatFormType(str) {
  if (!str) return '';
  const spaced = str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  const tokens = spaced.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return '';
  const hasAcronym = tokens.slice(1).some(t => t.length >= 2 && /^[A-Z]+$/.test(t));
  if (hasAcronym) tokens[0] = tokens[0].toUpperCase();
  else tokens[0] = tokens[0].charAt(0).toUpperCase() + tokens[0].slice(1);
  return tokens.join(' ').trim();
}

export default function MeetingNoteEditor() {
  const { studentId, noteId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [student, setStudent] = useState(null);
  const [goals, setGoals] = useState([]);
  const [reports, setReports] = useState([]);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [goalId, setGoalId] = useState('');
  const [reportId, setReportId] = useState('');
  const [noteDate, setNoteDate] = useState('');
  const [noteTime, setNoteTime] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [studentData, allReports] = await Promise.all([
          apiClient.getStudent(studentId),
          apiClient.getStudentReports(studentId),
        ]);
        setStudent(studentData);
        setGoals(studentData.goals || []);
        setReports(allReports);

        if (noteId) {
          const notes = await apiClient.getMeetingNotes(studentId);
          const note = notes.find(n => String(n.id) === String(noteId));
          if (note) {
            setTitle(note.title);
            setContent(note.content);
            setGoalId(note.goalId || '');
            setReportId(note.reportId || '');
            const d = new Date(note.createdAt);
            setNoteDate(d.toISOString().split('T')[0]);
            setNoteTime(d.toTimeString().slice(0, 5));
          }
        } else {
          const now = new Date();
          setNoteDate(now.toISOString().split('T')[0]);
          setNoteTime(now.toTimeString().slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId, noteId]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || content === '<p></p>') return;
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        content,
        goalId: goalId || null,
        reportId: reportId || null,
      };

      if (noteId) {
        await apiClient.updateMeetingNote(noteId, payload);
      } else {
        await apiClient.createMeetingNote({ ...payload, studentId });
      }
      navigate(`/student/${studentId}`);
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const uniqueReportTypes = [...new Map(reports.map(r => [r.type, r])).values()];
  const isEdit = Boolean(noteId);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/student/${studentId}`)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 transition-all mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Student
        </button>
        <div className="mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isEdit ? "Meeting title..." : "Untitled Meeting"}
            className="w-full bg-transparent border-none outline-none font-serif text-3xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-300 dark:placeholder-neutral-600"
          />
          {student && (
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-2">
              {student.firstName} {student.lastName}
            </p>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column */}
        <div className="flex-1 space-y-5">

          <div className="flex flex-wrap gap-3">
            <div className="w-52">
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
                Date
              </label>
              <DateFieldInput
                value={noteDate}
                onChange={setNoteDate}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
              />
            </div>
            <div className="w-40">
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
                Time
              </label>
              <TimeFieldInput
                value={noteTime}
                onChange={setNoteTime}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
              Notes *
            </label>
            <RichTextEditor
              content={content}
              onChange={setContent}
            />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-full md:w-72 shrink-0">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 p-5 space-y-5 md:sticky md:top-6">
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
                Link to Goal
              </label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-neutral-400"
              >
                <option value="">None</option>
                {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
                Link to IEP
              </label>
              <select
                value={reportId}
                onChange={(e) => setReportId(e.target.value)}
                className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-neutral-400"
              >
                <option value="">None</option>
                {uniqueReportTypes.map(r => <option key={r.id} value={r.id}>{formatFormType(r.type)}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !title.trim() || !content.trim() || content === '<p></p>'}
                className="w-full px-4 py-2.5 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors disabled:opacity-40"
              >
                {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Note'}
              </button>
              <button
                onClick={() => navigate(`/student/${studentId}`)}
                disabled={saving}
                className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
