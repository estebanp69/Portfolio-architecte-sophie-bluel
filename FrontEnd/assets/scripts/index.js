const gallery = document.querySelector(".gallery");
const filtersContainer = document.querySelector("#filters");
const loginLink = document.querySelector("#login-link");
const editBanner = document.querySelector("#edit-banner");
const editButton = document.querySelector("#edit-button");

let allWorks = [];

// Vérifier si un token est enregistré
function isLoggedIn() {
    return Boolean(localStorage.getItem("token"));
}

// Adapter l'affichage selon l'état de connexion
function updatePageForAuthentication() {
    const connected = isLoggedIn();

    editBanner.style.display = connected ? "flex" : "none";
    editButton.style.display = connected ? "inline-flex" : "none";
    filtersContainer.style.display = connected ? "none" : "flex";

    if (connected) {
        loginLink.textContent = "logout";
        loginLink.href = "#";
        loginLink.removeAttribute("aria-current");
    } else {
        loginLink.textContent = "login";
        loginLink.href = "./login.html";
    }
}

// Gérer la connexion et la déconnexion
loginLink.addEventListener("click", (event) => {
    if (isLoggedIn()) {
        event.preventDefault();

        localStorage.removeItem("token");

        updatePageForAuthentication();
        displayFiltersAfterLogout();
    }
});

// Charger les projets depuis l'API
async function getWorks() {
    try {
        const response = await fetch(
            "http://localhost:5678/api/works"
        );

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        allWorks = await response.json();

        displayWorks(allWorks);

        if (!isLoggedIn()) {
            await getCategories();
        }
    } catch (error) {
        console.error(
            "Erreur lors du chargement des projets :",
            error
        );
    }
}

// Afficher les projets
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

// Récupérer les catégories
async function getCategories() {
    try {
        const response = await fetch(
            "http://localhost:5678/api/categories"
        );

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const categories = await response.json();

        // Ne pas créer de filtres en mode édition
        if (!isLoggedIn()) {
            displayFilters(categories);
        }
    } catch (error) {
        console.error(
            "Erreur lors du chargement des catégories :",
            error
        );
    }
}

// Créer les boutons de filtrage
function displayFilters(categories) {
    filtersContainer.innerHTML = "";

    const allButton = document.createElement("button");
    allButton.textContent = "Tous";
    allButton.classList.add("filter-button", "active");
    allButton.setAttribute("aria-pressed", "true");

    allButton.addEventListener("click", () => {
        displayWorks(allWorks);
        setActiveFilter(allButton);
    });

    filtersContainer.appendChild(allButton);

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

// Mettre à jour le filtre actif
function setActiveFilter(activeButton) {
    const buttons =
        filtersContainer.querySelectorAll(".filter-button");

    buttons.forEach((button) => {
        button.classList.remove("active");
        button.setAttribute("aria-pressed", "false");
    });

    activeButton.classList.add("active");
    activeButton.setAttribute("aria-pressed", "true");
}

// Réafficher les filtres après déconnexion
function displayFiltersAfterLogout() {
    filtersContainer.style.display = "flex";

    // Recréer les filtres seulement s'ils ont été vidés
    if (!filtersContainer.querySelector(".filter-button")) {
        getCategories();
    }

    // Réinitialiser la galerie avec tous les projets
    displayWorks(allWorks);
}

// Écouter les changements effectués depuis la modale
document.addEventListener("works:updated", () => {
    getWorks();
});

// Initialisation
updatePageForAuthentication();
getWorks();