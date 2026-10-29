const loginForm = document.querySelector("#login form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const errorMessage = document.querySelector("#login-error");

function checkdata(email, password) {
    let emailRegExp = new RegExp("[a-z0-9]+@[a-z]+\\.[a-z]+", "i");

    let passwordRegExp = new RegExp("^(?=.*[A-Z])(?=.*[0-9]).{6,}$");

    document.getElementById("passwordError").innerText = "";

    if (!emailRegExp.test(email)) {
        return false;
    }

    if (!passwordRegExp.test(password)) {
        document.getElementById("passwordError").innerText =
            "Le mot de passe doit contenir au moins 6 caractères, une majuscule et un chiffre.";
        return false;
    }

    return true;
}

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Réinitialiser le message d'erreur
    errorMessage.textContent = "";

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Faire la vérification de l'email et du password avant de faire la requête
    if (!checkdata(email, password)) {
        return
    }

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
            // errorMessage.textContent =
            //     data.message || "Erreur dans l’identifiant ou le mot de passe.";
            // return;
            throw new Error(data.message)
        }

        // Enregistrer le token pour les futures requêtes
        localStorage.setItem("token", data.token);

        // Rediriger vers la page d'accueil
        window.location.href = "./index.html";

    } catch (error) {
        console.error("Erreur lors de la connexion :", error);

        errorMessage.textContent = error.message
    }
});
