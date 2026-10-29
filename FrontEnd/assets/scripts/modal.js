
document.addEventListener("DOMContentLoaded", () => {
    const editButton = document.querySelector("#edit-button");

    // Vérifier que le bouton Modifier existe.
    if (!editButton) return;

    // Éviter de créer plusieurs modales.
    if (document.querySelector("#modal")) return;

    let works = [];

    // Création de la modale.
    const modal = document.createElement("aside");
    modal.id = "modal";
    modal.className = "modal-overlay";
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
        <div
            class="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <button
                type="button"
                class="modal-close"
                aria-label="Fermer la fenêtre"
            >&times;</button>

            <button
                type="button"
                class="modal-back"
                aria-label="Retour à la galerie"
                hidden
            >&#8592;</button>

            <h2 id="modal-title">Galerie photo</h2>

            <div id="modal-gallery" class="modal-gallery"></div>

            <div class="modal-separator"></div>

            <button
                type="button"
                id="add-photo-button"
                class="modal-primary"
            >Ajouter une photo</button>

            <p id="modal-message" role="alert"></p>

            <form id="add-photo-form" hidden>
                <div class="photo-preview">
                    <i
                        class="fa-regular fa-image"
                        id="photo-placeholder-icon"
                    ></i>

                    <img
                        id="photo-preview-image"
                        alt="Aperçu de la photo"
                        hidden
                    >

                    <label
                        for="photo-file"
                        class="photo-file-label"
                        id="photo-file-label"
                    >+ Ajouter photo</label>

                    <input
                        type="file"
                        id="photo-file"
                        name="image"
                        accept="image/jpeg,image/png"
                        required
                    >

                    <p id="photo-file-help">
                        jpg, png : 4 Mo maximum
                    </p>
                </div>

                <label for="photo-title">Titre</label>
                <input
                    type="text"
                    id="photo-title"
                    name="title"
                    required
                >

                <label for="photo-category">Catégorie</label>
                <select
                    id="photo-category"
                    name="category"
                    required
                >
                    <option value="">Choisir une catégorie</option>
                </select>

                <div class="modal-separator"></div>

                <button
                    type="submit"
                    id="validate-photo-button"
                    class="modal-primary"
                    disabled
                >Valider</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Récupération des éléments HTML.
    const closeButton = modal.querySelector(".modal-close");
    const backButton = modal.querySelector(".modal-back");
    const title = modal.querySelector("#modal-title");
    const modalGallery = modal.querySelector("#modal-gallery");
    const addButton = modal.querySelector("#add-photo-button");
    const form = modal.querySelector("#add-photo-form");
    const message = modal.querySelector("#modal-message");

    const photoFile = modal.querySelector("#photo-file");
    const photoTitle = modal.querySelector("#photo-title");
    const photoCategory = modal.querySelector("#photo-category");
    const previewImage = modal.querySelector("#photo-preview-image");
    const placeholderIcon = modal.querySelector("#photo-placeholder-icon");
    const photoFileLabel = modal.querySelector("#photo-file-label");
    const photoFileHelp = modal.querySelector("#photo-file-help");
    const validateButton = modal.querySelector("#validate-photo-button");

    let previousFocus = null;
    let previewUrl = null;

    // Afficher un message à l'utilisateur dans la modale.
    function showMessage(text) {
        message.textContent = text;
    }

    // Récupérer le jeton de connexion.
    function getToken() {
        return localStorage.getItem("token");
    }

    // Gérer l'aperçu de la photo.
    function togglePhotoPreview(showPreview) {
        previewImage.hidden = !showPreview;
        placeholderIcon.hidden = showPreview;
        photoFileLabel.hidden = showPreview;
        photoFileHelp.hidden = showPreview;
    }

    // Libérer l'URL temporaire de l'image.
    function clearPreview() {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            previewUrl = null;
        }

        previewImage.removeAttribute("src");
        togglePhotoPreview(false);
    }

    // Réinitialiser le formulaire d'ajout.
    function resetPhotoForm() {
        form.reset();
        clearPreview();
        validateButton.disabled = true;
    }

    // Afficher la galerie dans la modale.
    function showGallery() {
        title.textContent = "Galerie photo";
        modalGallery.hidden = false;
        form.hidden = true;
        addButton.hidden = false;
        backButton.hidden = true;
        showMessage("");
    }

    // Afficher le formulaire d'ajout.
    function showForm() {
        resetPhotoForm();

        title.textContent = "Ajout photo";
        modalGallery.hidden = true;
        form.hidden = false;
        addButton.hidden = true;
        backButton.hidden = false;
        showMessage("");

        photoTitle.focus();
    }

    // Ouvrir la modale.
    function openModal() {
        if (!getToken()) {
            alert("Veuillez vous connecter pour gérer les projets.");
            return;
        }

        previousFocus = document.activeElement;

        showGallery();

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");

        closeButton.focus();

        loadWorks();
        loadCategories();
    }

    // Fermer la modale.
    function closeModal() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");

        if (previousFocus) {
            previousFocus.focus();
        }
    }

    // Charger les projets depuis l'API.
    async function loadWorks() {
        try {
            const response = await fetch(
                "http://localhost:5678/api/works"
            );

            if (!response.ok) {
                throw new Error("Impossible de charger les projets.");
            }

            works = await response.json();
            renderGallery();
        } catch (error) {
            showMessage(error.message);
        }
    }

    // Afficher les projets dans la modale.
    function renderGallery() {
        modalGallery.replaceChildren();

        works.forEach((work) => {
            const figure = document.createElement("figure");
            figure.className = "modal-work";

            const image = document.createElement("img");
            image.src = work.imageUrl;
            image.alt = work.title;

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "delete-work";
            deleteButton.setAttribute(
                "aria-label",
                `Supprimer ${work.title}`
            );
            deleteButton.innerHTML =
                '<i class="fa-solid fa-trash-can"></i>';

            deleteButton.addEventListener("click", () => {
                deleteWork(work.id, deleteButton);
            });

            const editLabel = document.createElement("span");
            editLabel.textContent = "éditer";

            figure.append(image, deleteButton, editLabel);
            modalGallery.appendChild(figure);
        });
    }

    // Charger les catégories depuis l'API.
    async function loadCategories() {
        try {
            const response = await fetch(
                "http://localhost:5678/api/categories"
            );

            if (!response.ok) {
                throw new Error("Impossible de charger les catégories.");
            }

            const categories = await response.json();

            photoCategory.replaceChildren();

            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Choisir une catégorie";
            photoCategory.appendChild(defaultOption);

            categories.forEach((category) => {
                const option = document.createElement("option");
                option.value = category.id;
                option.textContent = category.name;
                photoCategory.appendChild(option);
            });
        } catch (error) {
            showMessage(error.message);
        }
    }

    // Supprimer un projet.
    async function deleteWork(workId, button) {
        const token = getToken();

        if (!token) {
            showMessage("Vous devez être connecté.");
            return;
        }

        button.disabled = true;

        try {
            const response = await fetch(
                `http://localhost:5678/api/works/${workId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("La suppression du projet a échoué.");
            }

            works = works.filter((work) => work.id !== workId);

            renderGallery();

            // Actualiser la galerie principale.
            document.dispatchEvent(
                new CustomEvent("works:updated")
            );

            showMessage("");
        } catch (error) {
            showMessage(error.message);
            button.disabled = false;
        }
    }

    // Prévisualiser la photo sélectionnée.
    photoFile.addEventListener("change", () => {
        const file = photoFile.files[0];

        clearPreview();
        validateButton.disabled = true;
        showMessage("");

        if (!file) {
            return;
        }

        // Vérifier le format.
        if (!["image/jpeg", "image/png"].includes(file.type)) {
            showMessage("Choisissez une image JPG ou PNG.");
            photoFile.value = "";
            return;
        }

        // Vérifier la taille : maximum 4 Mo.
        if (file.size > 4 * 1024 * 1024) {
            showMessage("L'image ne doit pas dépasser 4 Mo.");
            photoFile.value = "";
            return;
        }

        // Créer et afficher l'aperçu.
        previewUrl = URL.createObjectURL(file);
        previewImage.src = previewUrl;

        // Masquer l'icône, le bouton et le texte d'aide.
        togglePhotoPreview(true);

        validateButton.disabled = false;
    });

    // Ajouter un projet à l'aide de l'API.
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        showMessage("");

        const file = photoFile.files[0];
        const token = getToken();

        if (!token) {
            showMessage("Vous devez être connecté.");
            return;
        }

        if (
            !file ||
            !photoTitle.value.trim() ||
            !photoCategory.value
        ) {
            showMessage("Veuillez remplir tous les champs.");
            return;
        }

        if (!["image/jpeg", "image/png"].includes(file.type)) {
            showMessage("Choisissez une image JPG ou PNG.");
            return;
        }

        if (file.size > 4 * 1024 * 1024) {
            showMessage("L'image ne doit pas dépasser 4 Mo.");
            return;
        }

        const formData = new FormData();
        formData.append("image", file);
        formData.append("title", photoTitle.value.trim());
        formData.append("category", photoCategory.value);

        validateButton.disabled = true;

        try {
            const response = await fetch(
                "http://localhost:5678/api/works",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                throw new Error(
                    errorData.message || "L'ajout du projet a échoué."
                );
            }

            // Réinitialiser l'aperçu et le formulaire.
            resetPhotoForm();

            // Recharger les projets.
            await loadWorks();

            // Actualiser la galerie principale.
            document.dispatchEvent(
                new CustomEvent("works:updated")
            );

            // Retourner à la galerie.
            showGallery();
        } catch (error) {
            showMessage(error.message);
        } finally {
            validateButton.disabled = false;
        }
    });

    // Ouvrir et fermer la modale.
    editButton.addEventListener("click", openModal);
    closeButton.addEventListener("click", closeModal);

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            modal.classList.contains("is-open")
        ) {
            closeModal();
        }
    });

    // Navigation entre galerie et formulaire.
    addButton.addEventListener("click", showForm);

    backButton.addEventListener("click", showGallery);
});