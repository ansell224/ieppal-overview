import React, { createContext, useState } from "react";
import { apiClient } from '../apiClient';

export const IEPContext = createContext();

export function IEPProvider({ children }) {
  // in-progress form data
  const [iepData, setIepData] = useState({
    studentInfo: {},
    skillsAssessment: {},
    goals: []
  });

  // completed reports
  const [iepReports, setIepReports] = useState([]);
  const [students, setStudents] = useState([]);

  // Load reports from database
  const loadReports = async () => {
    try {
      const reports = await apiClient.getReports();
      setIepReports(reports);
      return reports;
    } catch (error) {
      throw error;
    }
  };

  // section updaters
  const updateStudentInfo = data =>
    setIepData(prev => ({ ...prev, studentInfo: data }));
  const updateSkillsAssessment = data =>
    setIepData(prev => ({ ...prev, skillsAssessment: data }));

  // goal management
  const addGoal = async (data) => {
    try {
      const result = await apiClient.createGoal(data);
      setIepData(prev => ({ ...prev, goals: [...prev.goals, { ...data, id: result.goalId }] }));
      return result;
    } catch (error) {
      throw error;
    }
  };
  
  const updateGoal = (index, data) =>
    setIepData(prev => {
      const newGoals = [...prev.goals];
      newGoals[index] = data;
      return { ...prev, goals: newGoals };
    });

  // student management
  const loadStudents = async () => {
    try {
      const studentList = await apiClient.getStudents();
      setStudents(studentList);
      return studentList;
    } catch (error) {
      throw error;
    }
  };

  // once the user hits "Finish"
  const finalizeReport = async () => {
    try {
      const reportData = {
        studentName: iepData.studentInfo.name,
        level: iepData.studentInfo.level,
        skillsAssessment: iepData.skillsAssessment,
        type: 'IEP_SKILLS_ASSESSMENT'
      };
      
      const result = await apiClient.createReport(reportData);
      
      // Link to student if we have studentId
      if (iepData.studentInfo.id && result.id) {
        await apiClient.linkStudentToReport(iepData.studentInfo.id, result.id);
      }
      
      setIepReports(prev => [...prev, { ...iepData, reportId: result.id }]);
      
      // reset for next IEP
      setIepData({ studentInfo: {}, skillsAssessment: {}, goals: [] });
      return result;
    } catch (error) {
      throw error;
    }
  };

  return (
    <IEPContext.Provider
      value={{
        iepData,
        iepReports,
        students,
        updateStudentInfo,
        updateSkillsAssessment,
        addGoal,
        updateGoal,
        loadStudents,
        loadReports,
        finalizeReport,
      }}
    >
      {children}
    </IEPContext.Provider>
  );
}