import axios from "axios";

const getGroupById = async (id) => {
  try {
    const response = await axios.post(
      `http://localhost:3000/api/groups/getGroupByID`,
      { id: id }, // Send the group ID in the request body
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data.group; // Return an empty object if group is not found
  } catch (err) {
    console.error("Failed to fetch group:", err);
    return {}; // Return an empty object in case of an error
  }
};

const getGroups = async (theRest) => {
  console.log(theRest);
  try {
    const response = await axios.post(
      `http://localhost:3000/api/groups/getAllGroups`,
      { theRest: theRest }, // Send theRest in the request body
      {
        withCredentials: true,
      }
    );

    return response.data.groups; // Return an empty array if groups are not found
  } catch (err) {
    console.error("Failed to fetch groups:", err);
    return []; // Return an empty array in case of an error
  }
};

const addGroupApi = async (group) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/groups/addGroup",
      {
        name: group.groupName,
        price: group.price,
        numberOfSessions: group.numberOfSessions,
        maxStudents: group.studentCount,
        startDate: group.startDate,
        endDate: group.endDate,
        location: "prisentiel",
        isCompleted: false,
        teacher: group.teacher,
        paymentMethod: group.paymentMethod,
        theRest: group.theRest,
        type: group.type,
      },
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to add group:", err);
  }
};

const deleteGroup = async (id) => {
  try {
    const response = await axios.delete(
      "http://localhost:3000/api/groups/deleteGroup",

      {
        data: { id: id },
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to delete group:", err);
  }
};

const updateGroupStatus = async (id, isCompleted) => {
  try {
    const response = await axios.put(
      "http://localhost:3000/api/groups/updateGroupStatus",
      {
        id: id,
        isCompleted,
      },
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to update group status:", err);
  }
};
const updateGroup = async (group) => {
  try {
    const response = await axios.put(
      "http://localhost:3000/api/groups/updateGroup",
      {
        id: group.id,
        name: group.groupName,
        price: group.price,
        numberOfSessions: group.numberOfSessions,
        maxStudents: group.studentCount,
        teacher: group.teacher,
        paymentMethod: group.paymentMethod,

        type: group.type,
      },
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to update group:", err);
  }
};
const getGroupByTeacher = async (teacherId) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/groups/getGroupByTeacher",
      { teacherId },
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data.groups;
  } catch (err) {
    console.error("Failed to get group:", err);
  }
};
export {
  addGroupApi,
  deleteGroup,
  getGroupById,
  getGroupByTeacher,
  getGroups,
  updateGroup,
  updateGroupStatus,
};
