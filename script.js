const grid = [];
const colors = ['red', 'yellow', 'blue', 'green', 'purple'];
const rows = 8;
const columns = 8;

gridStart();
processMatches();

// Initialize the grid and assign colors
function gridStart() {
  const cells = document.querySelectorAll('.cell');
  let cellIndex = 0;

  for (let row = 0; row < rows; row++) {
    grid[row] = [];

    for (let column = 0; column < columns; column++) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      grid[row][column] = randomColor;

      const cell = cells[cellIndex];
      cell.style.backgroundColor = randomColor;
      cell.dataset.row = row; // Add data attributes
      cell.dataset.col = column; // Add data attributes
      cellIndex++;
    }
  }
  console.log(grid);

  // Add event listeners to cells for interaction
  cells.forEach((cell) => {
    cell.addEventListener('click', handleCellClick);
  });
}

// Check for matches
function checkForMatches() {
  let matches = [];

  // Horizontal matches
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns - 2; column++) {
      const color = grid[row][column];
      if (
        color &&
        color === grid[row][column + 1] &&
        color === grid[row][column + 2]
      ) {
        matches.push({ row, column });
        matches.push({ row, column: column + 1 });
        matches.push({ row, column: column + 2 });
      }
    }
  }

  // Vertical matches
  for (let column = 0; column < columns; column++) {
    for (let row = 0; row < rows - 2; row++) {
      const color = grid[row][column];
      if (
        color &&
        color === grid[row + 1]?.[column] && // Ensure row + 1 exists
        color === grid[row + 2]?.[column]   // Ensure row + 2 exists
      ) {
        matches.push({ row, column });
        matches.push({ row: row + 1, column });
        matches.push({ row: row + 2, column });
      }
    }
  }

  // Remove duplicates
  const uniqueMatches = Array.from(new Set(matches.map(JSON.stringify))).map(JSON.parse);
  return uniqueMatches;
}

// Highlight matching cells (optional for debugging)
function highlightMatches() {
  const matches = checkForMatches();

  matches.forEach(({ row, column }) => {
    const cell = document.querySelector(`[data-row="${row}"][data-col="${column}"]`);
    if (cell) {
      cell.style.border = '4px solid white'; // Highlight matches
    }
  });
}

// Remove matched cells
function removeMatches(matches) {
  matches.forEach(({ row, column }) => {
    grid[row][column] = null;
  });
}

// Slide cells down into empty spaces
function slideDown() {
  for (let column = 0; column < columns; column++) {
    let emptySpaces = 0;

    // Iterate from the bottom to the top of the column
    for (let row = rows - 1; row >= 0; row--) {
      if (grid[row][column] === null) {
        emptySpaces++; // Count empty spaces
      } else if (emptySpaces > 0) {
        // Move the cell down by the number of empty spaces
        grid[row + emptySpaces][column] = grid[row][column];
        grid[row][column] = null; // Clear the original cell
      }
    }
  }
}

// Refill empty cells with new random colors
function refillGrid() {
  for (let column = 0; column < columns; column++) {
    for (let row = 0; row < rows; row++) {
      if (grid[row][column] === null) {
        // Assign a random color to the empty cell
        grid[row][column] = colors[Math.floor(Math.random() * colors.length)];
      }
    }
  }
}

// Update the grid display in the DOM
function updateGridDOM() {
  const cells = document.querySelectorAll('.cell');
  let cellIndex = 0;

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const cell = cells[cellIndex];
      cell.style.backgroundColor = grid[row][column];
      cellIndex++;
    }
  }
}

// Process matches and handle grid updates
function processMatches(afterSwap = false, firstCell = null, secondCell = null) {
  const matches = checkForMatches();

  if (matches.length > 0) {
    removeMatches(matches);
    slideDown();
    refillGrid();
    updateGridDOM();

    setTimeout(() => {
      processMatches();
    }, 300);
  } else if (afterSwap) {
    // Reverse swap if no matches are found
    swapCells(firstCell, secondCell);
    updateGridDOM();
  }
}

// Handle cell clicks for selection and swapping
let firstCell = null;

function handleCellClick(event) {
  const cellElement = event.target;
  const row = parseInt(cellElement.dataset.row);
  const column = parseInt(cellElement.dataset.col);

  if (!firstCell) {
    // Select the first cell
    firstCell = { row, column };
    cellElement.classList.add('selected'); // Highlight the selected cell
  } else {
    // Second cell selected, attempt a swap
    const secondCell = { row, column };
    document
      .querySelector(`[data-row="${firstCell.row}"][data-col="${firstCell.column}"]`)
      .classList.remove('selected'); // Remove highlight

    if (isAdjacent(firstCell, secondCell)) {
      swapCells(firstCell, secondCell);
      updateGridDOM(); // Update the DOM to reflect the swap
      processMatches(true, firstCell, secondCell); // Check for matches after the swap
    }

    firstCell = null; // Reset selection
  }
}

// Check if two cells are adjacent
function isAdjacent(cell1, cell2) {
  const rowDiff = Math.abs(cell1.row - cell2.row);
  const colDiff = Math.abs(cell1.column - cell2.column);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

// Swap two cells in the grid
function swapCells(cell1, cell2) {
  const temp = grid[cell1.row][cell1.column];
  grid[cell1.row][cell1.column] = grid[cell2.row][cell2.column];
  grid[cell2.row][cell2.column] = temp;
}
