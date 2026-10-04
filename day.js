const params = new URLSearchParams(window.location.search);
const day = params.get("day");

const heading = document.getElementById("day-heading");
const mealInput = document.getElementById("meal-input");
const linkInput = document.getElementById("link-input");
const getRecipe = document.getElementById("get-details");
const recipeResultDiv = document.getElementById("recipeResult");


// --------------------------------------------------
// DAY HEADING
// --------------------------------------------------

if (day) {
  const dayCapitalized =
    day.charAt(0).toUpperCase() + day.slice(1);

  heading.textContent = dayCapitalized;
}


// --------------------------------------------------
// MEAL STORAGE
// --------------------------------------------------

let meals = {};

const savedMeals = localStorage.getItem("meals");

if (savedMeals) {
  try {
    meals = JSON.parse(savedMeals);
  } catch (error) {
    console.error("Could not load saved meals:", error);
    meals = {};
  }
}


// Load saved meal for this day
if (day) {
  mealInput.value = meals[day] || "";
}


// Save meal whenever it changes
mealInput.addEventListener("input", () => {

  if (!day) return;

  meals[day] = mealInput.value;

  localStorage.setItem(
    "meals",
    JSON.stringify(meals)
  );
});


// --------------------------------------------------
// SERVICE WORKER
// --------------------------------------------------

if ("serviceWorker" in navigator) {

  window.addEventListener("load", () => {

    navigator.serviceWorker
      .register("sw.js")
      .then(() => {
        console.log("Service Worker registered");
      })
      .catch(error => {
        console.log(
          "Service Worker registration failed:",
          error
        );
      });

  });

}


// --------------------------------------------------
// RECIPE LINK STORAGE
// --------------------------------------------------

let recipeLinks = {};

const savedLinks = localStorage.getItem("recipeLinks");

if (savedLinks) {

  try {
    recipeLinks = JSON.parse(savedLinks);
  } catch (error) {
    console.error(
      "Could not load saved recipe links:",
      error
    );

    recipeLinks = {};
  }

}


// Load saved recipe link
if (day) {
  linkInput.value = recipeLinks[day] || "";
}


// Save recipe link whenever it changes
linkInput.addEventListener("input", () => {

  if (!day) return;

  recipeLinks[day] = linkInput.value;

  localStorage.setItem(
    "recipeLinks",
    JSON.stringify(recipeLinks)
  );

});


// --------------------------------------------------
// FETCH RECIPE
// --------------------------------------------------

getRecipe.addEventListener("click", async () => {

  const url = linkInput.value.trim();


  // Make sure a URL was entered
  if (!url) {

    recipeResultDiv.innerHTML = `
      <p>Please paste a recipe link first.</p>
    `;

    return;
  }


  // Show loading message
  recipeResultDiv.innerHTML = `
    <p>Fetching recipe...</p>
  `;


  // Your Render backend
  const serverUrl =
    "https://dinnerplanner-server.onrender.com/api/recipe?url=" +
    encodeURIComponent(url);


  try {

    console.log("Fetching recipe:", url);


    // Request recipe from backend
    const response = await fetch(serverUrl);


    // Try to read JSON response
    let recipeData;

    try {

      recipeData = await response.json();

    } catch (error) {

      throw new Error(
        "The recipe server returned an invalid response."
      );

    }


    // Check for server errors
    if (!response.ok) {

      throw new Error(
        recipeData.error ||
        `Recipe server returned error ${response.status}`
      );

    }


    // Make sure recipe data exists
    if (!recipeData) {

      throw new Error(
        "No recipe data was returned."
      );

    }


    // --------------------------------------------------
    // INGREDIENTS
    // --------------------------------------------------

    const ingredients =
      Array.isArray(recipeData.recipeIngredient)
        ? recipeData.recipeIngredient
        : [];


    // --------------------------------------------------
    // INSTRUCTIONS
    // --------------------------------------------------

    const instructions =
      Array.isArray(recipeData.recipeInstructions)
        ? recipeData.recipeInstructions
        : [];


    // Make sure we actually received something
    if (
      ingredients.length === 0 &&
      instructions.length === 0
    ) {

      throw new Error(
        "The recipe was found, but no ingredients or instructions were returned."
      );

    }


    // --------------------------------------------------
    // CREATE INGREDIENT HTML
    // --------------------------------------------------

    const ingredientsHTML = ingredients
      .map(item => {

        // Convert anything unexpected to text
        const text =
          typeof item === "string"
            ? item
            : String(item);

        return `<li>${escapeHTML(text)}</li>`;

      })
      .join("");


    // --------------------------------------------------
    // CREATE INSTRUCTIONS HTML
    // --------------------------------------------------

    const instructionsHTML = instructions
      .map(item => {

        const text =
          typeof item === "string"
            ? item
            : String(item);

        return `<li>${escapeHTML(text)}</li>`;

      })
      .join("");


    // --------------------------------------------------
    // DISPLAY RECIPE
    // --------------------------------------------------

    recipeResultDiv.innerHTML = `

      ${
        recipeData.name
          ? `<h2>${escapeHTML(recipeData.name)}</h2>`
          : ""
      }

      ${
        ingredients.length > 0
          ? `
            <h3>Ingredients</h3>

            <ul>
              ${ingredientsHTML}
            </ul>
          `
          : ""
      }

      ${
        instructions.length > 0
          ? `
            <h3>Instructions</h3>

            <ol>
              ${instructionsHTML}
            </ol>
          `
          : ""
      }

    `;


    console.log(
      "Recipe successfully loaded:",
      recipeData
    );


  } catch (error) {

    console.error(
      "Recipe fetch failed:",
      error
    );


    // Display useful error to user
    recipeResultDiv.innerHTML = `
      <p>
        Couldn't fetch this recipe.
      </p>

      <p>
        ${escapeHTML(error.message)}
      </p>
    `;

  }

});


// --------------------------------------------------
// HTML ESCAPING
// --------------------------------------------------
// Prevents recipe text containing HTML from
// accidentally becoming HTML in your page.

function escapeHTML(value) {

  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}