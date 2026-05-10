import axios from "axios";

const createpermission = async (data) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/permissions/createpermissio",
      data,
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to add permission:", err);
  }
};

const getPermissions = async () => {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/permissions/getPermissions",
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to get permissions:", err);
  }
};
const getUsersByRole = async (role) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/permissions/getUsersByRole",
      { role },
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data.users;
  } catch (err) {
    console.error("Failed to get users:", err);
  }
};

export { createpermission, getPermissions, getUsersByRole };
