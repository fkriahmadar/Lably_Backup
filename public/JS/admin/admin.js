document.addEventListener("DOMContentLoaded", function () {
  const menuLinks = document.querySelectorAll(".left-menu .menu a");
  const currentPath = window.location.pathname;

  menuLinks.forEach((link) => {
    if (link.getAttribute("href") === currentPath) {
      link.closest(".menu").classList.add("active");
    }
  });
});

// Pagination Product
// document.addEventListener("DOMContentLoaded", () => {
//   const rowsPerPage = 10;
//   const maxPageButtons = 3;

//   const tableBody = document.querySelector(".table-wrapper tbody");
//   if (!tableBody) return;

//   const allRows = Array.from(tableBody.querySelectorAll("tr"));
//   const totalRows = allRows.length;
//   const totalPages = Math.ceil(totalRows / rowsPerPage);

//   const paginationContainer = document.querySelector(".pagination");
//   let currentPage = 1;

//   function displayRows(page) {
//     const startIndex = (page - 1) * rowsPerPage;
//     const endIndex = startIndex + rowsPerPage;

//     allRows.forEach((row, index) => {
//       if (index >= startIndex && index < endIndex) {
//         row.style.display = "";
//       } else {
//         row.style.display = "none";
//       }
//     });
//   }

//   function renderPaginationButtons() {
//     paginationContainer.innerHTML = "";
//     const startWindow =
//       Math.floor((currentPage - 1) / maxPageButtons) * maxPageButtons + 1;
//     const endWindow = Math.min(startWindow + maxPageButtons - 1, totalPages);

//     if (currentPage > maxPageButtons) {
//       const prevGroupPage = startWindow - 1;
//       const prevButton = createButton(
//         "PREV",
//         '<i class="bi bi-chevron-left"></i> PREV',
//         prevGroupPage
//       );
//       paginationContainer.appendChild(prevButton);
//     }

//     for (let i = startWindow; i <= endWindow; i++) {
//       const button = createButton(i, i, i);
//       if (i === currentPage) {
//         button.classList.add("active");
//       }
//       paginationContainer.appendChild(button);
//     }

//     if (endWindow < totalPages) {
//       const nextGroupPage = endWindow + 1;
//       const nextButton = createButton(
//         "NEXT",
//         `NEXT <i class="bi bi-chevron-right"></i>`,
//         nextGroupPage
//       );
//       nextButton.classList.add("page-next");
//       paginationContainer.appendChild(nextButton);
//     }
//   }

//   function createButton(value, innerHTML, targetPage) {
//     const button = document.createElement("button");
//     button.innerHTML = innerHTML;

//     if (typeof value === "number") {
//       button.classList.add("page-number");
//     } else {
//       button.classList.add("page-next");
//     }

//     button.addEventListener("click", () => {
//       if (targetPage >= 1 && targetPage <= totalPages) {
//         currentPage = targetPage;
//         displayRows(currentPage);
//         renderPaginationButtons();
//       }
//     });
//     return button;
//   }

//   if (totalPages > 0) {
//     displayRows(currentPage);
//     renderPaginationButtons();
//   }
// });
