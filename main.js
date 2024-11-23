// Funzione per richiedere conferma e ricaricare la pagina
function confirmRestart() {
  if (
    confirm(
      "Sei sicuro di voler riavviare la pagina? Tutte le modifiche non salvate andranno perse."
    )
  ) {
    location.reload(); // Ricarica la pagina
  }
}

// Funzione per richiedere conferma e ripristinare i dati cancellando il localStorage
function confirmReset() {
  if (
    confirm(
      "Sei sicuro di voler ripristinare tutti i dati? Questa azione cancellerà permanentemente tutti i dati salvati."
    )
  ) {
    localStorage.clear(); // Cancella tutti i dati dal localStorage
    alert("Dati ripristinati con successo.");
    location.reload(); // Ricarica la pagina per applicare le modifiche
  }
}

function exportData() {
  const dataStr = localStorage.getItem("financialData");
  if (!dataStr) {
    alert("Nessun dato trovato per l'esportazione.");
    return;
  }

  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "financialData.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function addNote() {
  const noteList = document.getElementById("noteList");
  const noteItem = document.createElement("li");
  noteItem.classList.add("note-item");

  const noteNumber = noteList.childElementCount + 1;

  const noteNumberSpan = document.createElement("span");
  noteNumberSpan.classList.add("note-number");
  noteNumberSpan.textContent = noteNumber + ".";

  const noteInput = document.createElement("input");
  noteInput.type = "text";
  noteInput.placeholder = "Scrivi qui la tua nota";
  noteInput.style.width = "95%";

  const removeBtn = document.createElement("button");
  removeBtn.classList.add("remove-btn");
  removeBtn.textContent = "X";
  removeBtn.onclick = () => {
    noteItem.remove();
    updateNoteNumbers();
  };

  noteItem.appendChild(noteNumberSpan);
  noteItem.appendChild(noteInput);
  noteItem.appendChild(removeBtn);
  noteList.appendChild(noteItem);
}

// Funzione per aggiornare i numeri delle note
function updateNoteNumbers() {
  const notes = document.querySelectorAll("#noteList .note-item");
  notes.forEach((note, index) => {
    note.querySelector(".note-number").textContent = index + 1 + ".";
  });
}

function sortInvestmentData() {
  const sortOption = document.getElementById("sortOptions").value;
  const [field, order] = sortOption.split("-");

  // Get investment data from the table
  const investments = [];
  const investmentRows = document.querySelectorAll("#investmentTable tr");
  investmentRows.forEach((row, index) => {
    if (index > 0) {
      // Skip the header row
      const description = row.cells[0].querySelector("input").value || "";
      const cost = parseFloat(row.cells[1].querySelector("input").value) || 0;
      const expectedReturn =
        parseFloat(row.cells[2].querySelector("input").value) || 0;
      const dateValue = row.cells[3].querySelector("input").value;

      // Parse the date to a sortable format if it exists
      const date = dateValue ? new Date(dateValue) : null;
      investments.push({ description, cost, expectedReturn, date });
    }
  });

  // Sort based on the selected option and order
  investments.sort((a, b) => {
    let comparison = 0;
    if (field === "date") {
      comparison = (a.date || 0) - (b.date || 0);
    } else if (field === "description") {
      comparison = a.description.localeCompare(b.description);
    } else if (field === "cost") {
      comparison = a.cost - b.cost;
    } else if (field === "return") {
      comparison = a.expectedReturn - b.expectedReturn;
    }

    // Reverse comparison for descending order
    return order === "desc" ? -comparison : comparison;
  });

  // Re-populate the table and update the chart with the sorted data
  updateInvestmentTable(investments);
  createInvestmentTimelineChart(investments);
}

function updateInvestmentTable(investments) {
  const investmentTable = document.getElementById("investmentTable");

  // Clear existing rows (except for header)
  while (investmentTable.rows.length > 1) {
    investmentTable.deleteRow(1);
  }

  // Re-add rows based on sorted data
  investments.forEach((investment) => {
    const row = investmentTable.insertRow();

    // Description cell
    const cellDescription = row.insertCell(0);
    const descriptionInput = document.createElement("input");
    descriptionInput.type = "text";
    descriptionInput.value = investment.description;
    cellDescription.appendChild(descriptionInput);

    // Cost cell
    const cellCost = row.insertCell(1);
    const costInput = document.createElement("input");
    costInput.type = "number";
    costInput.value = investment.cost;
    cellCost.appendChild(costInput);

    // Expected Return cell
    const cellReturn = row.insertCell(2);
    const returnInput = document.createElement("input");
    returnInput.type = "number";
    returnInput.value = investment.expectedReturn;
    cellReturn.appendChild(returnInput);

    // Date cell
    const cellDate = row.insertCell(3);
    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = investment.date
      ? investment.date.toISOString().split("T")[0]
      : "";
    cellDate.appendChild(dateInput);
  });
}

function calculateAnnualReturns() {
  const annualReturns = {};
  const investmentRows = document.querySelectorAll("#investmentTable tr");

  investmentRows.forEach((row, index) => {
    if (index > 0) {
      // Ignora l'intestazione
      const expectedReturn =
        parseFloat(row.cells[2].querySelector("input").value) || 0;
      const dateValue = row.cells[3].querySelector("input").value;

      if (dateValue) {
        const year = new Date(dateValue).getFullYear();
        if (!annualReturns[year]) {
          annualReturns[year] = 0;
        }
        annualReturns[year] += expectedReturn;
      }
    }
  });

  // Visualizza i ricavi per anno
  const annualReturnsDiv = document.getElementById("annualReturns");
  let annualReturnsHtml = "";
  for (const year in annualReturns) {
    annualReturnsHtml += `<p>Anno ${year}: €${annualReturns[year].toFixed(
      2
    )}</p>`;
  }
  annualReturnsDiv.innerHTML = annualReturnsHtml;
}

function importData() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json";

  fileInput.onchange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        localStorage.setItem("financialData", JSON.stringify(data));
        loadData(); // Chiama la funzione per caricare i dati nella pagina
        alert("Dati importati con successo!");
      } catch (error) {
        alert(
          "Errore nell'importazione del file: il file potrebbe non essere formattato correttamente."
        );
      }
    };

    reader.readAsText(file);
  };

  fileInput.click();
}
function addImmobile() {
  const redditoTable = document.getElementById("redditoTable");
  const row = document.createElement("tr");
  const cellDescription = document.createElement("td");
  cellDescription.classList.add("position-relative");
  cellDescription.textContent = "Immobili/Imprese";

  const cellCashflow = document.createElement("td");
  const cashflowInput = document.createElement("input");
  cashflowInput.type = "number";
  cashflowInput.placeholder = "0";
  cashflowInput.oninput = calculateTotals;
  cellCashflow.appendChild(cashflowInput);

  const removeBtn = document.createElement("button");
  removeBtn.classList.add("remove-btn");
  removeBtn.textContent = "X";
  removeBtn.onclick = () => {
    row.remove();
    calculateTotals();
  };
  cellDescription.appendChild(removeBtn);

  row.appendChild(cellDescription);
  row.appendChild(cellCashflow);
  redditoTable.appendChild(row);
  calculateTotals();
}

function addPassivoImmobile() {
  const passiviTable = document.getElementById("passiviTable");
  const row = document.createElement("tr");

  const cellDescription = document.createElement("td");
  cellDescription.classList.add("position-relative");
  cellDescription.textContent = "Immobili/Imprese";

  const cellMutuo = document.createElement("td");
  const mutuoInput = document.createElement("input");
  mutuoInput.type = "number";
  mutuoInput.placeholder = "0";
  mutuoInput.oninput = calculateTotals;
  cellMutuo.appendChild(mutuoInput);

  const removeBtn = document.createElement("button");
  removeBtn.classList.add("remove-btn");
  removeBtn.textContent = "X";
  removeBtn.onclick = () => {
    row.remove();
    calculateTotals();
  };
  cellDescription.appendChild(removeBtn);

  row.appendChild(cellDescription);
  row.appendChild(cellMutuo);
  passiviTable.appendChild(row);
  calculateTotals();
}

function addAttivo() {
  const attiviTable = document.getElementById("attiviTable");
  const row = document.createElement("tr");

  const cellDescription = document.createElement("td");
  cellDescription.classList.add("position-relative");
  const descriptionSelect = document.createElement("select");
  const optionAzioni = document.createElement("option");
  optionAzioni.value = "Azioni/Fondi/CD";
  optionAzioni.textContent = "Azioni/Fondi/CD";
  const optionImmobili = document.createElement("option");
  optionImmobili.value = "Immobili/Imprese";
  optionImmobili.textContent = "Immobili/Imprese";
  descriptionSelect.appendChild(optionAzioni);
  descriptionSelect.appendChild(optionImmobili);
  cellDescription.appendChild(descriptionSelect);

  const cellTitoliOrAcconto = document.createElement("td");
  const titoliOrAccontoInput = document.createElement("input");
  titoliOrAccontoInput.type = "text";
  titoliOrAccontoInput.placeholder = "# di Titoli / Acconto";
  cellTitoliOrAcconto.appendChild(titoliOrAccontoInput);

  const cellCostoOrCostoTitolo = document.createElement("td");
  const costoOrCostoTitoloInput = document.createElement("input");
  costoOrCostoTitoloInput.type = "number";
  costoOrCostoTitoloInput.placeholder = "Costo/Titolo / Costo";
  costoOrCostoTitoloInput.oninput = calculateRisparmi;
  cellCostoOrCostoTitolo.appendChild(costoOrCostoTitoloInput);

  const removeBtn = document.createElement("button");
  removeBtn.classList.add("remove-btn");
  removeBtn.textContent = "X";
  removeBtn.onclick = () => {
    row.remove();
    calculateRisparmi();
  };
  cellDescription.appendChild(removeBtn);

  row.appendChild(cellDescription);
  row.appendChild(cellTitoliOrAcconto);
  row.appendChild(cellCostoOrCostoTitolo);
  attiviTable.appendChild(row);
  calculateRisparmi();
}

function calculateTotals() {
  let redditoTotale =
    parseFloat(document.getElementById("stipendio").value) || 0;
  document
    .querySelectorAll("#redditoTable input[type='number']")
    .forEach((input, index) => {
      if (index > 0) redditoTotale += parseFloat(input.value) || 0;
    });
  document.getElementById("redditoTotale").innerText =
    redditoTotale.toLocaleString("it-IT");

  let speseTotali = 0;
  document
    .querySelectorAll("#speseTable input[type='number']")
    .forEach((input) => {
      speseTotali += parseFloat(input.value) || 0;
    });
  document.getElementById("speseTotali").innerText =
    speseTotali.toLocaleString("it-IT");

  const cashflowMensile = redditoTotale - speseTotali;
  document.getElementById("cashflowMensile").innerText =
    cashflowMensile.toLocaleString("it-IT");
}

function calculateRisparmi() {
  let risparmi = 0;
  document
    .querySelectorAll("#attiviTable input[type='number']")
    .forEach((input) => {
      risparmi += parseFloat(input.value) || 0;
    });
  document.getElementById("risparmi").innerText =
    risparmi.toLocaleString("it-IT");

  let passiviTotale = 0;
  document
    .querySelectorAll("#passiviTable input[type='number']")
    .forEach((input) => {
      passiviTotale += parseFloat(input.value) || 0;
    });

  const patrimonioNetto = risparmi - passiviTotale;
  document.getElementById("patrimonioNetto").innerText =
    patrimonioNetto.toLocaleString("it-IT");
}

window.onload = function () {
  calculateTotals();
  calculateRisparmi();
};

function saveData() {
  const data = {
    redditoData: [],
    speseData: {},
    passiviData: [],
    attiviData: [],
    investmentsData: [],
  };

  // Salva reddito
  const redditoRows = document
    .getElementById("redditoTable")
    .querySelectorAll("tr");
  redditoRows.forEach((row, index) => {
    if (index >= 1) {
      const description = row.cells[0].textContent.trim();
      const value = row.cells[1].querySelector("input").value || "0";
      data.redditoData.push({ description, value });
    }
  });

  // Salva spese
  const speseInputs = document
    .getElementById("speseTable")
    .querySelectorAll("input");
  speseInputs.forEach((input) => {
    data.speseData[input.id] = input.value || "0";
  });

  // Salva passivi
  const passiviRows = document
    .getElementById("passiviTable")
    .querySelectorAll("tr");
  passiviRows.forEach((row, index) => {
    if (index >= 0) {
      const description = row.cells[0].textContent.trim();
      const value = row.cells[1].querySelector("input").value || "0";
      data.passiviData.push({ description, value });
    }
  });

  // Salva attivi
  const attiviRows = document
    .getElementById("attiviTable")
    .querySelectorAll("tr");
  attiviRows.forEach((row, index) => {
    if (index > 0) {
      const tipo = row.cells[0].querySelector("select").value;
      const descrizione = row.cells[1].querySelector("input").value || "";
      const valore = row.cells[2].querySelector("input").value || "0";
      data.attiviData.push({ tipo, descrizione, valore });
    }
  });

  // Salva investimenti
  const investmentRows = document
    .getElementById("investmentTable")
    .querySelectorAll("tr");
  investmentRows.forEach((row, index) => {
    if (index > 0) {
      const description = row.cells[0].querySelector("input").value || "";
      const cost = row.cells[1].querySelector("input").value || "0";
      const expectedReturn = row.cells[2].querySelector("input").value || "0";
      const expectedDate = row.cells[3].querySelector("input").value || "";
      data.investmentsData.push({
        description,
        cost,
        expectedReturn,
        expectedDate,
      });
    }
  });

  localStorage.setItem("financialData", JSON.stringify(data));
  alert("Dati salvati con successo!");
}

function loadData() {
  const dataStr = localStorage.getItem("financialData");
  if (!dataStr) {
    alert("Nessun dato salvato trovato.");
    return;
  }
  const data = JSON.parse(dataStr);

  // Ripopola reddito
  const redditoTable = document.getElementById("redditoTable");
  while (redditoTable.rows.length > 2) {
    redditoTable.deleteRow(2);
  }
  data.redditoData.forEach((item, index) => {
    if (index === 0) {
      document.getElementById("stipendio").value = item.value;
    } else {
      addImmobile();
      const row = redditoTable.rows[redditoTable.rows.length - 1];
      row.cells[1].querySelector("input").value = item.value;
    }
  });

  // Ripopola spese
  for (const id in data.speseData) {
    if (document.getElementById(id)) {
      document.getElementById(id).value = data.speseData[id];
    }
  }

  // Ripopola passivi
  const passiviTable = document.getElementById("passiviTable");
  while (passiviTable.rows.length > 5) {
    passiviTable.deleteRow(5);
  }
  data.passiviData.forEach((item) => {
    const row = passiviTable.insertRow();
    const cellDescription = row.insertCell(0);
    cellDescription.textContent = item.description;

    const cellValue = row.insertCell(1);
    const inputValue = document.createElement("input");
    inputValue.type = "number";
    inputValue.value = item.value;
    inputValue.oninput = calculateRisparmi;
    cellValue.appendChild(inputValue);

    row.appendChild(cellDescription);
    row.appendChild(cellValue);
  });

  // Ripopola attivi
  const attiviTable = document.getElementById("attiviTable");
  while (attiviTable.rows.length > 1) {
    attiviTable.deleteRow(1);
  }
  data.attiviData.forEach((item) => {
    addAttivo();
    const row = attiviTable.rows[attiviTable.rows.length - 1];
    row.cells[0].querySelector("select").value = item.tipo;
    row.cells[1].querySelector("input").value = item.descrizione;
    row.cells[2].querySelector("input").value = item.valore;
  });

  // Ripopola investimenti
  const investmentTable = document.getElementById("investmentTable");
  while (investmentTable.rows.length > 1) {
    investmentTable.deleteRow(1);
  }
  data.investmentsData.forEach((item) => {
    addInvestment();
    const row = investmentTable.rows[investmentTable.rows.length - 1];
    row.cells[0].querySelector("input").value = item.description;
    row.cells[1].querySelector("input").value = item.cost;
    row.cells[2].querySelector("input").value = item.expectedReturn;
    row.cells[3].querySelector("input").value = item.expectedDate;
  });

  calculateTotals();
  calculateRisparmi();
  calculateInvestmentTotals();
  calculateAnnualReturns();

  alert("Dati caricati con successo!");
}

window.onload = function () {
  calculateTotals();
  calculateRisparmi();
  calculateInvestmentTotals();
  calculateAnnualReturns();
};

function addInvestment() {
  const table = document.getElementById("investmentTable");
  const row = document.createElement("tr");

  // Description cell
  const cellDescription = document.createElement("td");
  const descriptionInput = document.createElement("input");
  descriptionInput.type = "text";
  descriptionInput.placeholder = "Descrizione";
  cellDescription.appendChild(descriptionInput);

  // Investment Cost cell
  const cellCost = document.createElement("td");
  const costInput = document.createElement("input");
  costInput.type = "number";
  costInput.placeholder = "Costo";
  costInput.oninput = calculateInvestmentTotals;
  cellCost.appendChild(costInput);

  // Expected Return cell
  const cellReturn = document.createElement("td");
  const returnInput = document.createElement("input");
  returnInput.type = "number";
  returnInput.placeholder = "Ricavo Atteso";
  returnInput.oninput = calculateInvestmentTotals;
  cellReturn.appendChild(returnInput);

  // Expected Return Date cell
  const cellDate = document.createElement("td");
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  cellDate.appendChild(dateInput);

  // Remove button
  const removeBtn = document.createElement("button");
  removeBtn.classList.add("remove-btn");
  removeBtn.textContent = "X";
  removeBtn.onclick = () => {
    row.remove();
    calculateInvestmentTotals();
  };

  cellDescription.appendChild(removeBtn);

  row.appendChild(cellDescription);
  row.appendChild(cellCost);
  row.appendChild(cellReturn);
  row.appendChild(cellDate);
  table.appendChild(row);

  calculateInvestmentTotals();
  calculateTotals();
  calculateAnnualReturns();
}

function calculateInvestmentTotals() {
  let totaleInvestito = 0;
  let ricavoAttesoTotale = 0;

  document.querySelectorAll("#investmentTable tr").forEach((row, index) => {
    if (index > 0) {
      const cost = parseFloat(row.cells[1].querySelector("input").value) || 0;
      const expectedReturn =
        parseFloat(row.cells[2].querySelector("input").value) || 0;
      totaleInvestito += cost;
      ricavoAttesoTotale += expectedReturn;
    }
  });

  // Calcola Prelievo Atteso come somma di Totale Investito e Ricavo Totale Atteso
  const prelievoAtteso = totaleInvestito + ricavoAttesoTotale;

  // Visualizza i risultati
  document.getElementById("totaleInvestito").innerText =
    totaleInvestito.toLocaleString("it-IT");
  document.getElementById("ricavoAttesoTotale").innerText =
    ricavoAttesoTotale.toLocaleString("it-IT");
  document.getElementById("prelievoAtteso").innerText =
    prelievoAtteso.toLocaleString("it-IT");

  calculateAnnualReturns(); // Aggiorna anche i ricavi annuali
}
