import axios from "axios";

const addParent = async (parent) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/parents/addParent",
      {
        fullName: parent.fullName,
        phoneNumber: parent.phoneNumber,
        email: parent.email,
        password: parent.password,
        studentId: parent.studentId,
      },
      {
        withCredentials: true,
      }
    );

    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to add parent:", err);
    return false;
  }
};
const addStudentInToParent = async (phoneNumber, studentId = "") => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/parents/addStudentInToParent",
      {
        studentId: studentId,
        phoneNumber,
      },
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to add student to parent:", err);
    return false;
  }
};
const deleteStudentForParent = async (info) => {
  try {
    const response = await axios.delete(
      "http://localhost:3000/api/parents/deleteStudentForParent",

      {
        data: info,
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to delete student for parent:", err);
  }
};
const getAllParents = async () => {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/parents/getAllParents",
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data.parents;
  } catch (err) {
    console.error("Failed to get all parents:", err);
  }
};

const searchParent = async (name) => {
  try {
    const response = await axios.post(
      `http://localhost:3000/api/parents/searchParent`,
      {
        name: name,
      },
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data.parents;
  } catch (err) {
    console.error("Failed to search parent:", err);
  }
};
const deleteParentApi = async (info) => {
  try {
    const response = await axios.delete(
      "http://localhost:3000/api/parents/deleteParent",

      {
        data: info,
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to delete parent:", err);
  }
};

const getParentById = async (id) => {
  try {
    const response = await axios.post(
      `http://localhost:3000/api/parents/getParentById`,
      {
        id: id,
      },
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data.parent;
  } catch (err) {
    console.error("Failed to get parent by id:", err);
  }
};

const checkParentApi = async (phoneNumber) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/parents/checkParent",
      {
        phoneNumber: phoneNumber,
      },
      {
        withCredentials: true,
      }
    );
    console.log(response.data);

    return response.data.message;
  } catch (err) {
    console.error("Failed to check parent:", err);
  }
};

const deleteStudentFormParent = async (info) => {
  try {
    const response = await axios.delete(
      "http://localhost:3000/api/parents/deleteStudentFormParent",
      {
        data: info,
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response;
  } catch (err) {
    console.error("Failed to delete student for parent:", err);
  }
};

const countParentsApi = async () => {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/parents/countParents",
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to count parent:", err);
  }
};

const getParentWithUser = async (user) => {
  console.log(user);
  try {
    const response = await axios.post(
      "http://localhost:3000/api/parents/getParentWithUser",
      {
        name: user.name,
        email: user.email,
        phoneNumber: user.phone,
      },
      {
        withCredentials: true,
      }
    );
    console.log(response.data.parent);
    return response.data.parent;
  } catch (err) {
    console.error("Failed to get parent with user:", err);
  }
};

const updateParent = async (parent) => {
  try {
    const response = await axios.put(
      "http://localhost:3000/api/parents/updateParent",
      parent,
      {
        withCredentials: true,
      }
    );

    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to update parent:", err);
    return false;
  }
};
export {
  addParent,
  addStudentInToParent,
  checkParentApi,
  countParentsApi,
  deleteParentApi,
  deleteStudentForParent,
  deleteStudentFormParent,
  getAllParents,
  getParentById,
  getParentWithUser,
  searchParent,
  updateParent,
};
