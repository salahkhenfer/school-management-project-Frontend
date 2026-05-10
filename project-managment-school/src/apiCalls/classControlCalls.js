import axios from "axios";

const API_URL = "http://localhost:3000/api";

// Get class count for student
export const getStudentClassCount = async (studentId, periodId) => {
  try {
    const response = await axios.get(
      `${API_URL}/classes/student/${studentId}/count`,
      {
        params: { periodId },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching student class count:", error);
    throw error;
  }
};

// Get remaining classes for student
export const getRemainingClasses = async (studentId, periodId) => {
  try {
    const response = await axios.get(
      `${API_URL}/classes/student/${studentId}/remaining`,
      {
        params: { periodId },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching remaining classes:", error);
    throw error;
  }
};

// Update class limit for group
export const updateGroupClassLimit = async (groupId, limit) => {
  try {
    const response = await axios.put(
      `${API_URL}/groups/${groupId}/class-limit`,
      { limit },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating class limit:", error);
    throw error;
  }
};

// Check if student can attend more classes
export const canAttendClass = async (studentId, groupId) => {
  try {
    const response = await axios.get(
      `${API_URL}/classes/student/${studentId}/can-attend`,
      {
        params: { groupId },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error checking class attendance:", error);
    throw error;
  }
};
