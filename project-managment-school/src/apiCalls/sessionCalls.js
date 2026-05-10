import axios from "axios";

const addSessionToGroup = async (groupId, studentIds) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/sessions/addSessionToGroup",
      {
        groupId,
        studentIds,
      },
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to add session to group:", err);
  }
};

const deleteSession = async (id) => {
  try {
    const response = await axios.delete(
      "http://localhost:3000/api/sessions/deleteSession",
      {
        data: { id: id },
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to delete session:", err);
  }
};

const updateSession = async (session) => {
  try {
    const response = await axios.put(
      "http://localhost:3000/api/sessions/updateSession",
      {
        id: session.id,
        startDate: session.startDate,
        endDate: session.endDate,
        location: session.location,
        isCompleted: session.isCompleted,
        teacher: session.teacher,
        paymentMethod: session.paymentMethod,
        theRest: session.theRest,
        type: session.type,
      },
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to update session:", err);
  }
};

const getSession = async (id) => {
  try {
    const response = await axios.post(
      `http://localhost:3000/api/sessions/getSessionById`,
      {
        id: id,
      },
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to get session:", err);
  }
};
export { addSessionToGroup, deleteSession, getSession, updateSession };
