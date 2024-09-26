document.addEventListener('DOMContentLoaded', function() {
        const recipesContainer = document.querySelector('.recipes');
        const searchInput = document.querySelector('.search-bar input'); // Sélectionner l'input de recherche
    

        // Fonction pour générer une carte de recette HTML à partir d'un objet recette
        function generateRecipeCard(recipe) {
            // Si le titre ou l'image ne sont pas définis, nous affichons un texte/image par défaut
            const title = recipe.name || 'Titre de la recette non disponible';
            const image = recipe.image || 'assets/data/Images/recette-defaut.png'; // Image par défaut si aucune image n'est fournie

            return `
                <div class="recipe-card">
                    <div class="recipe-image">
                        <img src="assets/data/Images/${image}" alt="${title}">
                        <p>${recipe.time || 'Temps non disponible'}min</p>
                    </div>
                    <div class="recipe-info">
                        <h2>${title}</h2> <!-- Le titre de la recette doit apparaître ici -->
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

        // Fonction pour afficher toutes les recettes
        function displayRecipes(recipes) {
            const recipesHTML = recipes.map(recipe => generateRecipeCard(recipe)).join('');
            recipesContainer.innerHTML = recipesHTML;
        }

    // Fonction pour filtrer les recettes en fonction de la recherche
    function filterRecipes(query) {
        const filteredRecipes = recipes.filter(recipe => {
            const titleMatch = recipe.name.toLowerCase().includes(query.toLowerCase());
            const descriptionMatch = recipe.description.toLowerCase().includes(query.toLowerCase());
            const ingredientMatch = recipe.ingredients.some(ingredient => 
                ingredient.ingredient.toLowerCase().includes(query.toLowerCase())
            );

            // On retourne vrai si l'une des conditions correspond à la recherche
            return titleMatch || descriptionMatch || ingredientMatch;
        });

        displayRecipes(filteredRecipes); // Afficher les recettes filtrées
    }

    // Ajouter un événement d'écoute sur l'input de recherche
    searchInput.addEventListener('input', function() {
        const query = searchInput.value; // Obtenir la valeur entrée par l'utilisateur
        filterRecipes(query); // Filtrer les recettes en fonction de la recherche
    });

    // Afficher toutes les recettes au chargement
    displayRecipes(recipes);
});