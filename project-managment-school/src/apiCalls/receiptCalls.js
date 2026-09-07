import axios from "axios";

const API_URL = "https://api.eltatwir.com/api";

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

// Generate combined receipt for multiple subjects.
// `subjects` is an array of { subject, level, classes, amount }.
// `paidAmount` is optional; when omitted the receipt is treated as fully paid.
export const generateCombinedReceipt = async (
  studentId,
  subjects,
  { parentId, paymentMethod = "cash", paidAmount, notes } = {}
) => {
  try {
    const response = await axios.post(
      `${API_URL}/receipts/combined`,
      {
        studentId,
        parentId,
        subjects,
        paymentMethod,
        paidAmount,
        notes,
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

// Create a single receipt (used when registering a student / recording a payment).
// payload: { studentId, items, totalAmount, paidAmount, paymentMethod, parentId, notes }
export const createReceipt = async (payload) => {
  try {
    const response = await axios.post(`${API_URL}/receipts`, payload, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating receipt:", error);
    throw error;
  }
};

// Get all receipts (optionally filtered by date range / status)
export const getAllReceipts = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/receipts`, {
      params,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching receipts:", error);
    throw error;
  }
};

// Get the list of debts (receipts with a remaining balance)
export const getDebts = async (studentId) => {
  try {
    const response = await axios.get(`${API_URL}/receipts/debts`, {
      params: studentId ? { studentId } : {},
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching debts:", error);
    throw error;
  }
};

// Record an installment payment against an existing receipt
export const addInstallment = async (receiptId, payload) => {
  try {
    const response = await axios.post(
      `${API_URL}/receipts/${receiptId}/installment`,
      payload,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding installment:", error);
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
