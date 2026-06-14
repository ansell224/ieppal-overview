import { useState, useEffect } from 'react';
import { apiClient } from '../apiClient';
import { useAuth } from '../context/AuthContext';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (apiCall) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, execute, setError };
};

export const useClassrooms = () => {
  const { loading, error, execute, setError } = useApi();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    setAuthReady(!authLoading && isAuthenticated);
  }, [authLoading, isAuthenticated]);

  const loadClassrooms = () => {
    return execute(() => {
      return apiClient.getClassrooms();
    });
  };
  
  const createClassroom = (data) => {
    return execute(() => {
      return apiClient.createClassroom(data);
    });
  };
  
  const updateClassroom = (id, data) => {
    return execute(() => {
      return apiClient.updateClassroom(id, data);
    });
  };
  
  const deleteClassroom = (id) => {
    return execute(() => {
      return apiClient.deleteClassroom(id);
    });
  };

  return {
    loading,
    error,
    setError,
    authReady,
    loadClassrooms,
    createClassroom,
    updateClassroom,
    deleteClassroom
  };
};

export const useStudents = () => {
  const { loading, error, execute, setError } = useApi();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    setAuthReady(!authLoading && isAuthenticated);
  }, [authLoading, isAuthenticated]);

  const loadStudents = () => execute(() => apiClient.getStudents());
  const createStudent = (data) => execute(() => apiClient.createStudent(data));
  const updateStudent = (id, data) => execute(() => apiClient.updateStudent(id, data));
  const deleteStudent = (id) => execute(() => apiClient.deleteStudent(id));
  const getStudent = (id) => execute(() => apiClient.getStudent(id));

  return {
    loading,
    error,
    setError,
    authReady,
    loadStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudent
  };
};

export const useStrategies = () => {
  const { loading, error, execute, setError } = useApi();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    setAuthReady(!authLoading && isAuthenticated);
  }, [authLoading, isAuthenticated]);

  const loadStrategies = () => execute(() => apiClient.getStrategies());
  const loadStrategyCategories = () => execute(() => apiClient.getStrategyCategories());
  const loadStrategyIcons = () => execute(() => apiClient.getStrategyIcons());
  const loadStrategyDiagnoses = () => execute(() => apiClient.getStrategyDiagnoses());
  const createStrategy = (data) => execute(() => apiClient.createStrategy(data));
  const updateStrategy = (id, data) => execute(() => apiClient.updateStrategy(id, data));
  const deleteStrategy = (id) => execute(() => apiClient.deleteStrategy(id));
  const createStrategyIcon = (data) => execute(() => apiClient.createStrategyIcon(data));
  const updateStrategyIcon = (id, data) => execute(() => apiClient.updateStrategyIcon(id, data));
  const deleteStrategyIcon = (id) => execute(() => apiClient.deleteStrategyIcon(id));
  const createStrategyDiagnosis = (data) => execute(() => apiClient.createStrategyDiagnosis(data));
  const updateStrategyDiagnosis = (id, data) => execute(() => apiClient.updateStrategyDiagnosis(id, data));
  const deleteStrategyDiagnosis = (id) => execute(() => apiClient.deleteStrategyDiagnosis(id));
  const createStrategyCategory = (data) => execute(() => apiClient.createStrategyCategory(data));
  const updateStrategyCategory = (id, data) => execute(() => apiClient.updateStrategyCategory(id, data));
  const deleteStrategyCategory = (id) => execute(() => apiClient.deleteStrategyCategory(id));

  return {
    loading,
    error,
    setError,
    authReady,
    loadStrategies,
    loadStrategyCategories,
    loadStrategyIcons,
    loadStrategyDiagnoses,
    createStrategy,
    updateStrategy,
    deleteStrategy,
    createStrategyIcon,
    updateStrategyIcon,
    deleteStrategyIcon,
    createStrategyDiagnosis,
    updateStrategyDiagnosis,
    deleteStrategyDiagnosis,
    createStrategyCategory,
    updateStrategyCategory,
    deleteStrategyCategory
  };
};

export const useGoals = () => {
  const { loading, error, execute, setError } = useApi();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    setAuthReady(!authLoading && isAuthenticated);
  }, [authLoading, isAuthenticated]);

  const loadGoals = (studentId) => execute(() => apiClient.getGoals(studentId));
  const createGoal = (data) => execute(() => apiClient.createGoal(data));

  return {
    loading,
    error,
    setError,
    authReady,
    loadGoals,
    createGoal
  };
};
