document.addEventListener('DOMContentLoaded', function () {
    const recipesContainer = document.querySelector('.recipes'); // Conteneur des recettes
    const searchInput = document.querySelector('.search-bar input'); // Sélectionner l'input de recherche dans la barre principale
    const clearIcon = document.querySelector('.search-bar .clear-icon'); // Sélectionner l'icône de suppression
    const activeFiltersContainer = document.querySelector('.active-filters'); // Conteneur des filtres actifs
    const recipeCountElement = document.querySelector('.count'); // Sélectionner l'élément qui affiche le nombre de recettes
    const ingredientsList = document.querySelector('.filter [for="toggleIngredients"] + .dropdown-menu ul'); // Liste des ingrédients
    const appareilsList = document.querySelector('.filter [for="toggleAppareils"] + .dropdown-menu ul'); // Liste des appareils
    const ustensilesList = document.querySelector('.filter [for="toggleUstensiles"] + .dropdown-menu ul'); // Liste des ustensiles
    let activeFilters = []; // Stocker les tags actifs
    let searchQuery = ''; // Stocker la requête de recherche

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

    // Fonction pour afficher les recettes filtrées avec une boucle forEach
    function displayRecipes(filteredRecipes) {
        recipesContainer.innerHTML = ''; // Effacer le contenu précédent
        let recipeCount = 0; // Compteur pour le nombre de recettes correspondantes

        // Utilisation de forEach pour parcourir chaque recette
        filteredRecipes.forEach(recipe => {
            recipesContainer.innerHTML += generateRecipeCard(recipe);
            recipeCount++; // Incrémenter le compteur
        });

        // Mettre à jour le nombre de recettes affichées
        recipeCountElement.textContent = recipeCount;
    }

    // Fonction de filtrage des recettes utilisant les boucles natives
    function filterRecipes() {
        // Tableau pour stocker les recettes filtrées
        const filteredRecipes = [];

        // Parcourir chaque recette
        recipes.forEach(recipe => {
            let titleMatch = true; // Correspondance du titre
            let descriptionMatch = true; // Correspondance de la description
            let ingredientMatch = false; // Correspondance d'un ingrédient
            let applianceMatch = true; // Correspondance de l'appareil
            let utensilMatch = false; // Correspondance d'un ustensile

            // Vérifier la recherche dans la barre principale
            const queryLower = searchQuery.toLowerCase();
            if (queryLower.length > 2) {
                if (!recipe.name.toLowerCase().includes(queryLower) &&
                    !recipe.description.toLowerCase().includes(queryLower) &&
                    !recipe.ingredients.some(ingredient => ingredient.ingredient.toLowerCase().includes(queryLower))) {
                    return; // Si aucune correspondance, ne pas inclure la recette
                }
            }

            // Vérifier chaque filtre actif
            activeFilters.forEach(filter => {
                const filterLower = filter.toLowerCase();

                // Vérifier si le filtre correspond au titre
                let titleFound = false;
                for (let j = 0; j <= recipe.name.length - filterLower.length; j++) {
                    let match = true;
                    for (let k = 0; k < filterLower.length; k++) {
                        if (recipe.name.toLowerCase()[j + k] !== filterLower[k]) {
                            match = false;
                            break;
                        }
                    }
                    if (match) {
                        titleFound = true;
                        break;
                    }
                }
                if (!titleFound) {
                    titleMatch = false;
                }

                // Vérifier si le filtre correspond à la description
                let descriptionFound = false;
                for (let j = 0; j <= recipe.description.length - filterLower.length; j++) {
                    let match = true;
                    for (let k = 0; k < filterLower.length; k++) {
                        if (recipe.description.toLowerCase()[j + k] !== filterLower[k]) {
                            match = false;
                            break;
                        }
                    }
                    if (match) {
                        descriptionFound = true;
                        break;
                    }
                }
                if (!descriptionFound) {
                    descriptionMatch = false;
                }

                // Vérifier si le filtre correspond à un ingrédient
                recipe.ingredients.forEach(ingredientObj => {
                    const ingredientLower = ingredientObj.ingredient.toLowerCase();
                    for (let l = 0; l <= ingredientLower.length - filterLower.length; l++) {
                        let match = true;
                        for (let m = 0; m < filterLower.length; m++) {
                            if (ingredientLower[l + m] !== filterLower[m]) {
                                match = false;
                                break;
                            }
                        }
                        if (match) {
                            ingredientMatch = true;
                            break;
                        }
                    }
                });

                // Vérifier si le filtre correspond à l'appareil
                if (recipe.appliance) {
                    let applianceFound = false;
                    const applianceLower = recipe.appliance.toLowerCase();
                    for (let j = 0; j <= applianceLower.length - filterLower.length; j++) {
                        let match = true;
                        for (let k = 0; k < filterLower.length; k++) {
                            if (applianceLower[j + k] !== filterLower[k]) {
                                match = false;
                                break;
                            }
                        }
                        if (match) {
                            applianceFound = true;
                            break;
                        }
                    }
                    if (!applianceFound) {
                        applianceMatch = false;
                    }
                }

                // Vérifier si le filtre correspond à un ustensile
                recipe.ustensils.forEach(utensil => {
                    const utensilLower = utensil.toLowerCase();
                    for (let l = 0; l <= utensilLower.length - filterLower.length; l++) {
                        let match = true;
                        for (let m = 0; m < filterLower.length; m++) {
                            if (utensilLower[l + m] !== filterLower[m]) {
                                match = false;
                                break;
                            }
                        }
                        if (match) {
                            utensilMatch = true;
                            break;
                        }
                    }
                });
            });

            // Ajouter la recette filtrée si elle correspond à tous les critères
            if ((titleMatch || descriptionMatch || ingredientMatch || applianceMatch || utensilMatch) || activeFilters.length === 0) {
                filteredRecipes.push(recipe);
            }
        });

        // Afficher les recettes filtrées
        displayRecipes(filteredRecipes);
        // Mettre à jour les dropdowns après le filtrage
        updateDropdowns(filteredRecipes);
    }

    // Fonction pour ajouter un filtre actif sous forme de tag
    function addActiveFilter(query) {
        if (!activeFilters.includes(query.toLowerCase())) {
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
    }

    // Fonction pour gérer la recherche dans la barre principale
    function handleSearch(inputElement) {
        inputElement.addEventListener('input', function () {
            searchQuery = inputElement.value.trim(); // Mettre à jour la requête de recherche
            clearIcon.style.display = searchQuery.length > 0 ? 'block' : 'none'; // Afficher ou masquer la croix
            filterRecipes(); // Filtrer les recettes avec la nouvelle recherche
        });

        // Ajouter un événement pour effacer le texte lors du clic sur la croix
        clearIcon.addEventListener('click', function () {
            searchQuery = ''; // Réinitialiser la requête de recherche
            inputElement.value = ''; // Effacer le champ de saisie
            clearIcon.style.display = 'none'; // Masquer la croix
            filterRecipes(); // Re-filtrer les recettes
        });
    }

    // Gérer la recherche avec la barre de recherche principale
    handleSearch(searchInput);

    // Afficher toutes les recettes et mettre à jour les listes déroulantes au chargement
    displayRecipes(recipes);
    updateDropdowns(recipes);
});
