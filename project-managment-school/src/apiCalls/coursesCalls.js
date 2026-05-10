import axios from "axios";

const getCourses = async () => {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/courses/getAllCourses",
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data.courses;
  } catch (err) {
    console.error("Failed to fetch courses:", err);
  }
};

const addCourse = async (name) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/courses/addCourse",
      {
        name: name,
      },
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to add course:", err);
    return false;
  }
};

const deleteCourse = async (id) => {
  try {
    const response = await axios.delete(
      "http://localhost:3000/api/courses/deleteCourse",
      {
        data: { id: id },
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to delete course:", err);
  }
};

export { addCourse, deleteCourse, getCourses };
