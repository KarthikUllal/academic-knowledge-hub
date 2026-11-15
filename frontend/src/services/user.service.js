
import api from "./api";

// Get logged-in user's profile
export const getUserProfile = () => {
  return api.get("/users/profile");
};
