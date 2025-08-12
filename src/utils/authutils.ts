import { AuthState, User } from "../types/UserModel";

export const initializeAuthState = (): AuthState => {
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");
  const userType = localStorage.getItem("userType");
  const email = localStorage.getItem("email");
  const mobile = localStorage.getItem("mobile");
  const city = localStorage.getItem("city");
  const state = localStorage.getItem("state");
  const userId = localStorage.getItem("userId");
  const photo = localStorage.getItem("photo");
  const location = localStorage.getItem("location");
  const address = localStorage.getItem("address");
  const pincode = localStorage.getItem("pincode");
  const gst_number = localStorage.getItem("gst_number");
  const rera_number = localStorage.getItem("rera_number");
  const company_name = localStorage.getItem("company_name");
  const company_number = localStorage.getItem("company_number");
  const company_address = localStorage.getItem("company_address");
  const representative_name = localStorage.getItem("representative_name");
  const pan_card_number = localStorage.getItem("pan_card_number");
  const aadhar_number = localStorage.getItem("aadhar_number");
  const created_by = localStorage.getItem("created_by");
  const created_user_id = localStorage.getItem("created_user_id");
  const created_user_type = localStorage.getItem("created_user_type");

  // Check if all required fields are present
  if (token && name && userType && email && mobile && city && state && userId) {
    return {
      isAuthenticated: true,
      user: {
        id: parseInt(userId),
        user_type: parseInt(userType),
        name,
        mobile,
        email,
        photo: photo || null,
        status: 1,
        created_date: "",
        created_time: "",
        updated_date: "",
        updated_time: "",
        state,
        city,
        location: location || "",
        address: address || "",
        pincode: pincode || "",
        gst_number: gst_number || "",
        rera_number: rera_number || "",
        created_by: created_by || "",
        created_user_id: created_user_id ? parseInt(created_user_id) : null, 
        created_user_type:created_user_type ? parseInt(created_user_type) : null,
        company_name: company_name || "",
        company_number: company_number || "",
        company_address: company_address || "",
        representative_name: representative_name || "",
        pan_card_number: pan_card_number || "",
        aadhar_number: aadhar_number || "",
        feedback: null,
      } as User,
      token,
      loading: false,
      error: null,
    };
  }

  return {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null,
  };
};