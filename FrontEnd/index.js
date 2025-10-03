// Script pour gérer l'affichage des œuvres, des catégories et le mode edit
let currentCategory = 0;
let initAllWorks = [];
let filteredWorks = [];
let allCategories = [];

async function getWorks() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    const works = await response.json();
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
  defaultButton.classList.add('hoverBtn');
  defaultLi.appendChild(defaultButton); //place button dans li ==> <li><button data-id..>Tous</button></li>
  menu.appendChild(defaultLi); // place li dans menu ==> <menu><li><button>Tous</button></li></menu>

  //On place <menu></menu> après la div.portfolio-header
  const portfolioHeader = document.querySelector(".portfolio-header");  // selection <div class="portfolio-header"> de la section#portfolio
  portfolioHeader.insertAdjacentElement("afterend", menu);   // Insère menu juste après le <div class="portfolio-header">

  if(arrayOfCat.length === 0) {
    document.querySelector("menu").innerHTML = "";
    return;
  }
  else {
    arrayOfCat.forEach(category => { 
    const li = document.createElement("li"); 
    const button = document.createElement("button");
    button.textContent = category.name;
    button.setAttribute("data-id", category.id);
    button.classList.add('hoverBtn');
    li.appendChild(button); 
    menu.appendChild(li); 
  });
  }
}
function createGallery(works) {
  const gallery = document.querySelector(".gallery");
  if(works.length === 0) {
    gallery.innerHTML = '<p class="empty">"Aucune œuvre disponible"</p>';
  
  }
  else { 
     works.forEach(work => {
      
      const figure = document.createElement("figure");

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
async function init() {
  initAllWorks = await getWorks();
  createGallery(initAllWorks);
  allCategories = await getCategories();
  createMenu(allCategories);
  attachEventListeners();
  toggleActive();
  handleEditMode();
}
function attachEventListeners () {
  const buttonsArray = document.querySelectorAll("menu button");

  buttonsArray.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      currentCategory = idx;
      const categoryId = parseInt(btn.getAttribute("data-id"));
      filteredWorks = categoryId === 0 
        ? initAllWorks 
        : initAllWorks.filter(work => work.categoryId === categoryId);
      const gallery = document.querySelector(".gallery");
      gallery.innerHTML = "";

      toggleActive();
      createGallery(filteredWorks);
    })
  })
}
function toggleActive (str, arr) {
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
    banner.innerHTML = "<i class=\"fa-regular fa-pen-to-square\"></i><p>Mode édition</p>";
    document.body.prepend(banner);

    const button = document.createElement("button");
    button.classList.add("editButton");
    button.innerHTML = "<i class=\"fa-regular fa-pen-to-square\"></i><p id='button'>modifier</p>";

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
    el.remove();
    const elem = document.querySelector(".editButton");
    elem.remove();
  }
}

init();