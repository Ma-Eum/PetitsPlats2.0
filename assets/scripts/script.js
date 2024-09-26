document.addEventListener('DOMContentLoaded', function() {
        const recipesContainer = document.querySelector('.recipes');

        // Fonction pour générer une carte de recette HTML à partir d'un objet recette
        function generateRecipeCard(recipe) {
            // Si le titre ou l'image ne sont pas définis, nous affichons un texte/image par défaut
            const title = recipe.name || 'Titre de la recette non disponible';
            const image = recipe.image || 'assets/data/Images/recette-defaut.png'; // Image par défaut si aucune image n'est fournie

            return `
                <div class="recipe-card">
                    <div class="recipe-image">
                        <img src="assets/data/Images/${image}" alt="${title}">
                        <p>${recipe.time || 'Temps non disponible'}</p>
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

        // Appeler la fonction pour afficher les recettes
        displayRecipes(recipes);
    });