const params = new URLSearchParams(window.location.search);
const day = params.get("day");

const heading = document.getElementById("day-heading");
const mealInput = document.getElementById("meal-input");
const linkInput = document.getElementById("link-input");
const getRecipe = document.getElementById("get-details");

const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1);
heading.textContent = dayCapitalized;

let meals = {};

const saved = localStorage.getItem("meals");
if (saved) {
  meals = JSON.parse(saved);
}

mealInput.value = meals[day] || "";

mealInput.addEventListener("input", () => {
  meals[day] = mealInput.value;
  localStorage.setItem("meals", JSON.stringify(meals));
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('Service Worker registered'))
      .catch(() => console.log('Service Worker registration failed'));
  });
}

let recipeLinks = {};

const savedLink = localStorage.getItem("recipeLinks");
if (savedLink) {
  recipeLinks = JSON.parse(savedLink);
}

linkInput.value = recipeLinks[day] || "";

linkInput.addEventListener("input", () => {
  recipeLinks[day] = linkInput.value;
  localStorage.setItem("recipeLinks", JSON.stringify(recipeLinks));
})

let recipeFetch = {};

getRecipe.addEventListener("click", () => {
  const serverUrl = "https://dinnerplanner-server.onrender.com/api/recipe?url=" + encodeURIComponent(linkInput.value);

  fetch(serverUrl)
    .then(response => response.json())
    .then(recipeData => {
      const recipeResultDiv = document.getElementById("recipeResult");
      const ingredientsHTML = recipeData.recipeIngredient.map(item => `<li>${item}</li>`).join("");
      const instructionsHTML = recipeData.recipeInstructions.map(item => `<li>${item.text}</li>`).join("");
      recipeResultDiv.innerHTML = `
        <h3>Ingredients</h3>
        <ul>${ingredientsHTML}</ul>
        <h3>Instructions</h3>
        <ol>${instructionsHTML}</ol>
      `;
      if (!recipeData) {
        recipeResultDiv.innerHTML = `<p>Sorry, we couldn't find a recipe at this link.</p>`;
        return;
      }
    })
    .catch(error => {
      console.error("Fetch failed:", error);
      document.getElementById("recipeResult").innerHTML = `<p>Something went wrong fetching that recipe. Please try again.</p>`;
    });
});