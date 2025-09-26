async function getWorks() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    const works = await response.json();

    const gallery = document.querySelector(".gallery");

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

  } catch (error) {
    console.error("Erreur :", error);
  }
}

getWorks();
