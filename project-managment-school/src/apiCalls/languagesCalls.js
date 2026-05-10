import axios from "axios";

const getAllLanguages = async () => {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/languages/allLanguages",
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data.languages; // Return the response data on success
  } catch (err) {
    console.error("Failed to fetch languages:", err);
  }
};

const addLanguageApi = async (language) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/languages/addLanguage",
      { name: language },
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to add language:", err);
  }
};

const deleteLanguageApi = async (id) => {
  console.log(id);
  try {
    const response = await axios.delete(
      ` http://localhost:3000/api/languages/deleteLanguage`,
      {
        data: { id }, // Send the id in the request body
        withCredentials: true, // Ensure cookies are sent with the request
      }
    );
    console.log(response.data);
    return true;
  } catch (err) {
    console.error("Failed to delete language:", err);
    return false;
  }
};
export { addLanguageApi, deleteLanguageApi, getAllLanguages };
