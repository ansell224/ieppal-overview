import { triggerLogout } from './authLogoutBridge';

/* const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api'
  : 'https://api.rasa.iep-pal.com/api';
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
 

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('authToken');
    
    console.log('Making API request to:', url);
  
    const isFormData = options.body instanceof FormData;

    const config = {
      ...options,
      method: options.method || 'GET',
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    if (options.body && !isFormData && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        const errorMessage = error?.error || error?.message || `Server error (HTTP ${response.status})`;
        const hasAuthState = !!(localStorage.getItem('authToken') || localStorage.getItem('user'));
        const logoutErrors = new Set([
          'ACCOUNT_DISABLED',
          'SESSION_EXPIRED',
          'INVALID_EXPIRED_TOKEN'
        ]);

        // FORCE LOGOUT CONDITIONS
        if (response.status === 401 && hasAuthState && logoutErrors.has(errorMessage)) {
          triggerLogout(errorMessage);
          return; // stop further processing
        }

        if (response.status === 403 && hasAuthState && logoutErrors.has(errorMessage)) {
          triggerLogout(errorMessage);
          return;
        }

        const validationDetails = error?.details || [];

        const customError = new Error(errorMessage);
        customError.status = response.status;
        customError.details = validationDetails;
        customError.isValidationError = response.status === 400 && validationDetails.length > 0;

        throw customError;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.status) throw error; // already a custom error from above
      const networkError = new Error('Unable to connect to server. Please check your connection.');
      networkError.status = 0;
      throw networkError;
    }
  }

  // Auth methods
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
      headers: { Authorization: undefined },
    });
  }

  async register(email, password, name, role = 'TEACHER') {
    return this.request('/auth/register', {
      method: 'POST',
      body: { email, password, name, role },
      headers: { Authorization: undefined },
    });
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: profileData,
    });
  }

  // Classroom methods
  async getClassrooms() {
    return this.request('/classrooms');
  }

  async createClassroom(classroomData) {
    return this.request('/classrooms', {
      method: 'POST',
      body: classroomData,
    });
  }

  async updateClassroom(id, classroomData) {
    return this.request(`/classrooms/${id}`, {
      method: 'PUT',
      body: classroomData,
    });
  }

  async deleteClassroom(id) {
    return this.request(`/classrooms/${id}`, {
      method: 'DELETE',
    });
  }

  // Student methods
  async getStudents() {
    return this.request('/students');
  }

  async createStudent(studentData) {
    return this.request('/students', {
      method: 'POST',
      body: studentData,
    });
  }

  async getStudent(id) {
    return this.request(`/students/${id}`);
  }

  async updateStudent(id, studentData) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: studentData,
    });
  }

  async deleteStudent(id) {
    return this.request(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  // Goal methods
  async getGoals(studentId) {
    return this.request(`/goals?studentId=${studentId}`);
  }

  async createGoal(goalData) {
    return this.request('/goals', {
      method: 'POST',
      body: goalData,
    });
  }

  async getGoal(id) {
    return this.request(`/goals/${id}`);
  }

  async updateGoal(id, goalData) {
    return this.request(`/goals/${id}`, {
      method: 'PUT',
      body: goalData,
    });
  }

  async deleteGoal(id) {
    return this.request(`/goals/${id}`, {
      method: 'DELETE',
    });
  }

  async assignStrategyToGoal(goalId, strategyId) {
    return this.request(`/goals/${goalId}/strategies`, {
      method: 'POST',
      body: { strategyId },
    });
  }

  async removeStrategyFromGoal(goalId, strategyId) {
    return this.request(`/goals/${goalId}/strategies/${strategyId}`, {
      method: 'DELETE',
    });
  }

  async getAIGoalSuggestions(studentId) {
    return this.request('/ai/suggest-goals', {
      method: 'POST',
      body: { studentId },
    });
  }

  async suggestStrategies(params) {
    // params: { goalId } or { studentId }
    return this.request('/ai/suggest-strategies', {
      method: 'POST',
      body: params,
    });
  }

  async updateStrategyEffectiveness(goalId, strategyId, payload) {
    // payload: { effectiveness: 'WORKED' | 'DIDNT_WORK' | 'NEUTRAL' | null, endedAt?: string }
    return this.request(`/goals/${goalId}/strategies/${strategyId}`, {
      method: 'PATCH',
      body: payload,
    });
  }

  async generateSurvey(goalId, options = {}) {
    // options: { questionCount?: number, questionTypes?: string[] }
    return this.request('/ai/generate-survey', {
      method: 'POST',
      body: { goalId, ...options },
    });
  }

  async fillIepFromDoc({ formType, studentId, files }) {
    const form = new FormData();
    form.append('formType', formType);
    form.append('studentId', String(studentId));
    for (const f of files) form.append('files', f);
    return this.request('/ai/fill-iep-from-doc', { method: 'POST', body: form });
  }

  async getGoalInsights(goalId, { force = false } = {}) {
    return this.request('/ai/progress-insights', {
      method: 'POST',
      body: { goalId, force },
    });
  }

  async getCachedGoalInsights(goalId) {
    return this.request(`/ai/progress-insights/${goalId}/latest`, { method: 'GET' });
  }

  async getGoalAnalysisOnly(goalId) {
    return this.request(`/analysis/goal/${goalId}`, { method: 'GET' });
  }

  // Assessment methods
  async getAssessments(studentId) {
    return this.request(`/assessments?studentId=${studentId}`);
  }

  async createAssessment(assessmentData) {
    return this.request('/assessments', {
      method: 'POST',
      body: assessmentData,
    });
  }

  // Report methods
  async getReports() {
    return this.request('/reports');
  }

  async createReport(reportData) {
    return this.request('/reports', {
      method: 'POST',
      body: reportData,
    });
  }

  async updateReport(reportId, content) {
    return this.request(`/reports/${reportId}`, {
      method: 'PATCH',
      body: { content },
    });
  }

  async getStudentReports(studentId) {
    return this.request(`/reports/student/${studentId}`);
  }

  async getIEPReport(studentId, reportId = null) {
    const endpoint = reportId 
      ? `/reports/iep/${studentId}/${reportId}`
      : `/reports/iep/${studentId}`;
    return this.request(endpoint);
  }

  async compareReports(reportId1, reportId2) {
    return this.request(`/reports/compare/${reportId1}/${reportId2}`);
  }

  async compareMultipleReports(reportIds) {
    // Use client-side comparison since backend doesn't support multi-report comparison yet
    return this.clientSideMultipleComparison(reportIds);
  }

  async clientSideMultipleComparison(reportIds) {
    // Get all reports from the existing student reports endpoint
    const allReports = await this.getStudentReports(reportIds[0].split('-')[0]); // Extract studentId
    const reports = allReports.filter(report => reportIds.includes(report.id));
    
    // Sort reports by version for chronological comparison
    reports.sort((a, b) => a.version - b.version);
    
    // Extract all skills from all reports
    const allSkills = new Set();
    reports.forEach(report => {
      const skills = JSON.parse(report.skillsAssessment || '{}');
      Object.keys(skills).forEach(skill => allSkills.add(skill));
    });
    
    // Compare each skill across all reports
    const differences = {};
    allSkills.forEach(skill => {
      const versions = reports.map(report => {
        const skills = JSON.parse(report.skillsAssessment || '{}');
        return {
          version: report.version,
          value: skills[skill],
          date: report.createdAt
        };
      });
      
      // Check if there are any changes across versions
      const values = versions.map(v => JSON.stringify(v.value));
      const hasChanges = new Set(values).size > 1;
      
      differences[skill] = {
        changed: hasChanges,
        versions: versions,
        value: hasChanges ? null : versions[0]?.value
      };
    });
    
    return {
      reports,
      differences
    };
  }

  // Notification methods
  async getAlerts() {
    return this.request('/notifications/alerts');
  }

  // Admin methods
  async getAdminSessions() {
    return this.request('/admin/sessions');
  }

  async deleteSession(sessionId) {
    return this.request(`/admin/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async exportAllData() {
    return this.request('/admin/export-data');
  }

  async registerUser(userData) {
    return this.request('/admin/users/register', {
      method: 'POST',
      body: userData,
    });
  }

  async updateUser(userId, userData) {
    return this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: userData,
    });
  }

  async deleteUser(userId) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async deactivateUser(userId) {
    return this.request(`/admin/users/${userId}/deactivate`, {
      method: 'POST',
    });
  }

  async deactivateStudent(studentId) {
    return this.request(`/admin/students/${studentId}/deactivate`, {
      method: 'POST',
    });
  }

  async reactivateUser(userId) {
    return this.request(`/admin/users/${userId}/reactivate`, {
      method: 'POST',
    });
  }

  async reactivateStudent(studentId) {
    return this.request(`/admin/students/${studentId}/reactivate`, {
      method: 'POST',
    });
  }

  async deactivateClassroom(classroomId) {
    return this.request(`/admin/classrooms/${classroomId}/deactivate`, {
      method: 'POST',
    });
  }

  async reactivateClassroom(classroomId) {
    return this.request(`/admin/classrooms/${classroomId}/reactivate`, {
      method: 'POST',
    });
  }

  async deactivateReport(reportId) {
    return this.request(`/admin/reports/${reportId}/deactivate`, {
      method: 'POST',
    });
  }

  async reactivateReport(reportId) {
    return this.request(`/admin/reports/${reportId}/reactivate`, {
      method: 'POST',
    });
  }

  async deleteReport(reportId) {
    return this.request(`/admin/reports/${reportId}`, {
      method: 'DELETE',
    });
  }

  async deactivateAllUsers() {
    return this.request('/admin/users/deactivate-all', {
      method: 'POST',
    });
  }

  async deleteAllUsers() {
    return this.request('/admin/users', {
      method: 'DELETE',
    });
  }

  async deactivateAllStudents() {
    return this.request('/admin/students/deactivate-all', {
      method: 'POST',
    });
  }

  async deleteAllStudents() {
    return this.request('/admin/students', {
      method: 'DELETE',
    });
  }

  async deactivateAllClassrooms() {
    return this.request('/admin/classrooms/deactivate-all', {
      method: 'POST',
    });
  }

  async deleteAllClassrooms() {
    return this.request('/admin/classrooms', {
      method: 'DELETE',
    });
  }

  async deactivateAllReports() {
    return this.request('/admin/reports/deactivate-all', {
      method: 'POST',
    });
  }

  async deleteAllReports() {
    return this.request('/admin/reports', {
      method: 'DELETE',
    });
  }

  async deleteAllGoals() {
    return this.request('/admin/goals', {
      method: 'DELETE',
    });
  }

  async getFormConfig(formType) {
    return this.request(`/admin/form-config/${formType}`);
  }

  async saveFormConfig(formType, config) {
    return this.request(`/admin/form-config/${formType}`, {
      method: 'POST',
      body: { config },
    });
  }

  async deleteFormConfig(formType) {
    return this.request(`/admin/form-config/${formType}`, {
      method: 'DELETE',
    });
  }

  async addStandard(StandardData) {
    return this.request('/admin/standards', {
      method: 'POST',
      body: StandardData,
    });
  }

  async updateStandard(standardId, standardData) {
    return this.request(`/admin/standards/${standardId}`, {
      method: 'PATCH',
      body: standardData,
    });
  }

  async deleteStandard(standardId) {
    return this.request(`/admin/standards/${standardId}`, {
      method: 'DELETE',
    });
  } 

  async getMyStudentProfile() {
    return this.request('/students/me');
  }

  async getUnlinkedStudents() {
    return this.request('/admin/students/unlinked');
  }

  async getStandards() {
    return this.request('/goals/standards');
  }

  async getStandardsMetadata() {
    return this.request('/goals/standards/metadata');
  }

  async getIEPFormTypes() {
    return this.request('/admin/FormTypes');
  }

  async getIEPAllForms() {
    return this.request('/students/AllForms');
  }

  async updateGoalFeedback(id, feedback) {
    return this.request(`/goals/${id}/feedback`, {
      method: 'PATCH',
      body: { feedback },
    });
  }

  async updateGoalSurvey(id, newCheckIn) {
    return this.request(`/goals/${id}/survey`, {
      method: 'PATCH',
      body: { newCheckIn },
    });
  }

  async createVisualisation(goalId, visualisation) {
    return this.request(`/goals/${goalId}/visualiser`, {
      method: 'PATCH',
      body: { action: 'create', visualisation },
    });
  }

  async updateVisualisation(goalId, visualisationId, visualisation) {
    return this.request(`/goals/${goalId}/visualiser`, {
      method: 'PATCH',
      body: { action: 'update', visualisationId, visualisation },
    });
  }

  async deleteVisualisation(goalId, visualisationId) {
    return this.request(`/goals/${goalId}/visualiser`, {
      method: 'PATCH',
      body: { action: 'delete', visualisationId },
    });
  }

  // Strategy methods
  async getStrategies() {
    return this.request('/strategies');
  }

  async getStrategyCategories() {
    return this.request('/strategies/categories');
  }

  async getStrategyIcons() {
    return this.request('/strategies/icons');
  }

  async getStrategyDiagnoses() {
    return this.request('/strategies/diagnoses');
  }

  async createStrategyIcon(data) {
    return this.request('/strategies/icons', {
      method: 'POST',
      body: data,
    });
  }

  async updateStrategyIcon(id, data) {
    return this.request(`/strategies/icons/${id}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async deleteStrategyIcon(id) {
    return this.request(`/strategies/icons/${id}`, {
      method: 'DELETE',
    });
  }

  async createStrategyDiagnosis(data) {
    return this.request('/strategies/diagnoses', {
      method: 'POST',
      body: data,
    });
  }

  async updateStrategyDiagnosis(id, data) {
    return this.request(`/strategies/diagnoses/${id}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async deleteStrategyDiagnosis(id) {
    return this.request(`/strategies/diagnoses/${id}`, {
      method: 'DELETE',
    });
  }

  async createStrategyCategory(data) {
    return this.request('/strategies/categories', {
      method: 'POST',
      body: data,
    });
  }

  async updateStrategyCategory(id, data) {
    return this.request(`/strategies/categories/${id}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async deleteStrategyCategory(id) {
    return this.request(`/strategies/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async createStrategy(data) {
    return this.request('/strategies', {
      method: 'POST',
      body: data,
    });
  }

  async updateStrategy(id, data) {
    return this.request(`/strategies/${id}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async deleteStrategy(id) {
    return this.request(`/strategies/${id}`, {
      method: 'DELETE',
    });
  }

  async getRoles() {
    return this.request('/roles');
  }

  async getRole(id) {
    return this.request(`/roles/${id}`);
  }

  async createRole(data) {
    return this.request('/roles', { method: 'POST', body: data });
  }

  async updateRole(id, data) {
    return this.request(`/roles/${id}`, { method: 'PUT', body: data });
  }

  async deleteRole(id) {
    return this.request(`/roles/${id}`, { method: 'DELETE' });
  }

  async getMeetingNotes(studentId) {
    return this.request(`/meeting-notes/student/${studentId}`);
  }

  async createMeetingNote(data) {
    return this.request('/meeting-notes', { method: 'POST', body: data });
  }

  async updateMeetingNote(id, data) {
    return this.request(`/meeting-notes/${id}`, { method: 'PUT', body: data });
  }

  async deleteMeetingNote(id) {
    return this.request(`/meeting-notes/${id}`, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
