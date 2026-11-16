import api from "./api";


//fetch user profile
export const getUserProfile = () => {
    return api.get("/users/profile");
};

//fetch user uploads
export const getMyUploads = () => {
    return api.get("/users/my-uploads");
};