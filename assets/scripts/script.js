document.addEventListener('DOMContentLoaded', function () {
    const recipesContainer = document.querySelector('.recipes');
    const searchInput = document.querySelector('.search-bar input'); // Sélectionner l'input de recherche dans la barre principale
    const recipeCountElement = document.querySelector('.count'); // Sélectionner l'élément qui affiche le nombre de recettes
    const clearIcon = document.querySelector('.search-bar .clear-icon'); // Sélectionner l'icône pour effacer
    const ingredientsList = document.querySelector('.filter [for="toggleIngredients"] + .dropdown-menu ul'); // Liste des ingrédients
    const appareilsList = document.querySelector('.filter [for="toggleAppareils"] + .dropdown-menu ul'); // Liste des appareils
    const ustensilesList = document.querySelector('.filter [for="toggleUstensiles"] + .dropdown-menu ul'); // Liste des ustensiles
    let activeFilters = []; // Stocker les tags actifs

    // Fonction pour extraire les ingrédients, appareils, et ustensiles uniques depuis recipes.js
    function extractUniqueItems(filteredRecipes) {
        const ingredientsSet = new Set();
        const appareilsSet = new Set();
        const ustensilesSet = new Set();

        filteredRecipes.forEach(recipe => {
            // Ajouter les ingrédients
            recipe.ingredients.forEach(ingredient => ingredientsSet.add(ingredient.ingredient));

            // Ajouter les appareils
            if (recipe.appliance) {
                appareilsSet.add(recipe.appliance);
            }

            // Ajouter les ustensiles
            if (recipe.ustensils) {
                recipe.ustensils.forEach(ustensil => ustensilesSet.add(ustensil));
            }
        });

        return {
            ingredients: Array.from(ingredientsSet),
            appareils: Array.from(appareilsSet),
            ustensiles: Array.from(ustensilesSet),
        };
    }

    // Fonction pour mettre à jour les dropdowns après le filtrage
    function updateDropdowns(filteredRecipes) {
        const { ingredients, appareils, ustensiles } = extractUniqueItems(filteredRecipes);

        // Injecter les ingrédients dans la liste déroulante des ingrédients
        ingredientsList.innerHTML = ingredients.map(ingredient => `<li class="dropdown-item" data-filter="${ingredient}">${ingredient}</li>`).join('');

        // Injecter les appareils dans la liste déroulante des appareils
        appareilsList.innerHTML = appareils.map(appareil => `<li class="dropdown-item" data-filter="${appareil}">${appareil}</li>`).join('');

        // Injecter les ustensiles dans la liste déroulante des ustensiles
        ustensilesList.innerHTML = ustensiles.map(ustensile => `<li class="dropdown-item" data-filter="${ustensile}">${ustensile}</li>`).join('');

        // Réattacher les événements de clic pour les nouveaux éléments
        addDropdownEvents();
    }

    // Fonction pour ajouter les événements de clic aux nouveaux items des dropdowns
    function addDropdownEvents() {
        // Ajouter les événements de clic pour les ingrédients
        ingredientsList.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function () {
                addActiveFilter(item.dataset.filter);
            });
        });

        // Ajouter les événements de clic pour les appareils
        appareilsList.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function () {
                addActiveFilter(item.dataset.filter);
            });
        });

        // Ajouter les événements de clic pour les ustensiles
        ustensilesList.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function () {
                addActiveFilter(item.dataset.filter);
            });
        });
    }

    // Fonction pour générer une carte de recette HTML à partir d'un objet recette
    function generateRecipeCard(recipe) {
        const title = recipe.name || 'Titre de la recette non disponible';
        const image = recipe.image || 'assets/data/Images/recette-defaut.png'; // Image par défaut si aucune image n'est fournie

        return `
            <div class="recipe-card">
                <div class="recipe-image">
                    <img src="assets/data/Images/${image}" alt="${title}">
                    <p>${recipe.time || '0'}min</p>
                </div>
                <div class="recipe-info">
                    <h2>${title}</h2>
                    <div class="recipe-details">
                        <div class="recipe-description">
                            <h3>Recette</h3>
                            <p>${recipe.description || 'Description non disponible'}</p>
                        </div>
                        <div class="recipe-ingredients">
                            <h3>Ingrédients</h3>
                            <div class="content-recipe-detail">
                                ${generateIngredientsList(recipe.ingredients || [])}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Fonction pour générer la liste des ingrédients avec quantité et unité
    function generateIngredientsList(ingredients) {
        return ingredients.map(ingredientObj => `
            <div class="recipe-ingredients-details">
                <h4>${ingredientObj.ingredient}</h4>
                <p>${ingredientObj.quantity || ''} ${ingredientObj.unit || ''}</p>
            </div>
        `).join('');
    }

    // Fonction pour afficher les recettes filtrées
    function displayRecipes(filteredRecipes) {
        const recipesHTML = filteredRecipes.map(recipe => generateRecipeCard(recipe)).join('');
        recipesContainer.innerHTML = recipesHTML;

        // Mettre à jour le nombre de recettes affichées
        recipeCountElement.textContent = filteredRecipes.length; // Affiche le nombre de recettes
    }

    // Fonction pour filtrer les recettes en fonction des filtres actifs
    function filterRecipes() {
        const query = searchInput.value.trim().toLowerCase();
        const filteredRecipes = recipes.filter(recipe => {
            const titleMatch = recipe.name.toLowerCase().includes(query);
            const descriptionMatch = recipe.description.toLowerCase().includes(query);
            const ingredientMatch = recipe.ingredients.some(ingredient =>
                ingredient.ingredient.toLowerCase().includes(query)
            );
            const applianceMatch = recipe.appliance?.toLowerCase().includes(query);
            const utensilMatch = recipe.ustensils?.some(utensil =>
                utensil.toLowerCase().includes(query)
            );

            return titleMatch || descriptionMatch || ingredientMatch || applianceMatch || utensilMatch;
        });

        displayRecipes(filteredRecipes);
        updateDropdowns(filteredRecipes); // Mettre à jour les dropdowns
    }

    // Afficher ou cacher la croix en fonction de la saisie utilisateur
    searchInput.addEventListener('input', function () {
        clearIcon.style.display = searchInput.value.length > 0 ? 'block' : 'none';
        filterRecipes(); // Filtrer les recettes en fonction du texte saisi
    });

    // Gestion de la touche "Entrée" pour s'assurer que la croix est bien visible
    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            clearIcon.style.display = searchInput.value.length > 0 ? 'block' : 'none';
        }
    });

    // Effacer le texte de l'input lorsqu'on clique sur la croix
    clearIcon.addEventListener('click', function () {
        searchInput.value = ''; // Vider l'input
        clearIcon.style.display = 'none'; // Cacher la croix
        filterRecipes(); // Mettre à jour les résultats après effacement
    });

    // Injecter les données des dropdowns
    updateDropdowns(recipes);

    // Afficher toutes les recettes au chargement
    displayRecipes(recipes);
});
