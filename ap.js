
const container = document.querySelector("#spreadsheet-container");

let boldBtn = document.querySelector("#bold");
let underlineBtn = document.querySelector("#underline");
let italicBtn = document.querySelector("#italic");

let colorBtn = document.querySelector("#color");
let bgColorBtn = document.querySelector("#bg-color");

let left = document.querySelector("#left");
let center = document.querySelector("#center");
let right = document.querySelector("#right");
let justify = document.querySelector("#justify");
let textAlignItems = [left, center, right, justify];

let copyBtn = document.querySelector("#copy");
let cutBtn = document.querySelector("#cut");
let pasteBtn = document.querySelector("#paste");

let selectItem = document.querySelector("#selectItem");
let newFile = document.querySelector("#newFile");

let sortButton = document.querySelector("#sort");
let filterButton = document.querySelector("#filter");
let searchBar = document.querySelector("#search");

// Data structure to store spreadsheet data
let spreadsheetData = Array.from({ length: 26 }, () => Array(26).fill(""));

// Function to update cell data
function updateCellData(row, col, value) {
    spreadsheetData[row][col] = value;
}

// Function to render the spreadsheet
function renderSpreadsheet(data = spreadsheetData) {
    container.innerHTML = ""; // Clear existing content
    for (let row = 0; row <= 26; row++) {
        let rowElement = document.createElement("div");
        rowElement.classList.add("row");

        const colHeader = document.createElement("div");
        colHeader.className = "cell design";

        if (row > 0) {
            colHeader.innerText = String.fromCharCode("A".charCodeAt(0) + row - 1);
        } else {
            colHeader.style.opacity = 0;
        }
        rowElement.append(colHeader);

        for (let col = 0; col < 26; col++) {
            if (row == 0) {
                const rowHeader = document.createElement("div");
                rowHeader.className = "cell design";
                rowHeader.innerText = `${col}`;
                rowElement.appendChild(rowHeader);
            } else {
                const colElement = document.createElement("div");
                colElement.className = "cell";
                colElement.contentEditable = true;
                colElement.spellcheck = false;
                colElement.innerText = spreadsheetData[row - 1][col] || "";
                colElement.addEventListener("click", handleClick);
                colElement.addEventListener("blur", () => {
                    updateCellData(row-1, col, colElement.innerText);
                });
                rowElement.appendChild(colElement);
            }
        }
        container.appendChild(rowElement);
    }
}

// Initialize spreadsheet
renderSpreadsheet();

// Data structure to hold selected cells
let selectedCells = new Set();

// Handle cell click for selection
function handleClick(e) {
    let targetCell = e.target;

    if (!e.ctrlKey && !e.metaKey) {
        selectedCells.forEach(cell => cell.classList.remove("selected-cell"));
        selectedCells.clear();
    }

    if (selectedCells.has(targetCell)) {
        selectedCells.delete(targetCell);
        targetCell.classList.remove("selected-cell");
    } else {
        targetCell.classList.add("selected-cell");
        selectedCells.add(targetCell);
    }
}

// Handle formatting buttons
boldBtn.addEventListener("click", () => {
    selectedCells.forEach(cell => {
        cell.style.fontWeight = cell.style.fontWeight == "bold" ? "normal" : "bold";
    });
});

italicBtn.addEventListener("click", () => {
    selectedCells.forEach(cell => {
        cell.style.fontStyle = cell.style.fontStyle == "italic" ? "normal" : "italic";
    });
});

underlineBtn.addEventListener("click", () => {
    selectedCells.forEach(cell => {
        cell.style.textDecoration = cell.style.textDecoration == "underline" ? "none" : "underline";
    });
});

colorBtn.addEventListener("change", (e) => {
    selectedCells.forEach(cell => {
        cell.style.color = e.target.value;
    });
});

bgColorBtn.addEventListener("change", (e) => {
    selectedCells.forEach(cell => {
        cell.style.backgroundColor = e.target.value;
    });
});

// Handle text alignment
textAlignItems.forEach(item => {
    item.addEventListener("click", () => {
        selectedCells.forEach(cell => {
            cell.style.textAlign = item.id;
        });
    });
});

// Clipboard functionality
let clipboard = [];

copyBtn.addEventListener("click", () => {
    clipboard = [];
    selectedCells.forEach(cell => {
        clipboard.push(cell.innerText);
    });
});

cutBtn.addEventListener("click", () => {
    clipboard = [];
    selectedCells.forEach(cell => {
        clipboard.push(cell.innerText);
        cell.innerText = "";
    });
});

pasteBtn.addEventListener("click", () => {
    let i = 0;
    selectedCells.forEach(cell => {
        cell.innerText = clipboard[i++] || "";
    });
});

// Handle font size selection
for (let i = 8; i <= 64; i += 4) {
    let option = document.createElement("option");
    option.value = i;
    option.innerText = i;
    if (i == 16) {
        option.innerText += " (default)";
    }
    selectItem.appendChild(option);
}

selectItem.addEventListener("change", (e) => {
    selectedCells.forEach(cell => {
        cell.style.fontSize = e.target.value + "px";
    });
});

// Sorting functionality
function sortColumn(colIndex) {
    colIndex = parseInt(colIndex, 10);
    if (isNaN(colIndex) || colIndex < 0 || colIndex >= 26) {
        alert("Invalid column index. Please enter a number between 0 and 25.");
        return;
    }

    let columnData = spreadsheetData.map((row, index) => ({
        index: index,
        value: row[colIndex] || ""
    }));

    // Determine if the column contains numeric values
    let isNumericColumn = columnData.every(item => !isNaN(item.value) && item.value.trim() !== "");

    // Sort column data based on value
    columnData.sort((a, b) => {
        let valA = a.value;
        let valB = b.value;

        if (isNumericColumn) {
            valA = parseFloat(valA);
            valB = parseFloat(valB);
            return valA - valB;
        } else {
            return valA.toLowerCase().localeCompare(valB.toLowerCase());
        }
    });

    // Apply sorted order to spreadsheetData
    let sortedData = Array.from({ length: 26 }, () => Array(26).fill(""));
    columnData.forEach((item, sortedIndex) => {
        sortedData[sortedIndex] = spreadsheetData[item.index];
    });

    spreadsheetData = sortedData;
    renderSpreadsheet();
}

// Event listener for sort button
sortButton.addEventListener("click", () => {
    let colIndex = prompt("Enter column index to sort:");
    if (colIndex !== null) {
        sortColumn(colIndex);
    }
});

// Filtering functionality
filterButton.addEventListener("click", () => {
    let colIndex = prompt("Enter column index to filter:");
    let filterValue = prompt("Enter value to filter by:");
    if (colIndex !== null && filterValue !== null) {
        filterColumn(parseInt(colIndex, 10), filterValue);
    }
});

function filterColumn(colIndex, value) {
    let filteredData = spreadsheetData.filter(row => {
        let cellValue = row[colIndex] || "";
        return cellValue.includes(value);
    });
    renderSpreadsheet(filteredData);
}

// Searching functionality
searchBar.addEventListener("input", (e) => {
    let searchValue = e.target.value.toLowerCase();
    searchSpreadsheet(searchValue);
});

function searchSpreadsheet(value) {
    let searchResults = [];
    spreadsheetData.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell.toLowerCase().includes(value)) {
                searchResults.push({ row: rowIndex, col: colIndex, value: cell });
            }
        });
    });
    highlightSearchResults(searchResults);
}

function highlightSearchResults(results) {
    clearHighlights();
    results.forEach(result => {
        let cell = container.querySelector(
            `.row:nth-child(${result.row + 2}) .cell:nth-child(${result.col + 2})`
        );
        if (cell) {
            cell.classList.add("highlight");
        }
    });
}

function clearHighlights() {
    let highlightedCells = container.querySelectorAll(".highlight");
    highlightedCells.forEach(cell => {
        cell.classList.remove("highlight");
    });
}

// New file functionality
newFile.addEventListener("click", () => {
    spreadsheetData = Array.from({ length: 26 }, () => Array(26).fill(""));
    renderSpreadsheet();
});