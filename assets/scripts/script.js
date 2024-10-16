document.addEventListener('DOMContentLoaded', function () {
    const recipesContainer = document.querySelector('.recipes'); // Conteneur des recettes
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
            const titleMatch = activeFilters.every(filter => recipe.name.toLowerCase().includes(filter.toLowerCase()));
            const descriptionMatch = activeFilters.every(filter => recipe.description.toLowerCase().includes(filter.toLowerCase()));
            const ingredientMatch = recipe.ingredients.some(ingredient =>
                activeFilters.every(filter => ingredient.ingredient.toLowerCase().includes(filter.toLowerCase()))
            );
            const applianceMatch = activeFilters.every(filter => recipe.appliance?.toLowerCase().includes(filter.toLowerCase()));
            const utensilMatch = recipe.ustensils?.some(ustensil =>
                activeFilters.every(filter => ustensil.toLowerCase().includes(filter.toLowerCase()))
            );

            // Si la recette correspond à tous les critères
            if (titleMatch || descriptionMatch || ingredientMatch || applianceMatch || utensilMatch || activeFilters.length === 0) {
                recipesContainer.innerHTML += generateRecipeCard(recipe);
                recipeCount++; // Incrémenter le compteur
            }
        });

        // Mettre à jour le nombre de recettes affichées
        recipeCountElement.textContent = recipeCount;
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
                displayRecipes(recipes);// Re-filtrer les recettes avec les filtres restants
            });

            // Ajouter le tag au conteneur
            activeFiltersContainer.appendChild(filterTag);

            // Filtrer les recettes avec les nouveaux filtres actifs
            displayRecipes(recipes);
        }
    }

    // Fonction pour gérer la recherche via touche "Entrée" ou clic sur la loupe
    function handleSearch(inputElement) {
        const inputWrapper = inputElement.parentElement;
        const clearIcon = inputWrapper.querySelector('.clear-icon');

        // Gestion de l'Entrée
        inputElement.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Empêcher le comportement par défaut

                const query = inputElement.value.trim();
                if (query) {
                    addActiveFilter(query);
                    inputElement.value = ''; // Vider le champ de recherche
                    clearIcon.style.display = 'none'; // Cacher la croix
                }
            }
        });

        // Gestion du clic sur l'icône de recherche
        const searchIcon = inputElement.parentElement.querySelector('.search-icon');
        if (searchIcon) {
            searchIcon.addEventListener('click', function () {
                const query = inputElement.value.trim();
                if (query) {
                    addActiveFilter(query);
                    inputElement.value = ''; // Vider le champ de recherche
                    clearIcon.style.display = 'none'; // Cacher la croix
                }
            });
        }
    }

    // Gestion des icônes (loupe et croix) pour chaque input de recherche dans les dropdowns
    const searchInputs = document.querySelectorAll('.dropdown-menu .form-control'); // Sélectionner tous les inputs dans les dropdowns

    searchInputs.forEach(input => {
        const inputWrapper = input.parentElement;
        const clearIcon = inputWrapper.querySelector('.clear-icon');
        // Afficher ou cacher la croix en fonction de la saisie utilisateur
        input.addEventListener('input', function () {
            if (input.value.length > 0) {
                clearIcon.style.display = 'block'; // Afficher la croix quand il y a du texte
            } else {
                clearIcon.style.display = 'none'; // Cacher la croix quand le champ est vide
            }
        });

        // Effacer le texte de l'input lorsqu'on clique sur la croix
        clearIcon.addEventListener('click', function () {
            input.value = ''; // Vider l'input
            clearIcon.style.display = 'none'; // Cacher la croix
            input.dispatchEvent(new Event('input')); // Déclencher un événement 'input' pour mettre à jour les résultats
        });

        // Gérer la recherche avec l'icône et la touche Entrée
        handleSearch(input);
    });

    // Gérer la recherche avec la barre de recherche principale
    handleSearch(searchInput);

    // Injecter les données des dropdowns
    updateDropdowns(recipes);

    // Afficher toutes les recettes au chargement
    displayRecipes(recipes);
});
