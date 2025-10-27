import Api from "./Api.js";
import Auth from "./Auth.js";
import Utils from "./Utils.js";

let currentCategory = 0;
let initAllWorks = [];
let filteredWorks = [];
let allCategories = [];

export const updateWorks = {
  delete(id) {
    initAllWorks = initAllWorks.filter((work) => work.id !== id);
  },
  add(work) {
    initAllWorks.unshift(work);
  },
};
const Menu = {
  createMenuDefaultBtn() {
    const defaultLi = document.createElement("li");
    const defaultButton = document.createElement("button");
    defaultButton.setAttribute("data-id", 0);
    defaultButton.textContent = "Tous";
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
    for (let i = 0; i < menuButton.length; i++) {
      i === currentCategory
        ? menuButton[i].classList.add("active")
        : menuButton[i].classList.remove("active");
    }
  },
  attachMenuBtnsListeners() {
    const buttonsArray = document.querySelectorAll("menu button");
    buttonsArray.forEach((btn) => {
      btn.addEventListener("click", () => {
        const categoryId = parseInt(btn.getAttribute("data-id"));
        currentCategory = categoryId;
        filteredWorks =
          categoryId === 0
            ? initAllWorks
            : initAllWorks.filter((work) => work.categoryId === categoryId);
        const gallery = document.querySelector(".gallery");
        gallery.innerHTML = "";
        this.toggleActive();
        Gallery.generateGallery(filteredWorks);
      });
    });
  },
};
export const Gallery = {
  tempUrl: "",
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
            Api.deleteWork(Number(data));
          });
          card.appendChild(iconTrash);
        }
        container.appendChild(card);
      });
    }
  },
  appendCard(id, url, title) {
    const newCard = this.createCard(id, url, title);
    const figcaption = document.createElement("figcaption");
    figcaption.textContent = title;
    newCard.appendChild(figcaption);
    document.querySelector(".gallery").prepend(newCard);
  },
  removeElement(id) {
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
  },
};
export const Modal = {
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
    // Flèche de retour
    const arrowLeft = dialog.querySelector(".fa-arrow-left");
    if (arrowLeft) {
      arrowLeft.addEventListener("click", () => {
        Modal.view.switchModalView("defaut", modalFooterBtn);
      });
    }

    // Bouton footer
    const modalFooterBtn = dialog.querySelector(".modalFooter button");
    if (!modalFooterBtn) return;
    modalFooterBtn.addEventListener("click", (event) => {
      const btn = event.target;
      Modal.button.handleModalBtnClick(btn);
    });
  },
  close() {
    document.querySelector("dialog").remove();
  },
  button: {
    toggleSendAction(state) {
      const btn = document.querySelector(".modalFooter button");
      if (state === true) {
        btn.setAttribute("action", "send");
        btn.disabled = false;
      }
      else {
        btn.disabled = true;
        btn.setAttribute("action", "pre-send");
      }
    },
    handleModalBtnClick(btn) {
      const currentAction = btn.getAttribute("action");
      if (!currentAction) return;

      if (currentAction === "add") {
        Modal.view.switchModalView("form", btn);
      } else if (currentAction === "send") {
        const form = document.querySelector("dialog form");
        const data = new FormData(form);
        Api.addWork(data);
      }
    },
  },
  view: {
    switchModalView(view, btn) {
      if (view === "defaut") {
        Modal.view.toggleDefaultView("show", btn);
        Modal.view.toggleFormView("hide", btn);
        Modal.view.setModalTitle(view);
      } else if (view === "form") {
        Modal.view.toggleDefaultView("hide", btn);
        Modal.view.toggleFormView("show", btn);
        Modal.view.setModalTitle(view);
      }
    },
    toggleDefaultView(display, btn) {
      const defaultModal = document.querySelector(".modalSectionDefault");
      const arrowLeft = document.querySelector(".fa-arrow-left");
      if (display === "show") {
        if (defaultModal) defaultModal.style.display = "grid";
        arrowLeft.style.visibility = "hidden";
        btn.setAttribute("action", "add");
        btn.disabled = false;
        btn.textContent = "Ajouter une photo";
      } else if (display === "hide") {
        defaultModal.style.display = "none";
      }
    },
    toggleFormView(display, btn) {
      const addModal = document.querySelector(".modalSectionAdd");
      const arrowLeft = document.querySelector(".fa-arrow-left");
      if (display === "show") {
        if (addModal) {
          addModal.style.display = "flex";
          addModal.innerHTML = `
          <form id="addImageForm">
            <div class="imageUpload">
              <img class="imgPreview" src="./assets/icons/img_download.png" alt="icone d'image"/>
              <label for="fileInput" class="fileLabel">+ Ajouter photo</label>
              <input type="file" id="fileInput" name="image" accept="image/*" hidden required />
              <p>jpg, png : 4 Mo max</p>
            </div>
            
            <div class="formGroup">
              <label for="titleInput">Titre</label>
              <input type="text" id="titleInput" name="title" required />
            </div>

            <div class="formGroup">
              <label for="categorie">Catégorie</label>
              <select name="category" id="categorie" required>
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
          Modal.form.setupImagePreview(addModal);
          btn.textContent = "Valider";
          btn.disabled = true;
          btn.setAttribute("action", "pre-send");
        }
        if (arrowLeft) {
          arrowLeft.style.visibility = "visible";
        }
      } else if (display === "hide") {
        if (addModal) {
          addModal.innerHTML = "";
          addModal.style.display = "none";
        }
      }
    },
    setModalTitle(view) {
      const modalTitle = document.querySelector(".modalTitle");
      if (view === "defaut") {
        modalTitle.textContent = "Galerie photo";
      } else if (view === "form") {
        modalTitle.textContent = "Ajouter une photo";
      }
    }
  },
  form: {
    setupImagePreview(addModal) {
    const fileInput = addModal.querySelector("#fileInput");
    const imgPreview = addModal.querySelector(".imgPreview");
    const fileLabel = addModal.querySelector(".fileLabel");
    const fileInfo = addModal.querySelector("p");
    const titleInput = addModal.querySelector("#titleInput");
    const select = addModal.querySelector("select");

    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        const input = e.target;
        Utils.isImageInputValid(input) === true
          ? Modal.form.updateImagePreview(input, imgPreview, fileLabel, fileInfo)
          : Modal.form.resetImagePreview(input, imgPreview, fileLabel, fileInfo);
        Utils.isFormValid(fileInput) === true
          ? Modal.button.toggleSendAction(true)
          : Modal.button.toggleSendAction(false);
      });

      //changer l’image en cliquant dessus
      imgPreview.addEventListener("click", () => {
        if (imgPreview.classList.contains("imgAdded")) {
          fileInput.click(); // Ouvre à nouveau le sélecteur de fichier
        }
      });
    }
    if (titleInput) {
      titleInput.addEventListener("input", () => {
        Utils.isFormValid(fileInput) === true
          ? Modal.button.toggleSendAction(true)
          : Modal.button.toggleSendAction(false);
      });
    }
    if (select) {
      select.addEventListener("change", () => {
        Utils.isFormValid(fileInput) === true
          ? Modal.button.toggleSendAction(true)
          : Modal.button.toggleSendAction(false);
      });
    }
  },
  updateImagePreview(fileInput, imgPreview, fileLabel, fileInfo) {
    const file = fileInput.files[0];
    if (!file) return;
    fileInput.parentNode.style.padding = "0";
    const url = URL.createObjectURL(file);
    imgPreview.src = url;
    Gallery.tempUrl = url;
    imgPreview.classList.add("imgAdded");
    fileLabel.style.display = "none";
    fileInput.style.display = "none";
    if (fileInfo) fileInfo.style.display = "none";
  },
  resetImagePreview(fileInput, imgPreview, fileLabel, fileInfo) {
    // Reset visuel uniquement, pas de innerHTML !
    fileInput.parentNode.style.padding = "1.2rem 0";
    imgPreview.src = "./assets/icons/img_download.png";
    imgPreview.classList.remove("imgAdded");
    fileLabel.style.display = "block";
    fileInput.style.display = "none";
    if (fileInfo) fileInfo.style.display = "block";
    // On efface bien le fichier sélectionné
    fileInput.value = "";
  }
  },
};
export const EditMode = {
  enable() {
    if (!Auth.isLogged()) return;
    this.updateLoginButton();
    this.createBanner();
    this.createEditButton(() => Modal.openEditModal());
  },
  disable() {
    const banner = document.querySelector(".editBanner");
    if (banner) banner.remove();

    const button = document.querySelector(".editButton");
    if (button) button.remove();
  },
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
      Auth.logout();
      this.disable();
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
  EditMode.enable();
}
