import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../apiClient';
import { InlineSpinner } from '../components/LoadingSpinner';


export default function CreateGoal({ studentId: propStudentId, onGoalCreated, onCancel, inline = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const studentId = propStudentId || searchParams.get('studentId');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skill: '',
    targetDate: ''
  });

  const [loading, setLoading] = useState(false);
  const [createdGoal, setCreatedGoal] = useState(null);
  const [error, setError] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);

  const skillCategories = {
    'Cognitive': ['Attention', 'Observation', 'Comprehension', 'Imitation', 'Memory', 'Problem Solving', 'Creativity'],
    'Physical/Motor': ['Body Awareness', 'Body Image', 'Posture', 'Balance', 'Muscle Control', 'Muscle Coordination', 'Movement Observation', 'Visual Tracking', 'Locomotor & Non-Locomotor Skills', 'Grasp', 'Release', 'Manipulation & Tool Use', 'Bilateral Skills', 'Visual Motor Skills'],
    'Spatial': ['Dimensions/Planes', 'Qualities of Movement', 'Directionality/Laterality', 'Spatial Awareness', 'Body Language', 'Environmental Understanding', 'Geographical Distinctions'],
    'Auditory/Speech': ['Listening', 'Sound Differentiation', 'Sound Matching', 'Sound Identification', 'Sound Imitation', 'Sequencing', 'Sound/Word Vocabulary', 'Comprehension & Expression', 'Articulation', 'Diction'],
    'Voice/Communication': ['Sentence and Voice Qualities', 'Modulation', 'Volume', 'Pitch', 'Speed', 'Tone', 'Stress', 'Clarity', 'Pause', 'Punctuation'],
    'Social/Emotional': ['Emotions', 'Relationships', 'Role Play', 'Understanding of Role Required + Execution'],
    'Visual/Reading': ['Visual Discriminations', 'Shapes', 'Alphabets', 'Words', 'Sentences', 'Scripts', 'Visual Sequential Memory']
  };

  const filteredSkills = useMemo(() => {
    if (!skillSearch) return skillCategories;

    const filtered = {};
    Object.entries(skillCategories).forEach(([category, skills]) => {
      const matchingSkills = skills.filter(skill =>
        skill.toLowerCase().startsWith(skillSearch.toLowerCase())
      );
      if (matchingSkills.length > 0) {
        filtered[category] = matchingSkills;
      }
    });
    return filtered;
  }, [skillSearch, skillCategories]);

  const getBestMatch = (input) => {
    if (!input) return '';
    const allSkills = Object.values(skillCategories).flat();
    const exactMatch = allSkills.find(skill => skill.toLowerCase() === input.toLowerCase());
    if (exactMatch) return exactMatch;

    const startsWith = allSkills.filter(skill => skill.toLowerCase().startsWith(input.toLowerCase()));
    return startsWith.length > 0 ? startsWith[0] : input;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillSelect = (skill) => {
    setFormData(prev => ({ ...prev, skill }));
    setShowSkillDropdown(false);
    setSkillSearch('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!studentId) {
      setError('Student ID is required');
      return;
    }

    setLoading(true);
    try {
      const goalData = {
        studentId: parseInt(studentId),
        title: formData.title,
        description: formData.description || null,
        skill: formData.skill,
        targetDate: formData.targetDate || null
      };

      const result = await apiClient.createGoal(goalData);
      const newGoal = { ...goalData, id: result.goalId, status: 'ACTIVE' };

      if (inline && onGoalCreated) {
        onGoalCreated(newGoal);
      } else {
        setCreatedGoal(newGoal);
        setFormData({
          title: '',
          description: '',
          skill: '',
          targetDate: ''
        });
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      setError('Failed to create goal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (inline) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-6">Create New Goal</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 text-red-700 dark:text-red-400 rounded-xl">
              {error}
            </div>
          )}

          {createdGoal && (
            <div className="bg-green-50 border border-green-200 rounded-3xl shadow-lg p-6 max-w-4xl mx-auto mb-6">
              <h2 className="text-2xl font-bold text-green-800 mb-4">Goal Created Successfully!</h2>
              <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-700">
                <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">{createdGoal.title}</h3>
                {createdGoal.description && <p className="mt-2 text-neutral-600 dark:text-neutral-300">{createdGoal.description}</p>}
                {createdGoal.skill && <span className="inline-block px-3 py-1 bg-pink-500 text-white rounded-full text-sm mt-2">{createdGoal.skill}</span>}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-lg p-8 max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
                  placeholder="Enter goal title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
                  placeholder="Describe the goal in detail"
                />
              </div>

              {/* Skill */}
              <div className="relative">
                <label className="block text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Standard (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.skill}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, skill: e.target.value }));
                      setSkillSearch(e.target.value);
                      setShowSkillDropdown(true);
                    }}
                    onFocus={() => setShowSkillDropdown(true)}
                    onBlur={() => {
                      const validatedSkill = getBestMatch(formData.skill);
                      setFormData(prev => ({ ...prev, skill: validatedSkill }));
                    }}
                    placeholder="Type or select skill area"
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
                  />
                  {showSkillDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                      {Object.entries(filteredSkills).map(([category, skills]) => (
                        <div key={category} className="p-2">
                          <div className="text-sm font-semibold text-neutral-600 dark:text-neutral-300 px-2 py-1 bg-neutral-50 dark:bg-neutral-800 rounded">
                            {category}
                          </div>
                          {skills.map((skill) => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => handleSkillSelect(skill)}
                              className="w-full text-left px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:text-neutral-800 dark:hover:text-neutral-100 rounded transition-colors text-neutral-900 dark:text-neutral-100"
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      ))}
                      {Object.keys(filteredSkills).length === 0 && (
                        <div className="p-4 text-neutral-500 dark:text-neutral-400 text-center">
                          No skills found matching "{skillSearch}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {showSkillDropdown && (
                  <div
                    className="fixed inset-0 z-5"
                    onClick={() => setShowSkillDropdown(false)}
                  />
                )}
              </div>

              {/* Target Date */}
              <div>
                <label className="block text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Target Date
                </label>
                <input
                  type="date"
                  name="targetDate"
                  value={formData.targetDate}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-5 py-2.5 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 text-sm rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors disabled:opacity-50"
                >
                  {loading ? <span className="flex items-center justify-center gap-2"><InlineSpinner /> Creating...</span> : 'Create Goal'}
                </button>
                <button
                  type="button"
                  onClick={onCancel || (() => navigate(-1))}
                  className="px-4 py-2.5 text-sm text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
      </div>
    );
  }

  return (
    <>

          {createdGoal && (
            <div className="bg-green-50 border border-green-200 rounded-3xl shadow-lg p-6 max-w-4xl mx-auto mb-6">
              <h2 className="text-2xl font-bold text-green-800 mb-4">Goal Created Successfully!</h2>
              <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-700">
                <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">{createdGoal.title}</h3>
                {createdGoal.description && <p className="mt-2 text-neutral-600 dark:text-neutral-300">{createdGoal.description}</p>}
                {createdGoal.skill && <span className="inline-block px-3 py-1 bg-pink-500 text-white rounded-full text-sm mt-2">{createdGoal.skill}</span>}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-lg p-8 max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
                  placeholder="Enter goal title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
                  placeholder="Describe the goal in detail"
                />
              </div>

              {/* Skill */}
              <div className="relative">
                <label className="block text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Standard (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.skill}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, skill: e.target.value }));
                      setSkillSearch(e.target.value);
                      setShowSkillDropdown(true);
                    }}
                    onFocus={() => setShowSkillDropdown(true)}
                    onBlur={() => {
                      const validatedSkill = getBestMatch(formData.skill);
                      setFormData(prev => ({ ...prev, skill: validatedSkill }));
                    }}
                    placeholder="Type or select skill area"
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
                  />
                  {showSkillDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                      {Object.entries(filteredSkills).map(([category, skills]) => (
                        <div key={category} className="p-2">
                          <div className="text-sm font-semibold text-neutral-600 dark:text-neutral-300 px-2 py-1 bg-neutral-50 dark:bg-neutral-800 rounded">
                            {category}
                          </div>
                          {skills.map((skill) => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => handleSkillSelect(skill)}
                              className="w-full text-left px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:text-neutral-800 dark:hover:text-neutral-100 rounded transition-colors text-neutral-900 dark:text-neutral-100"
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      ))}
                      {Object.keys(filteredSkills).length === 0 && (
                        <div className="p-4 text-neutral-500 dark:text-neutral-400 text-center">
                          No skills found matching "{skillSearch}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {showSkillDropdown && (
                  <div
                    className="fixed inset-0 z-5"
                    onClick={() => setShowSkillDropdown(false)}
                  />
                )}
              </div>

              {/* Target Date */}
              <div>
                <label className="block text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Target Date
                </label>
                <input
                  type="date"
                  name="targetDate"
                  value={formData.targetDate}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-5 py-2.5 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 text-sm rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-300 transition-colors disabled:opacity-50"
                >
                  {loading ? <span className="flex items-center justify-center gap-2"><InlineSpinner /> Creating...</span> : 'Create Goal'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2.5 text-sm text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
    </>
  );
}
