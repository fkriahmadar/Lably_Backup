// Filtering;
document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const orderCards = document.querySelectorAll(".order-card");
  const mainContent = document.querySelector(".main-content");
  const paginationContainer = document.querySelector(".pagination");

  const filterMap = {
    all: ["paid", "in-use", "overdue", "complete"],
    loaned: ["in-use", "overdue"],
    completed: ["complete"],
  };

  const rowsPerPage = 100;
  let currentPage = 1;
  let currentlyVisibleCards = [];

  function createPaginationButton(
    value,
    innerHTML,
    targetPage,
    isActive = false
  ) {
    const button = document.createElement("button");
    button.innerHTML = innerHTML;
    button.classList.add("page-item");

    if (typeof value === "number") {
      button.classList.add("page-number");
    } else {
      button.classList.add("page-arrow");
    }

    if (isActive) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      if (
        targetPage >= 1 &&
        targetPage <= Math.ceil(currentlyVisibleCards.length / rowsPerPage)
      ) {
        currentPage = targetPage;
        displayCards(currentPage);
        renderPaginationButtons();
      }
    });
    return button;
  }

  function displayCards(page) {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    orderCards.forEach((card) => (card.style.display = "none"));

    currentlyVisibleCards.forEach((card, index) => {
      if (index >= startIndex && index < endIndex) {
        card.style.display = "flex";
      }
    });
  }

  function renderPaginationButtons() {
    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(currentlyVisibleCards.length / rowsPerPage);

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
      const button = createPaginationButton(i, i, i, i === currentPage);
      paginationContainer.appendChild(button);
    }

    if (currentPage < totalPages) {
      const nextButton = createPaginationButton(
        "NEXT",
        `NEXT <i class="bi bi-chevron-right"></i>`,
        currentPage + 1
      );
      paginationContainer.appendChild(nextButton);
    }
  }

  function applyFilter(filterName) {
    const validStatuses = filterMap[filterName];
    currentlyVisibleCards = [];

    if (filterName === "all") {
      mainContent.classList.remove("view-loaned");
    } else {
      mainContent.classList.add("view-loaned");
    }

    orderCards.forEach((card) => {
      const cardStatus = card.getAttribute("data-status");
      let shouldDisplay = false;

      if (validStatuses.includes(cardStatus)) {
        shouldDisplay = true;
      }

      card.style.display = "none";

      if (shouldDisplay) {
        currentlyVisibleCards.push(card);
      }
    });

    currentPage = 1;
    displayCards(currentPage);
    renderPaginationButtons();
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      filterButtons.forEach((btn) => {
        btn.classList.remove("active");
        btn.classList.add("inactive");
      });

      this.classList.add("active");
      this.classList.remove("inactive");

      const filterName = this.id.split("-")[1];
      applyFilter(filterName);
    });
  });

  applyFilter("all");
});

const notifBtn = document.getElementById("notifBtn");
const reminderPopup = document.getElementById("reminderPopup");

if (notifBtn && reminderPopup) {
  notifBtn.addEventListener("click", () => {
    if (reminderPopup.style.display === "block") {
      reminderPopup.style.display = "none";
    } else {
      reminderPopup.style.display = "block";
    }
  });

  document.addEventListener("click", (e) => {
    if (
      !notifBtn.contains(e.target) &&
      !reminderPopup.contains(e.target)
    ) {
      reminderPopup.style.display = "none";
    }
  });
}
