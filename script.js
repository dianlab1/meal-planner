const inputs = document.querySelectorAll('.day-input');
const clear = document.querySelector('#clear-btn');

let meals = {};

const saved = localStorage.getItem("meals");
if (saved) {
    meals = JSON.parse(saved);
}

inputs.forEach(input => {
    const day = input.dataset.day;
    if (meals[day]) {
        input.value = meals[day];
    }
});

inputs.forEach((input) => {
  input.addEventListener("input", () => {
    const day = input.dataset.day;
    meals[day] = input.value;
    localStorage.setItem("meals", JSON.stringify(meals));
  });
});

document.querySelectorAll('.day-row').forEach(row => {
    row.addEventListener('click', (event) => {
        if (event.target.classList.contains('day-input')) {
            return;
        }

        const input = row.querySelector('.day-input');
        const day = input.dataset.day;
        window.location.href = `day.html?day=${day}`;
    });
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('Service Worker registered'))
      .catch(() => console.log('Service Worker registration failed'));
  });
}

clear.addEventListener("click", () => {
  const sure = confirm("Reset everything for a new round?");

  if (sure) {
    meals = {};
    localStorage.removeItem("meals");
    localStorage.removeItem("recipeLinks");

    inputs.forEach((box) => {
      box.value = "";
    });
  }
});
