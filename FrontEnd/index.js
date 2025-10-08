// Script pour gérer l'affichage des œuvres, des catégories et le mode edit
let currentCategory = 0;
let initAllWorks = [];
let filteredWorks = [];
let allCategories = [];

async function getWorks() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    const works = await response.json();
    console.log(works);
    return works;
  } catch (error) {
    console.error("Erreur :", error.message);
    return [];
  }
}
async function getCategories() {
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error("Erreur :", error);
    return [];
  }
}
function createMenu(arrayOfCat) {
  //le premier bouton par défaut du menu, on le créé directement
  const menu = document.createElement("menu"); //creation menu
  const defaultLi = document.createElement("li"); // creation premier li du menu
  const defaultButton = document.createElement("button"); // creation premier button DANS premier li
  defaultButton.setAttribute("data-id", 0); // ajout attribut premier button
  defaultButton.textContent = "Tous"; // initialisation premier bouton avec "Tous"
  defaultButton.classList.add("hoverBtn");
  defaultLi.appendChild(defaultButton); //place button dans li ==> <li><button data-id..>Tous</button></li>
  menu.appendChild(defaultLi); // place li dans menu ==> <menu><li><button>Tous</button></li></menu>

  //On place <menu></menu> après la div.portfolio-header
  const portfolioHeader = document.querySelector(".portfolio-header"); // selection <div class="portfolio-header"> de la section#portfolio
  portfolioHeader.insertAdjacentElement("afterend", menu); // Insère menu juste après le <div class="portfolio-header">

  if (arrayOfCat.length === 0) {
    document.querySelector("menu").innerHTML = "";
    return;
  } else {
    arrayOfCat.forEach((category) => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.textContent = category.name;
      button.setAttribute("data-id", category.id);
      button.classList.add("hoverBtn");
      li.appendChild(button);
      menu.appendChild(li);
    });
  }
}
function createGallery(works) {
  const gallery = document.querySelector(".gallery");
  if (works.length === 0) {
    gallery.innerHTML = '<p class="empty">"Aucune œuvre disponible"</p>';
  } else {
    works.forEach((work) => {
      const figure = document.createElement("figure");
      figure.setAttribute("data-id", work.id);
      const img = document.createElement("img");
      img.src = work.imageUrl;
      img.alt = work.title;
      const figcaption = document.createElement("figcaption");
      figcaption.textContent = work.title;

      // Construction de la structure
      figure.appendChild(img);
      figure.appendChild(figcaption);
      // Ajout dans la galerie
      gallery.appendChild(figure);
    });
  }
}
function createModalGallery(works) {
  const modalGallery = document.querySelector("dialog .modalSectionDefault");
  if (works.length === 0) {
    modalGallery.innerHTML = '<p class="empty">"Aucune œuvre disponible"</p>';
  } else {
    works.forEach((work) => {
      const figure = document.createElement("figure");
      figure.setAttribute("data-id", work.id);
      const iconTrash = document.createElement("i");
      iconTrash.classList.add("fa-solid");
      iconTrash.classList.add("fa-trash-can");

      iconTrash.addEventListener("click", (event) => {
        const el = event.target;
        const fig = el.parentNode;
        const data = fig.getAttribute("data-id");
        deleteWork(data);
      });

      figure.appendChild(iconTrash);
      const img = document.createElement("img");
      img.src = work.imageUrl;
      img.alt = work.title;

      // Construction de la structure
      figure.appendChild(img);
      // Ajout dans la galerie
      modalGallery.appendChild(figure);
    });
  }
}

async function deleteWork(id) {
  try {
    const response = await fetch(`http://localhost:5678/api/works/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });

    if (!response.ok) throw new Error("Erreur suppression");

    // seulement ici, après confirmation serveur
    console.log("reponse ok supression de ", id)
    const dialogElemToRemove = document.querySelector(`dialog figure[data-id="${id}"]`);
    const galleryElemToRemove = document.querySelector(`.gallery figure[data-id="${id}"]`);

      dialogElemToRemove.addEventListener("animationend", () => {
      dialogElemToRemove.remove();
      galleryElemToRemove.remove();
        });
   
    dialogElemToRemove.classList.add("scale-out-center");
    

  } catch (err) {
    console.error(err);
    alert("Impossible de supprimer cet élément");
  }
}

async function init() {
  initAllWorks = await getWorks();
  createGallery(initAllWorks);
  allCategories = await getCategories();
  createMenu(allCategories);
  attachEventListeners();
  toggleActive();
  handleEditMode();
}
function attachEventListeners() {
  const buttonsArray = document.querySelectorAll("menu button");

  buttonsArray.forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      currentCategory = idx;
      const categoryId = parseInt(btn.getAttribute("data-id"));
      filteredWorks =
        categoryId === 0
          ? initAllWorks
          : initAllWorks.filter((work) => work.categoryId === categoryId);
      const gallery = document.querySelector(".gallery");
      gallery.innerHTML = "";

      toggleActive();
      createGallery(filteredWorks);
    });
  });
}
function toggleActive(str, arr) {
  const menuButton = document.querySelectorAll("menu button");

  for (let i = 0; i < menuButton.length; i++) {
    i === currentCategory
      ? menuButton[i].classList.add("active")
      : menuButton[i].classList.remove("active");
  }
}
function handleEditMode() {
  const isLogged = localStorage.getItem("isLogged");

  if (isLogged) {
    const banner = document.createElement("div");
    banner.classList.add("editBanner");
    banner.innerHTML =
      '<i class="fa-regular fa-pen-to-square"></i><p>Mode édition</p>';
    document.body.prepend(banner);

    const button = document.createElement("button");
    button.classList.add("editButton");
    button.innerHTML =
      "<i class=\"fa-regular fa-pen-to-square\"></i><p id='button'>modifier</p>";

    button.addEventListener("click", () => {
      const dialog = document.createElement("dialog");
      dialog.innerHTML = `
        <header class="modalHeader"><i class="fa-solid fa-arrow-left"></i><i class="fa-solid fa-xmark"></i></header>
        <h2 class="modalTitle">Galerie photo</h2>
        <section class="modalSectionDefault"></section>
        <section className="modalSectionAdd"></section>
        <footer class="modalFooter"><button>Ajouter une photo</button></footer>
      `;
      const closeIcon = dialog.querySelector(".fa-xmark");
      closeIcon.addEventListener("click", () => {
        dialog.close();
        dialog.remove();
      });

      document.body.append(dialog);

      createModalGallery(initAllWorks);

      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) {
          dialog.close();
          dialog.remove();
        }
      });
      // Ouvrir la boîte de dialogue en modal (devant tout)
      dialog.showModal();
    });

    const h2 = document.querySelector("#portfolio h2");
    h2.insertAdjacentElement("afterend", button);

    const menu = document.querySelector("menu");
    menu.remove();

    // --- Modifier le texte Login → Logout ---
    const loginLi = document.querySelector("header nav ul li a[href*='login']");
    if (loginLi) {
      if (isLogged) {
        loginLi.innerHTML = "logout";
        loginLi.style.cursor = "default";

        // Ajouter un click pour déconnexion
        loginLi.addEventListener("click", (event) => {
          event.preventDefault();
          localStorage.removeItem("isLogged");
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          window.location.reload(); // recharge la page pour réinitialiser le mode
        });
      } else {
        loginLi.innerHTML = "Login";
      }
    }
  } else {
    const el = document.querySelector(".editBanner");
    el ? el.remove() : null;
    const elem = document.querySelector(".editButton");
    elem ? elem.remove() : null;
  }
}

init();
