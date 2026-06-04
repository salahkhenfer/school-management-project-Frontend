import axios from "axios";

const API_URL = "http://localhost:3000/api";

// Get attendance list for a group
export const getAttendanceList = async (groupId, date) => {
  try {
    const response = await axios.get(`${API_URL}/attendance/group/${groupId}`, {
      params: { date },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching attendance list:", error);
    throw error;
  }
};

// Mark attendance for students
export const markAttendance = async (attendanceData) => {
  try {
    const response = await axios.post(`${API_URL}/attendance`, attendanceData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error marking attendance:", error);
    throw error;
  }
};

// Get attendance report for a student
export const getStudentAttendanceReport = async (studentId, periodId) => {
  try {
    const response = await axios.get(
      `${API_URL}/attendance/student/${studentId}/report`,
      {
        params: { periodId },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching student attendance report:", error);
    throw error;
  }
};

// Get attendance statistics for a group
export const getGroupAttendanceStats = async (groupId, periodId) => {
  try {
    const response = await axios.get(
      `${API_URL}/attendance/group/${groupId}/stats`,
      {
        params: { periodId },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching group attendance stats:", error);
    throw error;
  }
};
