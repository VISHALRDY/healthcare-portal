export const saveAuth = ({ token, role, user }) => {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("user", JSON.stringify(user));
};

export const getRole = () => localStorage.getItem("role");
export const getToken = () => localStorage.getItem("token");

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
};
