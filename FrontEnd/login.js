// Script de gestion du formulaire de login
// Il envoie les données à l'API et gère la réponse (token ou erreur)
const form = document.querySelector("#login form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;
  const payload = { email, password };
  const submitBtn = form.querySelector('input[type="submit"]');

  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      // Exemple de réponse attendue :
      // { "userId": 1, "token": "eyJhbGciOi..." }
      const data = await response.json();

      if (data && data.token) {
        // Sauvegarder token + userId + flag de connexion
        localStorage.setItem("token", data.token);
        if (typeof data.userId !== "undefined") {
          localStorage.setItem("userId", String(data.userId));
        }
        localStorage.setItem("isLogged", "true");

        // Redirection vers index.html (index.html pourra vérifier localStorage)
        window.location.href = "index.html";
        } else {
          // Réponse 200 sans token = problème inattendu côté API
          afficherErreur("Erreur dans l’identifiant ou le mot de passe");
        }
    } else {
      // Cas classique : 401 / 400 / autre -> on affiche le message demandé
      afficherErreur("Erreur dans l’identifiant ou le mot de passe");
    }
  } catch (err) {
    console.error("Erreur réseau ou fetch :", err);
    afficherErreur("Impossible de se connecter au serveur");
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
});

/* Fonction d'affichage d'erreur (sous le formulaire) */
function afficherErreur(message) {
  let el = document.querySelector(".erreur-login");
  if (!el) {
    el = document.createElement("p");
    el.className = "erreur-login";
    el.style.color = "red";
    el.style.marginTop = "10px";
    const form = document.querySelector("#login form");
    form.appendChild(el);
  }
  el.textContent = message;
}