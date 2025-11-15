import api from "@/services/api";

interface RegisterUserData {
  name: string;
  ci: string;
  phone: string;
  email: string;
  password: string;
  roleId?: number;
}

export const registerUser = async (userData: RegisterUserData) => {
  try {
    // asignamos rol por defecto a 1 (Cliente)
    const response = await api.post("/user", { ...userData, roleId: 1 });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error registrando usuario");
  }
};
