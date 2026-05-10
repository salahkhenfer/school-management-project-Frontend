import axios from "axios";

const API_URL = "http://localhost:3000/api";

// Generate receipt for payment
export const generateReceipt = async (paymentId) => {
  try {
    const response = await axios.get(`${API_URL}/receipts/${paymentId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error generating receipt:", error);
    throw error;
  }
};

// Generate combined receipt for multiple subjects
export const generateCombinedReceipt = async (studentId, subjectIds) => {
  try {
    const response = await axios.post(
      `${API_URL}/receipts/combined`,
      {
        studentId,
        subjectIds,
      },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error generating combined receipt:", error);
    throw error;
  }
};

// Get receipt by ID
export const getReceiptById = async (receiptId) => {
  try {
    const response = await axios.get(
      `${API_URL}/receipts/detail/${receiptId}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching receipt:", error);
    throw error;
  }
};

// Get all receipts for student
export const getStudentReceipts = async (studentId) => {
  try {
    const response = await axios.get(
      `${API_URL}/receipts/student/${studentId}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching student receipts:", error);
    throw error;
  }
};
