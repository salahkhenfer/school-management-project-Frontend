import axios from "axios";

const sendMessage = async (message, id) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/messages/send",
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
      `http://localhost:3000/api/messages/all`,
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
