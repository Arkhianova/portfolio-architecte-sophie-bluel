// Auth.js : centralise l'état de connexion et le logout
const Auth = {
  // Transforme la réponse API en état exploitable dans l'application
  login(token, userId) {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("isLogged", "true");
  },
  // Supprime l'état de connexion et recharge la page
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("isLogged");
    window.location.reload();
  },
  // Vérifie si l'utilisateur est connecté
  isLogged() {
    return localStorage.getItem("isLogged") === "true";
  },
};

export default Auth;
