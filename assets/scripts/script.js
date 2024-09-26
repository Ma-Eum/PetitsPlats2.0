document.addEventListener('DOMContentLoaded', function() {
    const recipesContainer = document.querySelector('.recipes');
    const searchInput = document.querySelector('.search-bar input'); // Sélectionner l'input de recherche
    const activeFiltersContainer = document.querySelector('.active-filters'); // Conteneur des filtres actifs
    let activeFilters = []; // Stocker les tags actifs

    // Fonction pour générer une carte de recette HTML à partir d'un objet recette
    function generateRecipeCard(recipe) {
        const title = recipe.name || 'Titre de la recette non disponible';
        const image = recipe.image || 'assets/data/Images/recette-defaut.png'; // Image par défaut si aucune image n'est fournie

        return `
            <div class="recipe-card">
                <div class="recipe-image">
                    <img src="assets/data/Images/${image}" alt="${title}">
                    <p>${recipe.time || 'Temps non disponible'} min</p>
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
    function displayRecipes(recipes) {
        const recipesHTML = recipes.map(recipe => generateRecipeCard(recipe)).join('');
        recipesContainer.innerHTML = recipesHTML;
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
                return titleMatch || descriptionMatch || ingredientMatch;
            });
        });

        displayRecipes(filteredRecipes);
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
        filterTag.innerHTML = `${query} <span class="remove-filter">&times;</span>`;

        // Ajouter l'événement de suppression du filtre
        filterTag.querySelector('.remove-filter').addEventListener('click', function() {
            filterTag.remove(); // Supprimer le tag
            activeFilters = activeFilters.filter(f => f !== query.toLowerCase()); // Retirer le filtre de la liste
            filterRecipes(); // Re-filtrer les recettes avec les filtres restants
        });

        // Ajouter le tag au conteneur
        activeFiltersContainer.appendChild(filterTag);

        // Filtrer les recettes avec les nouveaux filtres actifs
        filterRecipes();
    }

    // Ajouter un événement d'écoute pour soumettre une recherche quand on appuie sur "Entrée"
    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Empêcher le comportement par défaut (soumission de formulaire)

            const query = searchInput.value.trim(); // Obtenir la valeur entrée par l'utilisateur
            if (query) {
                addActiveFilter(query); // Ajouter un tag de filtre actif
                searchInput.value = ''; // Vider le champ de recherche
            }
        }
    });

    // Afficher toutes les recettes au chargement
    displayRecipes(recipes);
});
