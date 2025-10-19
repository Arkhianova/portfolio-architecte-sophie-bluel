import Api from "./Api.js";
import Auth from "./Auth.js";

let currentCategory = 0;
let initAllWorks = [];
let filteredWorks = [];
let allCategories = [];

const Menu = {
  createMenuDefaultBtn() {
    //le premier bouton par défaut du menu, on le créé directement
    const defaultLi = document.createElement("li"); // creation premier li du menu
    const defaultButton = document.createElement("button"); // creation premier button DANS premier li
    defaultButton.setAttribute("data-id", 0); // ajout attribut premier button
    defaultButton.textContent = "Tous"; // initialisation premier bouton avec "Tous"
    defaultButton.classList.add("hoverBtn");
    defaultLi.appendChild(defaultButton); //place button dans li ==> <li><button data-id..>Tous</button></li>
    return defaultLi;
  },
  createMenuCategoryBtn(category) {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.dataset.id = category.id;
    button.textContent = category.name;
    button.classList.add("hoverBtn");
    li.appendChild(button);
    return li;
  },
  createMenu(arrayOfCat) {
    if (arrayOfCat.length === 0) {
      return;
    }
    // Supprime un menu existant pour éviter les doublons
    const oldMenu = document.querySelector("menu");
    if (oldMenu) oldMenu.remove();
    const menu = document.createElement("menu"); //creation menu
    menu.appendChild(this.createMenuDefaultBtn());
    arrayOfCat.forEach((cat) => {
      menu.appendChild(this.createMenuCategoryBtn(cat));
    });

    //On place <menu>...</menu> après la div.portfolio-header
    const portfolioHeader = document.querySelector(".portfolio-header");
    portfolioHeader.insertAdjacentElement("afterend", menu);
  },
  toggleActive() {
    const menuButton = document.querySelectorAll("menu button");
    // pour chaque bouton : checker si son index correspond à la catégorie courante
    // mettre la logique de vérification dans une function nommée isCurrentCategory()
    for (let i = 0; i < menuButton.length; i++) {
      // comparaison de l'index du bouton avec la catégorie courante : créer function nommée isCurrentCategory()
      i === currentCategory
        ? menuButton[i].classList.add("active")
        : menuButton[i].classList.remove("active");
    }
  },
  attachMenuBtnsListeners() {
    const buttonsArray = document.querySelectorAll("menu button");
    // function anonyme attachFilterWorks() pour filtrer les œuvres au clic sur un bouton du menu : DOM
    //?? ou function nommée filterWorks()
    buttonsArray.forEach((btn, idx) => {
      //callback pour chaque bouton / function anonyme filterWorks()
      btn.addEventListener("click", () => {
        currentCategory = idx;
        const categoryId = parseInt(btn.getAttribute("data-id"));
        filteredWorks =
          categoryId === 0
            ? initAllWorks
            : initAllWorks.filter((work) => work.categoryId === categoryId);
        const gallery = document.querySelector(".gallery");
        gallery.innerHTML = "";

        this.toggleActive();
        //appel de createGallery avec le tableau filtré ?? ou créer new function updateGallery()
        Gallery.generateGallery(filteredWorks);
      });
    });
  },
};
const Gallery = {
  createCard(id, url, title) {
    const card = document.createElement("figure");
    card.setAttribute("data-id", id);
    const img = document.createElement("img");
    img.src = url;
    img.alt = title;
    card.appendChild(img);
    return card;
  },
  generateGallery(works, selector = ".gallery") {
    const container = document.querySelector(selector);
    if (works.length === 0) {
      container.innerHTML = '<p class="empty">"Aucune œuvre disponible"</p>';
    } else {
      works.forEach((work) => {
        const card = this.createCard(work.id, work.imageUrl, work.title);
        if (selector === ".gallery") {
          const figcaption = document.createElement("figcaption");
          figcaption.textContent = work.title;
          card.appendChild(figcaption);
        }
        if (selector === "dialog .modalSectionDefault") {
          const iconTrash = document.createElement("i");
          iconTrash.classList.add("fa-solid");
          iconTrash.classList.add("fa-trash-can");
          iconTrash.addEventListener("click", (event) => {
            const el = event.target;
            const fig = el.parentNode;
            const data = fig.getAttribute("data-id");
            Api.deleteWork(data);
          });
          card.appendChild(iconTrash);
        }
        // Ajout dans la galerie
        container.appendChild(card);
      });
    }
  },
};
const Modal = {
  createModal() {
    const dialog = document.createElement("dialog");

    dialog.innerHTML = `
    <header class="modalHeader">
      <i class="fa-solid fa-arrow-left"></i>
      <i class="fa-solid fa-xmark"></i>
    </header>
    <h2 class="modalTitle">Galerie photo</h2>
    <section class="modalSectionDefault"></section>
    <section class="modalSectionAdd"></section>
    <footer class="modalFooter">
      <button action="add">Ajouter une photo</button>
    </footer>
  `;

    return dialog;
  },
  openEditModal() {
    const dialog = this.createModal();
    document.body.append(dialog);
    this.attachModalEvents(dialog);
    this.setupAddPhotoForm(dialog);
    Gallery.generateGallery(initAllWorks, "dialog .modalSectionDefault");
    dialog.showModal();
  },
  attachModalEvents(dialog) {
    // Fermer sur la croix
    const closeIcon = dialog.querySelector(".fa-xmark");
    if (closeIcon) {
      closeIcon.addEventListener("click", () => {
        dialog.close();
        dialog.remove();
      });
    }

    // Fermer si clic à l’extérieur
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        dialog.close();
        dialog.remove();
      }
    });

    // TODO : Ajouter la flèche retour si nécessaire
  },
  setupAddPhotoForm(dialog) {
    const addBtn = dialog.querySelector(".modalFooter button[action='add']");
    if (!addBtn) return;

    addBtn.addEventListener("click", (event) => {
      const action = event.target.getAttribute("action");

      if (action === "add") {
        // Passer le bouton en mode "send"
        event.target.setAttribute("action", "send");
        event.target.textContent = "Valider";
        event.target.disabled = true;
        event.target.style.backgroundColor = "#a7a7a7";

        // Cacher la section modale par défaut
        const defaultModal = dialog.querySelector(".modalSectionDefault");
        if (defaultModal) defaultModal.style.display = "none";

        // Afficher la section ajout
        const addModal = dialog.querySelector(".modalSectionAdd");
        if (addModal) {
          addModal.style.display = "flex";
          addModal.innerHTML = `
          <form id="addImageForm">
            <div class="imageUpload">
              <img class="imgPreview" src="./assets/icons/img_download.png" alt="icone d'image"/>
              <label for="fileInput" class="fileLabel">+ Ajouter photo</label>
              <input type="file" id="fileInput" accept="image/*" hidden required />
              <p>jpg, png : 4 Mo max</p>
            </div>
            
            <div class="formGroup">
              <label for="title">Titre</label>
              <input type="text" id="title" name="title" required />
            </div>

            <div class="formGroup">
              <label for="categorie">Catégorie</label>
              <select name="categorie" id="categorie" required>
                <option value="" disabled hidden selected></option>
                ${allCategories
                  .map(
                    (cat) => `<option value="${cat.id}">${cat.name}</option>`
                  )
                  .join("")}
              </select>
            </div>
          </form>
        `;

          // Gestion de la preview d’image
          const fileInput = addModal.querySelector("#fileInput");
          const imgPreview = addModal.querySelector(".imgPreview");
          const fileLabel = addModal.querySelector(".fileLabel");
          const fileInfo = addModal.querySelector("p");

          if (fileInput) {
            fileInput.addEventListener("change", (e) => {
              const file = e.target.files[0];
              if (!file) return;
              e.target.parentNode.style.padding = "0";
              imgPreview.src = URL.createObjectURL(file);
              imgPreview.classList.add("imgAdded");
              document.querySelector(".modalTitle").textContent = "Ajout photo";
              fileLabel.style.display = "none";
              e.target.style.display = "none";
              if (fileInfo) fileInfo.style.display = "none";

              // bouton Valider déjà désactivé ici, logique pour l’activer plus tard si nécessaire
            });
          }
        }
      } else if (action === "send") {
        console.log("ici on ferait l’envoi de la photo à l’API");
        // TODO: appeler Api.addWork() ou autre
      }
    });
  },
};
export const EditMode = {
  // Active le mode édition si l'utilisateur est connecté
  enable() {
    if (!Auth.isLogged()) return;
    this.updateLoginButton();
    this.createBanner();
    this.createEditButton(() => Modal.openEditModal());
  },
  // Désactive le mode édition (supprime bannière + bouton)
  disable() {
    const banner = document.querySelector(".editBanner");
    if (banner) banner.remove();

    const button = document.querySelector(".editButton");
    if (button) button.remove();
  },
  // Création de la bannière Mode édition
  createBanner() {
    const oldBanner = document.querySelector(".editBanner");
    if (oldBanner) oldBanner.remove();

    const banner = document.createElement("div");
    banner.classList.add("editBanner");
    banner.innerHTML = `
      <i class="fa-regular fa-pen-to-square"></i>
      <p>Mode édition</p>
    `;
    document.body.prepend(banner);
  },
  // Création du bouton "modifier" juste après h2 #portfolio
  createEditButton(onClick) {
    const oldButton = document.querySelector(".editButton");
    if (oldButton) oldButton.remove();

    const button = document.createElement("button");
    button.classList.add("editButton");
    button.innerHTML = `
      <i class="fa-regular fa-pen-to-square"></i>
      <p id="button">modifier</p>
    `;

    const h2 = document.querySelector("#portfolio h2");
    h2.insertAdjacentElement("afterend", button);

    // Supprime le menu (filtrage non dispo en mode édition)
    const menu = document.querySelector("menu");
    if (menu) menu.remove();

    if (typeof onClick === "function") {
      button.addEventListener("click", onClick);
    }

    return button;
  },
  // Modifie le lien login → logout et gère le click logout
  updateLoginButton() {
    const loginLink = document.querySelector(
      "header nav ul li a[href*='login']"
    );
    if (!loginLink) return;

    loginLink.textContent = "logout";
    loginLink.style.cursor = "default";

    loginLink.addEventListener("click", (event) => {
      event.preventDefault();
      Auth.logout(); // logout centralisé
      this.disable(); // supprime bannière + bouton
    });
  },
};

export async function init() {
  initAllWorks = await Api.getWorks();
  Gallery.generateGallery(initAllWorks, ".gallery");

  allCategories = await Api.getCategories();
  Menu.createMenu(allCategories);
  Menu.attachMenuBtnsListeners();
  Menu.toggleActive();

  // active le mode édition si l'utilisateur est connecté
  EditMode.enable();
}

