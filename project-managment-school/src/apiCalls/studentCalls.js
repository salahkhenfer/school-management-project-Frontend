import axios from "axios";

const deleteStudent = async (id) => {
  try {
    const response = await axios.delete(
      "http://localhost:3000/api/students/deleteStudent",
      {
        data: { id: id },
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to delete student:", err);
  }
};

const getAllStudent = async (page) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/students/getAllStudents",

      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data; // افتراض أن `response.data` يحتوي على الحقول `students` و `totalStudents`
  } catch (err) {
    console.error("Failed to get all students:", err);
  }
};
const getStudentById = async (id) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/students/getStudentById",
      {
        id: id,
      },

      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data.student;
  } catch (err) {
    console.error("Failed to get student by id:", err);
  }
};
const addStudent = async (student) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/students/addStudent",
      student,

      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to add student:", err);
    return false;
  }
};
const searchStudentApi = async (name) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/students/searchStudent",
      {
        fullName: name,
      },

      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data.students;
  } catch (err) {
    console.error("Failed to search student:", err);
  }
};
const updateStudent = async (student) => {
  try {
    const response = await axios.put(
      "http://localhost:3000/api/students/updateStudent",
      student,

      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to update student:", err);
  }
};
const countStudents = async () => {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/students/countStudents",
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data.count;
  } catch (err) {
    console.error("Failed to count students:", err);
  }
};
const deleteStudentFropmGroup = async (studentId, groupId) => {
  try {
    const response = await axios.delete(
      "http://localhost:3000/api/students/deleteStudentFropmGroup",
      {
        data: {
          studentId: studentId,

          groupId: groupId,
        },
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to delete student from group:", err);
  }
};

export {
  addStudent,
  countStudents,
  deleteStudent,
  deleteStudentFropmGroup,
  getAllStudent,
  getStudentById,
  searchStudentApi,
  updateStudent,
};
