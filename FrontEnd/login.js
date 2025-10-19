import Api from "./Api.js";
import Auth from "./Auth.js";

const form = document.querySelector("#login form");

form.addEventListener("submit", handleLogin);

async function handleLogin(e) {
  e.preventDefault();

  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;
  const submitBtn = form.querySelector('input[type="submit"]');

  const payload = { email, password };

  try {
    submitBtn.disabled = true;
    const data = await Api.getToken(payload);
    Auth.login(data.token, data.userId);
    window.location.href = "index.html";
  } catch (err) {
    afficherErreur(err.message);
  } finally {
    submitBtn.disabled = false;
  }
}

function afficherErreur(message) {
  let el = document.querySelector(".erreur-login");
  if (!el) {
    el = document.createElement("p");
    el.className = "erreur-login";
    el.style.color = "red";
    el.style.marginTop = "10px";
    form.appendChild(el);
  }
  el.textContent = message;
}
