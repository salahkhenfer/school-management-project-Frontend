import axios from "axios";

const addPaymentTeacher = async (
  teacherId,

  groupId,
  amount
) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/paymentTeacher/addPaymentTeacher",
      {
        teacherId,
        groupId,
        amount,
      },
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to add payment:", err);
  }
};

const getPaymentByGroup = async (groupId) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/payments/getPaymentByGroup",
      {
        groupId,
      },
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to get payment:", err);
  }
};

const getPaymentByTeacher = async (teacherId) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/paymentTeacher/getPaymentTeacher",
      teacherId,
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data.payments;
  } catch (err) {
    console.error("Failed to get payment:", err);
  }
};

const getAllPaymentsTeacher = async () => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/paymentTeacher/getAllPayments",
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data.payments;
  } catch (err) {
    console.error("Failed to get payment:", err);
  }
};

export {
  addPaymentTeacher,
  getAllPaymentsTeacher,
  getPaymentByGroup,
  getPaymentByTeacher,
};
