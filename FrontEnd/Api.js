import { Gallery, Modal, updateWorks } from "./Dom.js";
import Utils from "./Utils.js";

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

    return data; // { userId, token }
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

      if (!response.ok) {
        Utils.alert("fetchErrorDeleteWork");
        return;
      };
      Gallery.removeElement(id);
      updateWorks.delete(id);
      
    } catch (err) {
      console.error(err);
      alert("Impossible de supprimer cet élément");
    }
  },

  async addWork(formData) {
    try {
      const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      if(response.ok) {
        const data = await response.json();
        const url = Gallery.tempUrl;
        const id = data.id;
        const title = data.title;
        Gallery.appendCard(id, url, title);
        alert("Image ajoutée dans la galerie");
        Modal.close();
        updateWorks.add(data);
      }
      else {
        Utils.alert("fetchErrorPostWork");
      }
    } catch (error) {
      console.error("Erreur :", error);
    }
  },
};
export default Api;
