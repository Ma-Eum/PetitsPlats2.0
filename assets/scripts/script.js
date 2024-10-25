document.addEventListener('DOMContentLoaded', function () {
    const recipesContainer = document.querySelector('.recipes');
    const searchInput = document.querySelector('.search-bar input'); // Sélectionner l'input de recherche dans la barre principale
    const activeFiltersContainer = document.querySelector('.active-filters'); // Conteneur des filtres actifs
    const recipeCountElement = document.querySelector('.count'); // Sélectionner l'élément qui affiche le nombre de recettes
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
            // Ajouter les ingrédients (en les normalisant pour éviter les doublons)
            recipe.ingredients.forEach(ingredient => {
                const normalizedIngredient = ingredient.ingredient.trim().toLowerCase(); // Normaliser l'ingrédient
                ingredientsSet.add(normalizedIngredient);
            });
    
            // Ajouter les appareils
            if (recipe.appliance) {
                appareilsSet.add(recipe.appliance.trim().toLowerCase());
            }
    
            // Ajouter les ustensiles
            if (recipe.ustensils) {
                recipe.ustensils.forEach(ustensil => {
                    const normalizedUstensil = ustensil.trim().toLowerCase(); // Normaliser l'ustensile
                    ustensilesSet.add(normalizedUstensil);
                });
            }
        });

        return {
            ingredients: Array.from(ingredientsSet).sort(),
            appareils: Array.from(appareilsSet).sort(),
            ustensiles: Array.from(ustensilesSet).sort(),
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
        const filteredRecipes = recipes.filter(recipe => {
            return activeFilters.every(filter => {
                const titleMatch = recipe.name.toLowerCase().includes(filter.toLowerCase());
                const descriptionMatch = recipe.description.toLowerCase().includes(filter.toLowerCase());
                const ingredientMatch = recipe.ingredients.some(ingredient =>
                    ingredient.ingredient.toLowerCase().includes(filter.toLowerCase())
                );
                const applianceMatch = recipe.appliance?.toLowerCase().includes(filter.toLowerCase());
                const utensilMatch = recipe.ustensils?.some(utensil =>
                    utensil.toLowerCase().includes(filter.toLowerCase())
                );

                return titleMatch || descriptionMatch || ingredientMatch || applianceMatch || utensilMatch;
            });
        });

        displayRecipes(filteredRecipes);
        updateDropdowns(filteredRecipes); // Mettre à jour les dropdowns
    }

    // Fonction pour ajouter un filtre actif sous forme de tag
    function addActiveFilter(query) {
        if (activeFilters.includes(query.toLowerCase())) {
            return; // Ne pas ajouter le filtre s'il est déjà actif
        }

        activeFilters.push(query.toLowerCase()); // Ajouter le filtre aux filtres actifs

        // Créer un nouvel élément div pour le filtre actif
        const filterTag = document.createElement('div');
        filterTag.classList.add('filter-tag');
        // Utilisation de l'icône FontAwesome pour la croix de suppression
        filterTag.innerHTML = `${query} <i class="fa-solid fa-xmark remove-filter clear-icon"></i>`;

        // Ajouter l'événement de suppression du filtre
        filterTag.querySelector('.remove-filter').addEventListener('click', function () {
            filterTag.remove(); // Supprimer le tag
            activeFilters = activeFilters.filter(f => f !== query.toLowerCase()); // Retirer le filtre de la liste
            filterRecipes(); // Re-filtrer les recettes avec les filtres restants
        });

        // Ajouter le tag au conteneur
        activeFiltersContainer.appendChild(filterTag);

        // Filtrer les recettes avec les nouveaux filtres actifs
        filterRecipes();
    }

    // Fonction pour gérer la recherche dans la barre principale
    function handleMainSearch() {
        const query = searchInput.value.trim().toLowerCase();

        // Filtrer les recettes en fonction de la barre principale uniquement
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

    // Écouteur d'événements pour la recherche dans la barre principale
    searchInput.addEventListener('input', handleMainSearch);

    // Gestion des icônes (loupe et croix) pour chaque input de recherche dans les dropdowns
    const searchInputs = document.querySelectorAll('.dropdown-menu .form-control'); // Sélectionner tous les inputs dans les dropdowns

    searchInputs.forEach(input => {
        const inputWrapper = input.parentElement;
        const clearIcon = inputWrapper.querySelector('.clear-icon'); // La croix

        // Afficher ou cacher la croix en fonction de la saisie utilisateur
        input.addEventListener('input', function () {
            clearIcon.style.display = input.value.length > 0 ? 'block' : 'none'; // Afficher la croix quand il y a du texte
        });

        // Effacer le texte de l'input lorsqu'on clique sur la croix
        clearIcon.addEventListener('click', function () {
            input.value = ''; // Vider l'input
            clearIcon.style.display = 'none'; // Cacher la croix
            input.dispatchEvent(new Event('input')); // Déclencher un événement 'input' pour mettre à jour les résultats
        });
    });

    // Afficher toutes les recettes au chargement
    displayRecipes(recipes);
    updateDropdowns(recipes);

    // Ajouter la gestion de la croix pour l'input principal de recherche
    const mainClearIcon = document.querySelector('.search-bar .clear-icon');
    
    // Afficher ou cacher la croix en fonction de la saisie utilisateur dans la barre de recherche principale
    searchInput.addEventListener('input', function () {
        mainClearIcon.style.display = searchInput.value.length > 0 ? 'block' : 'none';
    });

    // Effacer le texte de l'input principal lorsqu'on clique sur la croix
    mainClearIcon.addEventListener('click', function () {
        searchInput.value = '';
        mainClearIcon.style.display = 'none';
        handleMainSearch(); // Réinitialiser les résultats de la recherche principale
    });
});
