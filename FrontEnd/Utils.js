const Utils = {
  isFormValid(inputFile) {
    return (
      this.isImageInputValid(inputFile) &&
      this.isTitleInputValid() &&
      this.isCategorySelected()
    );
  },
  isImageInputValid(fileInput) {
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      return false;
    }

    const file = fileInput.files[0];

    // Vérifie le type du fichier (uniquement JPG / PNG)
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      alert("formats acceptés : jpg/png");
      return false;
    }

    // Vérifie la taille max (4 Mo)
    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("la taille du fichier ne doit pas dépasser 4Mo");
      return false;
    }
    return true; 
  },
  isTitleInputValid() { 
    const input = document.querySelector("#titleInput");
    return input.value.trim().length > 0;
  },
  isCategorySelected() {
    const select = document.querySelector("#categorie");
    const index = select.selectedIndex;
    return index > 0;
  },
  alert(str) {
    if(str === "fetchErrorPostWork") alert("probleme de sauvegarde");
    if(str === "fetchErrorDeleteWork") alert("probleme de suppression");
  }
};

export default Utils;
