import axios from "axios";

const API_URL = "http://localhost:3000/api";

const getAllTeachers = async () => {
  try {
    const response = await axios.get(`${API_URL}/teachers/GetAllTeacher`, {
      withCredentials: true,
    });
    console.log(response.data);
    return response.data.teachers; // Return the response data on success
  } catch (err) {
    console.error("Failed to fetch teachers:", err);
    return false;
  }
};

const addTeacherApi = async (teacher) => {
  try {
    const response = await axios.post(
      `${API_URL}/teachers/AddTeacher`,
      teacher, // Pass the teacher object directly

      {
        withCredentials: true,
      }
    );

    console.log(response);

    return response;
  } catch (err) {
    console.error("Failed to add teacher:", err);
    // Optional: you can return the error if you want to handle it further upstream
    return err.response; // or throw err; if you want to propagate the error
  }
};

const deleteTeacherApi = async (teacherId) => {
  console.log(teacherId);
  try {
    const response = await axios.delete(`${API_URL}/teachers/DeleteTeacher`, {
      data: { id: teacherId },
      withCredentials: true,
    });
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to delete teacher:", err);
  }
};
const getTeacherById = async (teacherId) => {
  try {
    const response = await axios.post(
      `${API_URL}/teachers/getTeacherById`,
      {
        id: teacherId,
      },
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data.teacher;
  } catch (err) {
    console.error("Failed to get teacher:", err);
  }
};
const searchTeacherApi = async (teacher) => {
  try {
    const response = await axios.post(
      `${API_URL}/Teachers/searchTeachers`,
      {
        fullName: teacher,
      },

      {
        withCredentials: true,
      }
    );
    console.log(response);
    return response.data.teachers;
  } catch (err) {
    console.error("Failed to search teacher:", err);
    return false;
  }
};
const countTeachers = async () => {
  try {
    const response = await axios.get(`${API_URL}/teachers/countTeachers`, {
      withCredentials: true,
    });
    console.log(response.data);
    return response.data.count; // Return the response data on success
  } catch (err) {
    console.error("Failed to fetch teachers:", err);
    return false;
  }
};

const getTeacherWithUser = async (id) => {
  try {
    const response = await axios.post(
      `${API_URL}/teachers/getTeacherWithUser`,
      id,
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to get teacher:", err);
  }
};

const updateTeacher = async (teacher) => {
  try {
    const response = await axios.put(
      `${API_URL}/teachers/updateTeacher`,
      teacher,
      {
        withCredentials: true,
      }
    );

    return response.data;
  } catch (err) {
    console.error("Failed to update teacher:", err);
  }
};
export {
  addTeacherApi,
  countTeachers,
  deleteTeacherApi,
  getAllTeachers,
  getTeacherById,
  getTeacherWithUser,
  searchTeacherApi,
  updateTeacher,
};
