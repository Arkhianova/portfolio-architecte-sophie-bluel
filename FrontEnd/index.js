// Script pour gérer l'affichage des œuvres, des catégories et le mode edit
let currentCategory = 0;
let initAllWorks = [];
let filteredWorks = [];
let allCategories = [];

// function fetchWorks() pour récupérer les œuvres : API GET /works
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
//function fetchCategories() pour récupérer les catégories : API GET /categories
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
// function createMenu() pour créer le menu des catégories : DOM
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
    // function anonyme createMenuBtns() pour créer les boutons du menu : DOM
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
// function createGallery() pour créer la galerie des œuvres : DOM
function createGallery(works) {
  const gallery = document.querySelector(".gallery");
  if (works.length === 0) {
    gallery.innerHTML = '<p class="empty">"Aucune œuvre disponible"</p>';
  } else {
    // function anonyme createGalleryItem() pour créer les éléments de la galerie : DOM
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
// function createModalGallery() pour créer la galerie des œuvres dans la modale : DOM
function createModalGallery(works) {

  const modalGallery = document.querySelector("dialog .modalSectionDefault");
  if (works.length === 0) {
    modalGallery.innerHTML = '<p class="empty">"Aucune œuvre disponible"</p>';
  } else {
    // function anonyme createGalleryItem() pour créer les éléments de la galerie : DOM
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
// function deleteWork() pour supprimer une œuvre : API DELETE /works/:id
async function deleteWork(id) {
  try {
    const response = await fetch(`http://localhost:5678/api/works/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (!response.ok) throw new Error("Erreur suppression");

    // seulement ici, après confirmation serveur
    console.log("reponse ok supression de ", id);
    //
    const dialogElemToRemove = document.querySelector(
      `dialog figure[data-id="${id}"]`
    );
    const galleryElemToRemove = document.querySelector(
      `.gallery figure[data-id="${id}"]`
    );

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
// function init() pour initialiser l'application : DOM + API
async function init() {
  // Récupération des données + peuplement du DOM
  initAllWorks = await getWorks();
  createGallery(initAllWorks);
  allCategories = await getCategories();
  createMenu(allCategories);
  attachEventListeners();
  toggleActive();
  handleEditMode();
}
// function attachEventListeners() pour attacher les écouteurs d'événements : DOM ??function attachFilterWorks()
function attachEventListeners() {
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

      toggleActive();
      //appel de createGallery avec le tableau filtré ?? ou créer new function updateGallery() 
      createGallery(filteredWorks);
    });
  });
}
//function toggleActive() pour gérer l'état actif des boutons du menu : DOM
function toggleActive() {
  const menuButton = document.querySelectorAll("menu button");
  // pour chaque bouton : checker si son index correspond à la catégorie courante
  // mettre la logique de vérification dans une function nommée isCurrentCategory()
  for (let i = 0; i < menuButton.length; i++) {
    // comparaison de l'index du bouton avec la catégorie courante : créer function nommée isCurrentCategory()
    i === currentCategory
      ? menuButton[i].classList.add("active")
      : menuButton[i].classList.remove("active");
  }
}
// function handleEditMode() pour gérer le mode édition : DOM + localStorage
// vérifier si l'utilisateur est connecté (localStorage) et modifier le DOM en conséquence
//renommer en toggleEditMode() ? ou toggleAdminMode() ? ou setEditMode() ? ou View . choisir viewn, mode, state ?
function handleEditMode() {
  const isLogged = localStorage.getItem("isLogged");
//on use du système booléen pour checker un état d'authentification
// il y a trop de code dans le bloc if/else qui va de la ligne 203 à 348.
// on pourrait extraire chaque partie dans des fonctions dédiées
// ex : modifyLoginButton(), createBanner(), createModifyBtn(), createModalDefault(), createModalGallery()
// et appeler ces fonctions dans le if/else
  if (isLogged) {
    // // on pourrait mettre la logique qui suit dans une function nommée enableEditMode()
    // // et une autre function disableEditMode() pour le else
    // // et appeler toggleEditMode() qui checkerait l'état et appellerait l'une ou l'autre

    // --- Modifier le texte Login → Logout ---
    const loginLi = document.querySelector("header nav ul li a[href*='login']");
    loginLi.innerHTML = "logout";
    loginLi.style.cursor = "default";
    // Ajouter un click pour déconnexion  
    loginLi.addEventListener("click", (event) => {
      // on pourrait mettre cette logique dans une fonction nommée logout() ou modifyLoginButton()
      event.preventDefault();
      localStorage.removeItem("isLogged");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.location.reload(); // recharge la page pour réinitialiser le mode
    });

    // createBanner()         --- Créer le bandeau "Mode édition"
    // on devrait créer une function createBanner() pour cette logique
    const banner = document.createElement("div");
    banner.classList.add("editBanner");
    banner.innerHTML ='<i class="fa-regular fa-pen-to-square"></i><p>Mode édition</p>';
    document.body.prepend(banner);

    // createModifyBtn()          --- Créer le bouton "modifier"
    const button = document.createElement("button");
    button.classList.add("editButton");
    button.innerHTML =
      "<i class=\"fa-regular fa-pen-to-square\"></i><p id='button'>modifier</p>";

    const h2 = document.querySelector("#portfolio h2");
    h2.insertAdjacentElement("afterend", button);

    const menu = document.querySelector("menu");
    menu.remove();

    //addEventListener
    button.addEventListener("click", () => {
      
      //createModalDefault()
      const dialog = document.createElement("dialog");
      dialog.innerHTML = `
        <header class="modalHeader"><i class="fa-solid fa-arrow-left"></i><i class="fa-solid fa-xmark"></i></header>
        <h2 class="modalTitle">Galerie photo</h2>
        <section class="modalSectionDefault"></section>
        <section class="modalSectionAdd"></section>
        <footer class="modalFooter"><button action="add">Ajouter une photo</button></footer>
      `;
      // permet de fermer la modale en cliquant sur la croix
      const closeIcon = dialog.querySelector(".fa-xmark");
      closeIcon.addEventListener("click", () => {
        dialog.close();
        dialog.remove();
      });
     
     //__________________

      const addBtn = dialog.querySelector(".modalFooter button");
      addBtn.addEventListener("click", (event) => {
          const action = event.target.getAttribute("action");
        if(action === "add") {
          //changer l'attribut action du bouton pour passer le bouton en mode "send"
          event.target.setAttribute("action", "send");
          event.target.textContent = "Valider";
          event.target.disabled = true;
          event.target.style.backgroundColor = "#a7a7a7";

        // cacher la modale par defaut
        const defaultModal = dialog.querySelector(".modalSectionDefault");
        defaultModal.style.display = "none";
        // afficher la fléche gauche dans le header de la modale
        dialog.querySelector(".fa-arrow-left").style.visibility = "visible";

        const addModal = document.querySelector(".modalSectionAdd");
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
                .map((cat) => `<option value="${cat.id}">${cat.name}</option>`)
                .join("")}
            </select>
          </div>
        </form>
        `;

        dialog
          .querySelector("#fileInput")
          .addEventListener("change", (event) => {
            event.target.parentNode.style.padding = "0 128px";
            const file = event.target.files[0];
            const imgPreview = document.querySelector(".imgPreview");

            const imageUrl = URL.createObjectURL(file);
            console.log("URL vaut : ", imageUrl);
            imgPreview.src = imageUrl;
            imgPreview.classList.add("imgAdded");
            document.querySelector(".modalTitle").innerHTML = "Ajout photo";
            document.querySelector(".fileLabel").style.display = "none";
            event.target.style.display = "none";
            document.querySelector("#fileInput + p").style.display = "none";

            event.target.innerHTML = "Valider";
            event.target.disabled = true;
          });
        }
        else if (action === "send") {
          console.log("fetcchhhhhhhhhhhhhhhhhh")
        }
      });
      // permet de fermer la modale en cliquant en dehors
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) {
          dialog.close();
          dialog.remove();
        }
      });
      document.body.append(dialog);

      createModalGallery(initAllWorks);

      // Ouvrir la boîte de dialogue en modal (devant tout)
      dialog.showModal();
    });
  } else {

    // // on pourrait mettre la logique qui suit dans une function nommée disableEditMode()
    const el = document.querySelector(".editBanner");
    el ? el.remove() : null;
    const elem = document.querySelector(".editButton");
    elem ? elem.remove() : null;
  }
}
init();