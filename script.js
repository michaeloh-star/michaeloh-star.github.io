const categoryFilter = document.getElementById("category-filter");
const productCards = document.querySelectorAll("#product-grid .card");

if (categoryFilter && productCards.length > 0) {
  categoryFilter.addEventListener("change", (event) => {
    const selectedCategory = event.target.value;

    productCards.forEach((card) => {
      const category = card.dataset.category;
      const shouldShow = selectedCategory === "all" || category === selectedCategory;
      card.hidden = !shouldShow;
    });
  });
}
