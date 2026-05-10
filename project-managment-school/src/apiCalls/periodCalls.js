import axios from "axios";

const API_URL = "http://localhost:3000/api";

// Create new academic period
export const createPeriod = async (periodData) => {
  try {
    const response = await axios.post(`${API_URL}/periods`, periodData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating period:", error);
    throw error;
  }
};

// Get all periods
export const getAllPeriods = async () => {
  try {
    const response = await axios.get(`${API_URL}/periods`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching periods:", error);
    throw error;
  }
};

// Get active period
export const getActivePeriod = async () => {
  try {
    const response = await axios.get(`${API_URL}/periods/active`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching active period:", error);
    throw error;
  }
};

// Update period
export const updatePeriod = async (id, periodData) => {
  try {
    const response = await axios.put(`${API_URL}/periods/${id}`, periodData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating period:", error);
    throw error;
  }
};

// Close period and start new one
export const closePeriodAndStartNew = async (
  currentPeriodId,
  newPeriodData
) => {
  try {
    const response = await axios.post(
      `${API_URL}/periods/${currentPeriodId}/close-and-start-new`,
      newPeriodData,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error closing period and starting new:", error);
    throw error;
  }
};

// Re-register students for new period
export const reRegisterStudents = async (periodId, studentIds) => {
  try {
    const response = await axios.post(
      `${API_URL}/periods/${periodId}/re-register`,
      { studentIds },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error re-registering students:", error);
    throw error;
  }
};
