import Api from "./Api.js";

const Auth = {
  tryLogin() {
    const form = document.querySelector("#login form");
    form.addEventListener("submit", (e) => this.handleLogin(e));
  },
  handleLogin(e) {
    e.preventDefault();
    this.handleLoginAsync(e);
  },
  handleLoginAsync: async function (e) {
    const payload = this.createPayload(e.target);
    const submitBtn = e.target.querySelector('input[type="submit"]');
    try {
      submitBtn.disabled = true;
      const data = await Api.getToken(payload);
      Auth.login(data.token, data.userId);
      window.location.href = "index.html";
    } catch (err) {
      this.afficherErreur(err.message);
    } finally {
      submitBtn.disabled = false;
    }
  },
  createPayload(form) {
    const email = form.querySelector("#email").value.trim();
    const password = form.querySelector("#password").value;
    const payload = { email, password };
    return payload;
  },
  login(token, userId) {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("isLogged", "true");
  },
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("isLogged");
    window.location.reload();
  },
  isLogged() {
    return localStorage.getItem("isLogged") === "true";
  },
  afficherErreur(message) {
    let el = document.querySelector(".erreur-login");
    const form = document.querySelector("#login form");
    if (!el) {
      el = document.createElement("p");
      el.className = "erreur-login";
      el.style.color = "red";
      el.style.marginTop = "10px";
      form.appendChild(el);
    }
    el.textContent = message;
  },
};

export default Auth;
