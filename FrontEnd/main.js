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
  defaultLi.appendChild(defaultButton); //place button dans li ==> <li><button data-id..>Tous</button></li>
  menu.appendChild(defaultLi); // place li dans menu ==> <menu><li><button>Tous</button></li></menu>

  //On place <menu></menu> après le h2
  const h2 = document.querySelector("#portfolio h2");  // selection <h2> de la section#portfolio 
  h2.insertAdjacentElement("afterend", menu);   // Insère menu juste après le <h2> 

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

init();