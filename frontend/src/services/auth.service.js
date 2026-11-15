
import api from "./api";

// Register a new student
export const registerUser = (data) => {
    return api.post("/auth/register", data);
};

// Login user
export const loginUser = (data) => {
    return api.post("/auth/login", data);
};


//logout user

export const logoutUser = () => {
    return api.post("/auth/logout")
};


// Reset password using the token from the email link
export const resetPasswordRequest = (token, newPassword) => {
  return api.post(`/auth/reset-password/${token}`, {
    newPassword,
  });
};