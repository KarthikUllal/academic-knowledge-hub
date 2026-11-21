import api from "./api";


//fetch user profile
export const getUserProfile = () => {
    return api.get("/users/profile");
};

//fetch user uploads
export const getMyUploads = () => {
    return api.get("/users/my-uploads");
};

// Update profile details
export const updateUserProfile = (profileData) => {
    return api.patch("/users/profile", profileData);
};

// Update profile picture
export const updateProfilePicture = (imageFile) => {
    const formData = new FormData();
    formData.append("profilePicture", imageFile);

    return api.patch("/users/profile-picture", formData);
};