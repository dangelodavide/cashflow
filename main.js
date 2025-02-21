function confirmRestart() {
  if (
    confirm(
      "Sei sicuro di voler riavviare la pagina? Tutte le modifiche non salvate andranno perse."
    )
  ) {
    location.reload();
  }
}

function confirmReset() {
  if (
    confirm(
      "Sei sicuro di voler ripristinare tutti i dati? Questa azione cancellerà permanentemente tutti i dati salvati."
    )
  ) {
    localStorage.clear();
    alert("Dati ripristinati con successo.");
    location.reload();
  }
}

function exportData() {
  console.log("📤 Esportazione dati in corso...");

  const dataStr = localStorage.getItem("financialData");

  if (!dataStr) {
      alert("⚠️ Nessun dato trovato per l'esportazione.");
      console.warn("❌ Export fallito: nessun dato trovato.");
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

  console.log("✅ Export completato con successo!");
  alert("✅ Dati esportati con successo!");
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

function updateNoteNumbers() {
  const notes = document.querySelectorAll("#noteList .note-item");
  notes.forEach((note, index) => {
    note.querySelector(".note-number").textContent = index + 1 + ".";
  });
}

function sortInvestmentData() {
  const sortOption = document.getElementById("sortOptions").value;
  const [field, order] = sortOption.split("-");

  const investments = [];
  const investmentRows = document.querySelectorAll("#investmentTable tr");
  investmentRows.forEach((row, index) => {
    if (index > 0) {
      const description = row.cells[0].querySelector("input").value || "";
      const cost = parseFloat(row.cells[1].querySelector("input").value) || 0;
      const expectedReturn =
        parseFloat(row.cells[2].querySelector("input").value) || 0;
      const dateValue = row.cells[3].querySelector("input").value;
      const date = dateValue ? new Date(dateValue) : null;
      investments.push({ description, cost, expectedReturn, date });
    }
  });

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

    return order === "desc" ? -comparison : comparison;
  });

  updateInvestmentTable(investments);
  createInvestmentTimelineChart(investments);
}

function updateInvestmentTable(investments) {
  const investmentTable = document.getElementById("investmentTable");

  while (investmentTable.rows.length > 1) {
    investmentTable.deleteRow(1);
  }

  investments.forEach((investment) => {
    const row = investmentTable.insertRow();

    const cellDescription = row.insertCell(0);
    const descriptionInput = document.createElement("input");
    descriptionInput.type = "text";
    descriptionInput.value = investment.description;
    cellDescription.appendChild(descriptionInput);

    const cellCost = row.insertCell(1);
    const costInput = document.createElement("input");
    costInput.type = "number";
    costInput.value = investment.cost;
    cellCost.appendChild(costInput);

    const cellReturn = row.insertCell(2);
    const returnInput = document.createElement("input");
    returnInput.type = "number";
    returnInput.value = investment.expectedReturn;
    cellReturn.appendChild(returnInput);

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
  const investmentRows = document.querySelectorAll(".investment-table tbody tr");

  investmentRows.forEach((row) => {
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
  });

  const annualReturnsDiv = document.getElementById("annualReturns");
  annualReturnsDiv.innerHTML = ""; 

  const table = document.createElement("table");
  table.classList.add("totals-table");
  for (const year in annualReturns) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="totals">Anno ${year}: €${annualReturns[year].toLocaleString(
      "it-IT",
      { minimumFractionDigits: 2 }
    )}</td>
    `;
    table.appendChild(row);
  }

  annualReturnsDiv.appendChild(table);
}

function generateIncomeExpenseChart() {
  console.log("📊 Generazione grafico Reddito e Spese...");

  const chartContainer = document.querySelector(".chart-container");
  const incomeExpenseCanvas = document.getElementById("incomeExpenseChart");

  if (!incomeExpenseCanvas || !chartContainer) {
      console.error("❌ Canvas o container del grafico non trovati!");
      return;
  }

  let redditoTotale = parseFloat(document.getElementById("redditoTotale").innerText.replace(" €", "").replace(/\./g, "").replace(",", ".")) || 0;
  let speseTotali = parseFloat(document.getElementById("speseTotali").innerText.replace(" €", "").replace(/\./g, "").replace(",", ".")) || 0;
  let cashflowMensile = parseFloat(document.getElementById("cashflowMensile").innerText.replace(" €", "").replace(/\./g, "").replace(",", ".")) || 0;

  console.log("✅ Valori estratti per il grafico:", { redditoTotale, speseTotali, cashflowMensile });

  if (redditoTotale === 0 && speseTotali === 0 && cashflowMensile === 0) {
      console.warn("⚠️ Nessun dato valido per generare il grafico.");
      incomeExpenseCanvas.classList.remove("active");
      chartContainer.style.display = "none";
      return;
  }

  chartContainer.style.display = "block";
  incomeExpenseCanvas.classList.add("active");

  if (window.incomeExpenseChart instanceof Chart) {
      window.incomeExpenseChart.destroy();
  }

  let maxY = Math.max(redditoTotale, speseTotali, cashflowMensile) * 1.2;

  const ctx = incomeExpenseCanvas.getContext("2d");
  window.incomeExpenseChart = new Chart(ctx, {
      type: "bar",
      data: {
          labels: ["Reddito Totale", "Spese Totali", "Cashflow Mensile"],
          datasets: [
              {
                  label: "Importi (€)",
                  data: [redditoTotale, speseTotali, cashflowMensile],
                  backgroundColor: [
                      "rgba(54, 162, 235, 0.6)",  
                      "rgba(255, 99, 132, 0.6)", 
                      "rgba(75, 192, 192, 0.6)", 
                  ],
                  borderColor: [
                      "rgba(54, 162, 235, 1)",
                      "rgba(255, 99, 132, 1)",
                      "rgba(75, 192, 192, 1)",
                  ],
                  borderWidth: 1,
              }
          ],
      },
      options: {
          responsive: true,
          scales: {
              y: {
                  beginAtZero: true,
                  max: maxY,
                  title: { display: true },
              },
          },
      },
  });

  console.log("✅ Grafico Reddito e Spese generato!");
}

function generateInvestmentCharts() {
  console.log("Generazione grafici...");

  const investmentRows = document.querySelectorAll(".investment-table tbody tr");

  let labels = [];
  let investmentCosts = [];
  let expectedReturns = [];
  let dates = [];

  investmentRows.forEach(row => {
    let description = row.cells[0].querySelector("input").value || "Senza Nome";
    let cost = parseFloat(row.cells[1].querySelector("input").value) || 0;
    let expectedReturn = parseFloat(row.cells[2].querySelector("input").value) || 0;
    let date = row.cells[3].querySelector("input").value || "";

    labels.push(description);
    investmentCosts.push(cost);
    expectedReturns.push(expectedReturn);
    dates.push(date);
  });

  if (investmentCosts.every(val => val === 0) && expectedReturns.every(val => val === 0)) {
    console.warn("⚠️ Nessun dato disponibile per generare i grafici.");
    document.getElementById("investmentTimelineChart").classList.remove("active");
    document.getElementById("investmentComparisonChart").classList.remove("active");
    document.getElementById("investmentDistributionChart").classList.remove("active");
    return;
  }

  console.log("📊 Dati per i grafici:", { labels, investmentCosts, expectedReturns, dates });

  document.getElementById("investmentTimelineChart").classList.add("active");
  document.getElementById("investmentComparisonChart").classList.add("active");
  document.getElementById("investmentDistributionChart").classList.add("active");

  if (window.investmentTimelineChart instanceof Chart) {
    window.investmentTimelineChart.destroy();
  }
  if (window.investmentComparisonChart instanceof Chart) {
    window.investmentComparisonChart.destroy();
  }
  if (window.investmentDistributionChart instanceof Chart) {
    window.investmentDistributionChart.destroy();
  }

  const timelineCanvas = document.getElementById("investmentTimelineChart");
  const timelineCtx = timelineCanvas.getContext("2d");

  let investmentData = dates
    .map((date, index) => {
      let validDate = date ? new Date(date) : null;
      return { date: validDate, expectedReturn: expectedReturns[index] };
    })
    .filter(item => item.date !== null && !isNaN(item.date))
    .sort((a, b) => a.date - b.date);

  const sortedDates = investmentData.map(item => item.date.toISOString().split("T")[0]);
  const sortedReturns = investmentData.map(item => item.expectedReturn);

  window.investmentTimelineChart = new Chart(timelineCtx, {
    type: "line",
    data: {
      labels: sortedDates,
      datasets: [{
        label: "Ricavo Atteso nel Tempo",
        data: sortedReturns,
        fill: false,
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.3,
      }],
    },
    options: {
      responsive: true,
      scales: {
        x: { type: "category" },
        y: { beginAtZero: true },
      },
    },
  });

  const comparisonCanvas = document.getElementById("investmentComparisonChart");
  const comparisonCtx = comparisonCanvas.getContext("2d");

  window.investmentComparisonChart = new Chart(comparisonCtx, {
    type: "bar",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Costo Investimento",
          data: investmentCosts,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: "Ricavo Atteso",
          data: expectedReturns,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: "category",
          title: { display: true },
          display: true
        },
        y: {
          beginAtZero: true
        }
      }
    },
  });

  console.log("✅ Grafici generati correttamente!");
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
              const importedData = JSON.parse(e.target.result);
              console.log("📂 Dati importati:", importedData);

              if (!importedData.redditoData) {
                  alert("❌ Il file importato non contiene dati validi.");
                  return;
              }

              // ✅ Rimuove automaticamente la "X" dai nomi importati
              importedData.redditoData.forEach(item => {
                  item.description = item.description.replace(/X$/, "").trim();
              });

              localStorage.setItem("financialData", JSON.stringify(importedData));
              console.log("✅ Dati importati nel localStorage.");

              loadData(); // Ricarica i dati mantenendo le intestazioni
              alert("✅ Dati importati con successo!");
          } catch (error) {
              alert("❌ Errore nell'importazione del file.");
              console.error("Errore nel parsing JSON:", error);
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

  const removeBtn = document.createElement("button");
  removeBtn.classList.add("remove-btn");
  removeBtn.textContent = "X";

  removeBtn.onclick = function () {
      row.remove();
      calculateTotals();
  };

  cellDescription.appendChild(removeBtn);

  const cellCashflow = document.createElement("td");
  const cashflowInput = document.createElement("input");
  cashflowInput.type = "number";
  cashflowInput.placeholder = "0";
  cashflowInput.oninput = calculateTotals;

  cellCashflow.appendChild(cashflowInput);
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

function parseNumber(value) {
  if (!value) return 0;

  // 1️⃣ Rimuove tutti gli spazi bianchi
  value = value.trim();

  // 2️⃣ Se il numero contiene sia punto che virgola, assume che il punto sia il separatore delle migliaia
  if (value.includes(".") && value.includes(",")) {
      value = value.replace(/\./g, "").replace(",", ".");
  } 
  // 3️⃣ Se contiene solo la virgola, assume che sia il separatore decimale
  else if (value.includes(",")) {
      value = value.replace(",", ".");
  }

  return parseFloat(value) || 0;
}

function calculateTotals() {
  console.log("🔄 Ricalcolo Totali...");

  let redditoTotale = 0;
  let speseTotali = 0;

  document.querySelectorAll("#redditoTable tbody tr").forEach(row => {
      let input = row.cells[1]?.querySelector("input");
      if (input) {
          let valore = parseNumber(input.value);
          console.log(`➕ Aggiunto reddito da '${row.cells[0].textContent.trim()}': ${valore}`);
          redditoTotale += valore;
      }
  });

  document.querySelectorAll("#speseTable tbody tr").forEach(row => {
      let input = row.cells[1]?.querySelector("input");
      if (input) {
          let valore = parseNumber(input.value);
          console.log(`➖ Sottratta spesa '${row.cells[0].textContent.trim()}': ${valore}`);
          speseTotali += valore;
      }
  });

  let cashflowMensile = redditoTotale - speseTotali;
  console.log(`📊 Reddito Totale: ${redditoTotale}, Spese Totali: ${speseTotali}, Cashflow Mensile: ${cashflowMensile}`);

  document.getElementById("redditoTotale").innerText = `${redditoTotale.toLocaleString("it-IT", { minimumFractionDigits: 2 })} €`;
  document.getElementById("speseTotali").innerText = `${speseTotali.toLocaleString("it-IT", { minimumFractionDigits: 2 })} €`;
  document.getElementById("cashflowMensile").innerText = `${cashflowMensile.toLocaleString("it-IT", { minimumFractionDigits: 2 })} €`;

  setTimeout(() => {
      generateIncomeExpenseChart();
  }, 500);
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
  generateIncomeExpenseChart();
};

function saveData() {
  console.log("💾 Tentativo di salvataggio dati...");

  const data = {
      redditoData: [],
      speseData: {},
      passiviData: [],
      attiviData: [],
      investmentsData: [],
  };

  document.querySelectorAll("#redditoTable tbody tr").forEach(row => {
      const cells = row.cells;
      if (cells.length < 2) return;

      const description = cells[0]?.textContent.trim();
      const input = cells[1]?.querySelector("input");
      if (!input) return;

      const value = input.value || "0";
      data.redditoData.push({ description, value });
  });

  document.querySelectorAll("#speseTable input[type='number']").forEach(input => {
      if (input && input.id) {
          data.speseData[input.id] = input.value || "0";
      }
  });

  document.querySelectorAll("#passiviTable tbody tr").forEach(row => {
      const cells = row.cells;
      if (cells.length < 2) return;

      const description = cells[0]?.textContent.trim();
      const input = cells[1]?.querySelector("input");
      if (!input) return;

      const value = input.value || "0";
      data.passiviData.push({ description, value });
  });

  document.querySelectorAll("#attiviTable tbody tr").forEach(row => {
      const cells = row.cells;
      if (cells.length < 3) return;

      const tipo = cells[0]?.querySelector("select")?.value || "";
      const descrizione = cells[1]?.querySelector("input")?.value || "";
      const valore = cells[2]?.querySelector("input")?.value || "0";
      if (tipo) {
          data.attiviData.push({ tipo, descrizione, valore });
      }
  });

  document.querySelectorAll(".investment-table tbody tr").forEach(row => {
      const cells = row.cells;
      if (cells.length < 4) return;

      const description = cells[0]?.querySelector("input")?.value || "";
      const cost = cells[1]?.querySelector("input")?.value || "0";
      const expectedReturn = cells[2]?.querySelector("input")?.value || "0";
      const expectedDate = cells[3]?.querySelector("input")?.value || "";

      if (description) {
          data.investmentsData.push({ description, cost, expectedReturn, expectedDate });
      }
  });

  localStorage.setItem("financialData", JSON.stringify(data));

  console.log("✅ Dati salvati con successo:", JSON.parse(localStorage.getItem("financialData")));
  alert("✅ Dati salvati con successo!");
}

function loadData() {
  console.log("📂 Caricamento dati da localStorage...");

  let dataStr = localStorage.getItem("financialData");
  let data;

  if (!dataStr) {
      console.warn("⚠️ Nessun dato trovato, inizializzo con valori di default...");
      data = {
          redditoData: [{ description: "Stipendio", value: "0" }],
          speseData: { affitto: "0", bollette: "0", alimentari: "0" },
          passiviData: [{ description: "Mutuo", value: "0" }],
          attiviData: [{ tipo: "Azioni/Fondi/CD", descrizione: "Investimento iniziale", valore: "0" }],
          investmentsData: []
      };
      localStorage.setItem("financialData", JSON.stringify(data));
  } else {
      try {
          data = JSON.parse(dataStr);
          console.log("📂 Dati caricati correttamente:", data);
      } catch (error) {
          console.error("❌ Errore nel parsing JSON, resetto i dati:", error);
          localStorage.removeItem("financialData");
          return;
      }
  }

  // ✅ Rimuove la "X" dai nomi importati
  data.redditoData.forEach(item => {
      item.description = item.description.replace(/X$/, "").trim();
  });

  localStorage.setItem("financialData", JSON.stringify(data));

  // 🟢 Caricamento TABELLA REDDITI (Manteniamo intestazione)
  const redditoTable = document.querySelector("#redditoTable tbody");
  redditoTable.querySelectorAll("tr:not(:first-child)").forEach(row => row.remove());

  data.redditoData.forEach(item => {
      const row = redditoTable.insertRow();
      const cellDesc = row.insertCell(0);
      cellDesc.textContent = item.description;

      // ✅ Aggiunge il pulsante "X" celeste per eliminare voci (tranne stipendio)
      if (item.description !== "Stipendio") {
          const removeBtn = document.createElement("button");
          removeBtn.classList.add("remove-btn-celeste");
          removeBtn.textContent = "X";
          removeBtn.onclick = () => {
              row.remove();
              calculateTotals();
          };
          cellDesc.appendChild(removeBtn);
      }

      const cellValue = row.insertCell(1);
      const input = document.createElement("input");
      input.type = "number";
      input.value = item.value;
      input.oninput = calculateTotals;
      input.id = item.description.toLowerCase().replace(" ", "_");
      cellValue.appendChild(input);
  });

  // 🟢 Caricamento TABELLA SPESE
  const speseTable = document.querySelector("#speseTable tbody");
  speseTable.querySelectorAll("tr:not(:first-child)").forEach(row => row.remove());
  Object.keys(data.speseData).forEach(id => {
      const row = speseTable.insertRow();
      const cellDesc = row.insertCell(0);
      cellDesc.textContent = id;
      const cellValue = row.insertCell(1);
      const input = document.createElement("input");
      input.type = "number";
      input.value = data.speseData[id];
      input.oninput = calculateTotals;
      cellValue.appendChild(input);
  });

  // 🟢 Caricamento TABELLA PASSIVI
  const passiviTable = document.querySelector("#passiviTable tbody");
  passiviTable.querySelectorAll("tr:not(:first-child)").forEach(row => row.remove());
  data.passiviData.forEach(item => {
      const row = passiviTable.insertRow();
      const cellDesc = row.insertCell(0);
      cellDesc.textContent = item.description;
      const cellValue = row.insertCell(1);
      const input = document.createElement("input");
      input.type = "number";
      input.value = item.value;
      input.oninput = calculateRisparmi;
      cellValue.appendChild(input);
  });

  // 🟢 Caricamento TABELLA ATTIVI
  const attiviTable = document.querySelector("#attiviTable tbody");
  attiviTable.querySelectorAll("tr:not(:first-child)").forEach(row => row.remove());
  data.attiviData.forEach(item => {
      const row = attiviTable.insertRow();
      const cellType = row.insertCell(0);
      const select = document.createElement("select");
      select.innerHTML = `
          <option value="Azioni/Fondi/CD">Azioni/Fondi/CD</option>
          <option value="Immobili/Imprese">Immobili/Imprese</option>
      `;
      select.value = item.tipo;
      cellType.appendChild(select);
      row.insertCell(1).textContent = item.descrizione;
      const cellValue = row.insertCell(2);
      const input = document.createElement("input");
      input.type = "number";
      input.value = item.valore;
      input.oninput = calculateRisparmi;
      cellValue.appendChild(input);
  });

  // 🟢 Caricamento TABELLA INVESTIMENTI
  const investmentTable = document.querySelector(".investment-table tbody");
  investmentTable.querySelectorAll("tr").forEach(row => row.remove());
  data.investmentsData.forEach(item => {
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
          <td><input type="text" value="${item.description}"></td>
          <td><input type="number" value="${item.cost}"></td>
          <td><input type="number" value="${item.expectedReturn}"></td>
          <td><input type="date" value="${item.expectedDate}"></td>
          <td><button class="remove-btn" onclick="removeInvestment(this)">X</button></td>
      `;
      investmentTable.appendChild(newRow);
  });

  console.log("✅ Dati caricati con successo!");
  alert("✅ Dati caricati con successo!");

  calculateTotals();
  calculateRisparmi();
  calculateInvestmentTotals();
  calculateAnnualReturns();
  generateInvestmentCharts();
  generateIncomeExpenseChart();
}

window.onload = function () {
  calculateTotals();
  calculateRisparmi();
  calculateInvestmentTotals();
  calculateAnnualReturns();
  generateInvestmentCharts();
  generateIncomeExpenseChart();
};

function removeInvestment(button) {
  const row = button.parentElement.parentElement; 
  row.remove(); 
  calculateInvestmentTotals();
}

function addInvestment() {
  const investmentTable = document.querySelector('.investment-table tbody');

  const newRow = document.createElement('tr');

  newRow.innerHTML = `
      <td><input type="text" placeholder="Descrizione"></td>
      <td><input type="number" placeholder="0"></td>
      <td><input type="number" placeholder="0"></td>
      <td><input type="date"></td>
      <td>
        <button class="remove-btn" onclick="removeInvestment(this)">X</button>
      </td>
  `;

  investmentTable.appendChild(newRow);
}

function calculateInvestmentTotals() {
  let totaleInvestito = 0;
  let ricavoAttesoTotale = 0;

  document.querySelectorAll(".investment-table tbody tr").forEach((row) => {
    const cost = parseFloat(row.cells[1].querySelector("input").value) || 0;
    const expectedReturn =
      parseFloat(row.cells[2].querySelector("input").value) || 0;

    totaleInvestito += cost; 
    ricavoAttesoTotale += expectedReturn; 
  });

  const prelievoAtteso = totaleInvestito + ricavoAttesoTotale;

  document.getElementById("totaleInvestito").innerText =
    totaleInvestito.toLocaleString("it-IT", { minimumFractionDigits: 2 });
  document.getElementById("ricavoAttesoTotale").innerText =
    ricavoAttesoTotale.toLocaleString("it-IT", { minimumFractionDigits: 2 });
  document.getElementById("prelievoAtteso").innerText =
    prelievoAtteso.toLocaleString("it-IT", { minimumFractionDigits: 2 });

  calculateAnnualReturns();
}

function toggleTheme() {
  const htmlElement = document.documentElement;
  const currentTheme = htmlElement.getAttribute('data-bs-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';

  htmlElement.setAttribute('data-bs-theme', newTheme);

  console.log(`Tema cambiato in: ${newTheme}`);
}

function toggleWallet(walletId) {
  const walletCard = document.getElementById(walletId);
  if (walletCard.style.display === "none") {
      walletCard.style.display = "block";
  } else {
      walletCard.style.display = "none";
  }
}