
const gallery = document.querySelector(".gallery");
const filtersContainer = document.querySelector("#filters");

let allWorks = [];

async function getWorks() {
    try {
        const response = await fetch("http://localhost:5678/api/works");

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        allWorks = await response.json();

        displayWorks(allWorks);
        getCategories();
    } catch (error) {
        console.error("Erreur lors du chargement des projets :", error);
    }
}

// Afficher les projets dans la galerie
function displayWorks(works) {
    gallery.innerHTML = "";

    works.forEach((work) => {
        const figure = document.createElement("figure");
        const image = document.createElement("img");
        const caption = document.createElement("figcaption");

        image.src = work.imageUrl;
        image.alt = work.title;
        caption.textContent = work.title;

        figure.appendChild(image);
        figure.appendChild(caption);
        gallery.appendChild(figure);
    });
}

// Récupérer les catégories depuis l'API
async function getCategories() {
    try {
        const response = await fetch("http://localhost:5678/api/categories");

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const categories = await response.json();

        displayFilters(categories);
    } catch (error) {
        console.error("Erreur lors du chargement des catégories :", error);
    }
}

// Créer les boutons de filtrage
function displayFilters(categories) {
    filtersContainer.innerHTML = "";

    // Bouton Tous : affiche tous les projets
    const allButton = document.createElement("button");
    allButton.textContent = "Tous";
    allButton.classList.add("filter-button", "active");
    allButton.setAttribute("aria-pressed", "true");

    allButton.addEventListener("click", () => {
        displayWorks(allWorks);
        setActiveFilter(allButton);
    });

    filtersContainer.appendChild(allButton);

    // Un bouton pour chaque catégorie de l'API
    categories.forEach((category) => {
        const button = document.createElement("button");

        button.textContent = category.name;
        button.classList.add("filter-button");
        button.setAttribute("aria-pressed", "false");

        button.addEventListener("click", () => {
            const filteredWorks = allWorks.filter(
                (work) => work.categoryId === category.id
            );

            displayWorks(filteredWorks);
            setActiveFilter(button);
        });

        filtersContainer.appendChild(button);
    });
}

// Mettre à jour le style du bouton sélectionné
function setActiveFilter(activeButton) {
    const buttons = filtersContainer.querySelectorAll(".filter-button");

    buttons.forEach((button) => {
        button.classList.remove("active");
        button.setAttribute("aria-pressed", "false");
    });

    activeButton.classList.add("active");
    activeButton.setAttribute("aria-pressed", "true");
}

// Chargement initial
getWorks();
