import axios from "axios";

// Using localhost for local development
const API_URL = "http://localhost:3000/api";

export const LoginApi = async (username, password) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/login`,
      {
        username: username,
        password: password,
      },
      {
        withCredentials: true,
      }
    );
    console.log(response.data.user);
    return response.data.user;
  } catch (err) {
    console.error(err);
    throw new Error(
      "Login failed. Please check your credentials and try again."
    );
  }
};

export const checkauthApi = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/checkAuth`, {
      withCredentials: true,
    });
    console.log(response.data);
    return response.data; // Return the response data on success
  } catch (err) {
    console.error("Failed to fetch protected data:", err);
  }
};

export const LogoutApi = async () => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/logout`,
      {},
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response; // Return the response data on success
  } catch (err) {
    console.error("Failed to logout:", err);
  }
};

export const getUserByIdApi = async (id) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/getUserById`,
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
    console.error("Failed to get user:", err);
  }
};
