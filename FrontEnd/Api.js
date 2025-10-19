// Api.js : centralise toutes les requêtes vers l'API
const Api = {
  async getToken(payload) {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Erreur identifiant ou mot de passe");

    const data = await response.json();
    if (!data.token) throw new Error("Pas de token reçu");

    return data; // { token, userId }
  },

  async getWorks() {
    try {
      const response = await fetch("http://localhost:5678/api/works");
      const works = await response.json();
      return works;
    } catch (error) {
      console.error("Erreur :", error.message);
      return [];
    }
  },

  async getCategories() {
    try {
      const response = await fetch("http://localhost:5678/api/categories");
      const categories = await response.json();
      return categories;
    } catch (error) {
      console.error("Erreur :", error);
      return [];
    }
  },

  async deleteWork(id) {
    try {
      const response = await fetch(`http://localhost:5678/api/works/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) throw new Error("Erreur suppression");

      const dialogElemToRemove = document.querySelector(
        `dialog figure[data-id="${id}"]`
      );
      const galleryElemToRemove = document.querySelector(
        `.gallery figure[data-id="${id}"]`
      );

      if (dialogElemToRemove) {
        dialogElemToRemove.addEventListener("animationend", () => {
          dialogElemToRemove.remove();
          if (galleryElemToRemove) galleryElemToRemove.remove();
        });
        dialogElemToRemove.classList.add("scale-out-center");
      }
    } catch (err) {
      console.error(err);
      alert("Impossible de supprimer cet élément");
    }
  },

  async addWork(formData) {
    try {
      await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
    } catch (error) {
      console.error("Erreur :", error);
    }
  },
};
export default Api;
