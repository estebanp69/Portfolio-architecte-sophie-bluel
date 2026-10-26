const loginForm = document.querySelector("#login form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const errorMessage = document.querySelector("#login-error");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Réinitialiser le message d'erreur
    errorMessage.textContent = "";

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {
        // Envoyer les identifiants à l'API
        const response = await fetch(
            "http://localhost:5678/api/users/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        // Identifiants incorrects ou autre erreur HTTP
        if (!response.ok) {
            errorMessage.textContent =
                data.message || "Erreur dans l’identifiant ou le mot de passe.";
            return;
        }

        // Vérifier la présence du token renvoyé par l'API
        if (!data.token) {
            errorMessage.textContent =
                "La connexion a échoué : aucun token reçu.";
            return;
        }

        // Enregistrer le token pour les futures requêtes
        localStorage.setItem("token", data.token);

        // Rediriger vers la page d'accueil
        window.location.href = "./index.html";

    } catch (error) {
        console.error("Erreur lors de la connexion :", error);

        errorMessage.textContent =
            "Impossible de contacter le serveur. Vérifiez que l’API est démarrée.";
    }
});
