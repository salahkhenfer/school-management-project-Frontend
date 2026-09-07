import axios from "axios";

const getPaymentByGroup = async (groupId) => {
  try {
    const response = await axios.post(
      `https://api.eltatwir.com/api/payments/getPaymentByGroup`,
      {
        groupId,
      },
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

export { getPaymentByGroup };
