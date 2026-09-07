import axios from "axios";

const API_URL = "https://api.eltatwir.com/api";

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

// Get remaining classes for student (requires the groupId)
export const getRemainingClasses = async (studentId, groupId) => {
  try {
    const response = await axios.get(
      `${API_URL}/classes/student/${studentId}/remaining`,
      {
        params: { groupId },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching remaining classes:", error);
    throw error;
  }
};

// Get the monthly fee after deducting missed/unattended sessions
export const getFeeAdjustment = async (studentId, groupId, periodId) => {
  try {
    const response = await axios.get(
      `${API_URL}/classes/student/${studentId}/fee-adjustment`,
      {
        params: { groupId, periodId },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching fee adjustment:", error);
    throw error;
  }
};

// Registration price for joining a group now (price of remaining sessions only)
export const getRegistrationPrice = async (groupId) => {
  try {
    const response = await axios.get(
      `${API_URL}/classes/group/${groupId}/registration-price`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching registration price:", error);
    throw error;
  }
};

// Update class limit for group
export const updateGroupClassLimit = async (groupId, classLimit) => {
  try {
    const response = await axios.put(
      `${API_URL}/classes/group/${groupId}/limit`,
      { classLimit },
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
