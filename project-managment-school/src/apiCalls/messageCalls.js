import axios from "axios";

const sendMessage = async (message, id) => {
  try {
    const response = await axios.post(
      "https://api.eltatwir.com/api/messages/send",
      {
        content: message,
        id,
      },
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to send message:", err);
  }
};
const getMessages = async () => {
  try {
    const response = await axios.get(
      `https://api.eltatwir.com/api/messages/all`,
      {},
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to get messages:", err);
  }
};

export { getMessages, sendMessage };
