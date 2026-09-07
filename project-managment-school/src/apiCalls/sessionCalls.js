import axios from "axios";

const addSessionToGroup = async (groupId, studentIds) => {
  try {
    const response = await axios.post(
      "https://api.eltatwir.com/api/sessions/addSessionToGroup",
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
      "https://api.eltatwir.com/api/sessions/deleteSession",
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
      "https://api.eltatwir.com/api/sessions/updateSession",
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
      `https://api.eltatwir.com/api/sessions/getSessionById`,
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
// Mark a single student present/absent in a session
const setSessionAttendance = async (sessionId, studentId, present) => {
  try {
    const response = await axios.put(
      `https://api.eltatwir.com/api/sessions/${sessionId}/attendance`,
      { studentId, present },
      { withCredentials: true }
    );
    return response.data;
  } catch (err) {
    console.error("Failed to update attendance:", err);
    throw err;
  }
};

export {
  addSessionToGroup,
  deleteSession,
  getSession,
  setSessionAttendance,
  updateSession,
};
