import React, { useState } from 'react';
import { Plus, X, Trash2, AlertTriangle } from 'lucide-react';
import { Modal, ModalHeader, ModalContent, ModalFooter, Button, Input, ErrorDisplay } from './UI';
import { apiClient } from '../apiClient';
import { InlineSpinner } from './LoadingSpinner';
import { CLASSROOM_ICONS } from '../utils/classroomIcons';

const inputClass = "w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 focus:bg-white dark:focus:bg-neutral-700 transition-colors";

const buildEmptyStrategyForm = (defaultCategory = '') => ({
  strategyName: '',
  strategyCategory: defaultCategory,
  primaryDiagnosis: '',
  briefOverview: '',
  bookTitle: '',
  author: '',
  functionalNeedAreas: '',
  evidenceBaseSummary: '',
  applicableDiagnoses: '',
  implementationStepsSummary: '',
  resourcesNeeded: '',
  challengesSolutionsSummary: '',
  caseStudySummary: '',
  successCriteriaSummary: '',
});

// Add Classroom Modal
export const AddClassroomModal = ({ isOpen, onClose, onSuccess, existingClassrooms = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'book',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiClient.createClassroom(formData);
      setFormData({ name: '', description: '', icon: 'book' });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', icon: 'book' });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">New Classroom</h2>
          <button
            onClick={handleClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-400 font-medium">{error.message || 'Something went wrong'}</p>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Classroom Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Room 204"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Icon</label>
              <div className="grid grid-cols-6 gap-2">
                {CLASSROOM_ICONS.map(({ id, label, Icon }) => {
                  const selected = formData.icon === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      title={label}
                      onClick={() => setFormData({ ...formData, icon: id })}
                      className={`flex items-center justify-center w-full aspect-square rounded-lg border transition-colors ${
                        selected
                          ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-800 border-neutral-800 dark:border-neutral-200'
                          : 'bg-neutral-50 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 px-5 pb-5">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors disabled:opacity-40"
            >
              {loading ? <span className="flex items-center justify-center gap-2"><InlineSpinner /> Creating...</span> : 'Create Classroom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Classroom Modal
export const DeleteClassroomModal = ({ isOpen, onClose, onConfirm, classroomName, loading = false }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <ModalHeader
        title="Delete Classroom"
        onClose={onClose}
        gradient="from-red-500 to-red-600"
        icon={AlertTriangle}
      />

      <ModalContent>
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Are you sure?
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            You're about to delete <span className="font-semibold">"{classroomName}"</span>.
            This action cannot be undone and will permanently remove all classroom data.
          </p>
        </div>
      </ModalContent>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {loading ? <span className="flex items-center justify-center gap-2"><InlineSpinner /> Deleting...</span> : 'Delete Classroom'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};


// Add Strategy Modal
export const AddStrategyModal = ({
  isOpen,
  onClose,
  onSuccess,
  defaultCategory = '',
  categoryOptions = [],
  diagnosisOptions = [],
  initialData = null
}) => {
  const isEditMode = Boolean(initialData?.id);
  const [formData, setFormData] = useState(buildEmptyStrategyForm(defaultCategory));

  React.useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setFormData({
          strategyName: initialData.strategyName || '',
          strategyCategory: initialData.strategyCategory || '',
          primaryDiagnosis: initialData.primaryDiagnosis || '',
          briefOverview: initialData.briefOverview || '',
          bookTitle: initialData.bookTitle || '',
          author: initialData.author || '',
          functionalNeedAreas: initialData.functionalNeedAreas || '',
          evidenceBaseSummary: initialData.evidenceBaseSummary || '',
          applicableDiagnoses: initialData.applicableDiagnoses || '',
          implementationStepsSummary: initialData.implementationStepsSummary || '',
          resourcesNeeded: initialData.resourcesNeeded || '',
          challengesSolutionsSummary: initialData.challengesSolutionsSummary || '',
          caseStudySummary: initialData.caseStudySummary || '',
          successCriteriaSummary: initialData.successCriteriaSummary || '',
        });
      } else {
        setFormData(buildEmptyStrategyForm(defaultCategory));
      }
    }
  }, [defaultCategory, initialData, isEditMode, isOpen]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isEditMode) {
        await apiClient.updateStrategy(initialData.id, formData);
      } else {
        await apiClient.createStrategy(formData);
      }
      setFormData(buildEmptyStrategyForm(defaultCategory));
      onSuccess();
      onClose();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(buildEmptyStrategyForm(defaultCategory));
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-w-2xl w-full max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
          <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">{isEditMode ? 'Edit Strategy' : 'Add Strategy'}</h2>
          <button onClick={handleClose} className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-400 font-medium">{error.message || 'Something went wrong'}</p>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Strategy Name *</label>
              <input type="text" value={formData.strategyName} onChange={(e) => setFormData({ ...formData, strategyName: e.target.value })} placeholder="e.g. Token Economy System" required className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Category *</label>
                <select value={formData.strategyCategory} onChange={(e) => setFormData({ ...formData, strategyCategory: e.target.value })} required className={inputClass}>
                  <option value="">{categoryOptions.length ? 'Select...' : 'No categories available'}</option>
                  {categoryOptions.map((category) => (
                    <option key={category.id || category.key || category.label} value={category.label}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Primary Diagnosis *</label>
                <select value={formData.primaryDiagnosis} onChange={(e) => setFormData({ ...formData, primaryDiagnosis: e.target.value })} required className={inputClass}>
                  <option value="">{diagnosisOptions.length ? 'Select...' : 'No diagnoses available'}</option>
                  {diagnosisOptions.map((diagnosis) => (
                    <option key={diagnosis.id || diagnosis.key || diagnosis.label} value={diagnosis.label}>
                      {diagnosis.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Brief Overview *</label>
              <textarea value={formData.briefOverview} onChange={(e) => setFormData({ ...formData, briefOverview: e.target.value })} placeholder="A short description of the strategy..." required rows={5} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Evidence Base</label>
                <input type="text" value={formData.bookTitle} onChange={(e) => setFormData({ ...formData, bookTitle: e.target.value })} placeholder="Optional" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Author/Source</label>
                <input type="text" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} placeholder="Optional" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Functional Need Areas</label>
              <input type="text" value={formData.functionalNeedAreas} onChange={(e) => setFormData({ ...formData, functionalNeedAreas: e.target.value })} placeholder="e.g. Executive Function, Attention" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Other Diagnosis</label>
              <input type="text" value={formData.applicableDiagnoses} onChange={(e) => setFormData({ ...formData, applicableDiagnoses: e.target.value })} placeholder="e.g. ADHD; Autism; Dyslexia" className={inputClass} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-neutral-200 dark:border-neutral-700 flex-shrink-0">
            <button type="button" onClick={handleClose} disabled={loading} className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading || !categoryOptions.length || !diagnosisOptions.length || !formData.strategyName.trim() || !formData.strategyCategory || !formData.primaryDiagnosis || !formData.briefOverview.trim()} className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors disabled:opacity-40">
              {loading ? <span className="flex items-center justify-center gap-2"><InlineSpinner /> {isEditMode ? 'Saving...' : 'Creating...'}</span> : isEditMode ? 'Save Changes' : 'Create Strategy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Strategy Modal
export const DeleteStrategyModal = ({ isOpen, onClose, onConfirm, strategyName, loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Delete Strategy
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm font-light">
            Are you sure you want to delete <span className="font-medium text-neutral-700 dark:text-neutral-300">"{strategyName}"</span>? This cannot be undone.
          </p>
        </div>
        <div className="flex items-center gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? <span className="flex items-center justify-center gap-2"><InlineSpinner /> Deleting...</span> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};


import { useEffect, useRef } from "react";

export const NamePromptModal = ({
  isOpen,
  title = "Enter name",
  placeholder = "Template name",
  value,
  error,
  onChange,
  onCancel,
  onConfirm
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{title}</h2>

        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          className={error ? "input-error" : ""}
          onKeyDown={e => {
            if (e.key === "Enter" && value.trim()) onConfirm();
            if (e.key === "Escape") onCancel();
          }}
        />

        {error && (
          <div className="error-text">
            {error}
          </div>
        )}

        <div className="modal-actions">
          <button onClick={onCancel}>Cancel</button>
          <button
            onClick={onConfirm}
            disabled={!value.trim()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
