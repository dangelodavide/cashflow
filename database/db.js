// Function to delete the existing database and reinitialize it
export function deleteDb() {
  const request = indexedDB.deleteDatabase("cashFlowDB");

  request.onsuccess = function () {
    console.log("Database deleted successfully!");
    // Call initializeDb to recreate the database
    initializeDb();
  };

  request.onerror = function (event) {
    console.error("Error deleting database", event.target.error);
  };
}

// Function to initialize or update the database
export function initializeDb() {
  // Open the IndexedDB database (change version to trigger the on upgrade)
  const request = indexedDB.open("cashFlowDB", 1);

  request.onupgradeneeded = function (event) {
    const db = event.target.result;

    console.log("Database upgrade started...");

    // Create the object stores and indexes only if the database is being created or upgraded
    // Create redditoStore if it doesn't exist
    if (!db.objectStoreNames.contains("redditoStore")) {
      const redditoStore = db.createObjectStore("redditoStore", {
        keyPath: "id",
        autoIncrement: true,
      });
      redditoStore.createIndex("description", "description", { unique: false });
      redditoStore.createIndex("amount", "amount", { unique: false });
    }

    // Create speseStore if it doesn't exist
    if (!db.objectStoreNames.contains("speseStore")) {
      const speseStore = db.createObjectStore("speseStore", {
        keyPath: "id",
        autoIncrement: true,
      });
      speseStore.createIndex("category", "category", { unique: false });
      speseStore.createIndex("amount", "amount", { unique: false });
    }

    // Create attiviStore if it doesn't exist
    if (!db.objectStoreNames.contains("attiviStore")) {
      const attiviStore = db.createObjectStore("attiviStore", {
        keyPath: "id",
        autoIncrement: true,
      });
      attiviStore.createIndex("type", "type", { unique: false });
      attiviStore.createIndex("description", "description", { unique: false });
      attiviStore.createIndex("value", "value", { unique: false });
    }

    // Create passiviStore if it doesn't exist
    if (!db.objectStoreNames.contains("passiviStore")) {
      const passiviStore = db.createObjectStore("passiviStore", {
        keyPath: "id",
        autoIncrement: true,
      });
      passiviStore.createIndex("type", "type", { unique: false });
      passiviStore.createIndex("description", "description", { unique: false });
      passiviStore.createIndex("amount", "amount", { unique: false });
    }

    // Create investmentStore if it doesn't exist
    if (!db.objectStoreNames.contains("investmentStore")) {
      const investmentStore = db.createObjectStore("investmentStore", {
        keyPath: "id",
        autoIncrement: true,
      });
      investmentStore.createIndex("description", "description", {
        unique: false,
      });
      investmentStore.createIndex("cost", "cost", { unique: false });
      investmentStore.createIndex("expectedReturn", "expectedReturn", {
        unique: false,
      });
      investmentStore.createIndex("investmentDate", "investmentDate", {
        unique: false,
      });
    }

    // Create notesStore if it doesn't exist
    if (!db.objectStoreNames.contains("notesStore")) {
      const notesStore = db.createObjectStore("notesStore", {
        keyPath: "id",
        autoIncrement: true,
      });
      notesStore.createIndex("content", "content", { unique: false });
    }

    console.log("Database schema created or upgraded successfully!");
  };

  request.onsuccess = function (event) {
    const db = event.target.result;
    console.log("Database opened successfully:", db);
  };

  request.onerror = function (event) {
    console.error(
      "Error opening or upgrading the database",
      event.target.error
    );
  };
}

export function autoSave() {
  const data = {
    redditoData: [],
    speseData: {},
    passiviData: [],
    attiviData: [],
    investmentsData: [],
    notesData: [],
  };

  // Gathering data from the reddito table
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

  // Gathering data from spese inputs
  const speseInputs = document
    .getElementById("speseTable")
    .querySelectorAll("input");
  speseInputs.forEach((input) => {
    data.speseData[input.id] = input.value || "0";
  });

  // Gathering data from passivi table
  const passiviRows = document
    .getElementById("passiviTable")
    .querySelectorAll("tr");
  passiviRows.forEach((row) => {
    const description = row.cells[0].textContent.trim();
    const value = row.cells[1].querySelector("input").value || "0";
    data.passiviData.push({ description, value });
  });

  // Gathering data from attivi table
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

  // Gathering data from investment table
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

  // Gathering notes data
  const noteItems = document.querySelectorAll("#noteList .note-item");
  noteItems.forEach((noteItem) => {
    const noteText = noteItem.querySelector("input").value || "";
    data.notesData.push(noteText);
  });

  // Open IndexedDB and save data to respective tables
  const dbRequest = indexedDB.open("cashFlowDB", 2);

  dbRequest.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction(
      [
        "redditoStore",
        "speseStore",
        "passiviStore",
        "attiviStore",
        "investmentStore",
        "notesStore",
      ],
      "readwrite"
    );

    // Save data to the corresponding stores
    const redditoStore = transaction.objectStore("redditoStore");
    data.redditoData.forEach((record) => {
      redditoStore.put(record); // Use put() to insert or update records
    });

    const speseStore = transaction.objectStore("speseStore");
    Object.keys(data.speseData).forEach((key) => {
      speseStore.put({ id: key, value: data.speseData[key] });
    });

    const passiviStore = transaction.objectStore("passiviStore");
    data.passiviData.forEach((record) => {
      passiviStore.put(record); // Use put() to insert or update records
    });

    const attiviStore = transaction.objectStore("attiviStore");
    data.attiviData.forEach((record) => {
      attiviStore.put(record); // Use put() to insert or update records
    });

    const investmentStore = transaction.objectStore("investmentStore");
    data.investmentsData.forEach((record) => {
      investmentStore.put(record); // Use put() to insert or update records
    });

    const notesStore = transaction.objectStore("notesStore");
    data.notesData.forEach((noteText) => {
      notesStore.put({ content: noteText }); // Use put() to insert or update records
    });

    // Handle completion and errors
    transaction.oncomplete = function () {
      console.log("Auto-saved data to IndexedDB successfully!");
    };

    transaction.onerror = function (event) {
      console.error("Error auto-saving data to IndexedDB:", event.target.error);
    };
  };

  dbRequest.onerror = function (event) {
    console.error("Error opening IndexedDB:", event.target.error);
  };

  console.log("Auto-saved data to IndexedDB:", data);
}

// Function to load data from IndexedDB
export function loadData() {
  const dbRequest = indexedDB.open("cashFlowDB", 1);

  dbRequest.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction(
      [
        "redditoStore",
        "speseStore",
        "passiviStore",
        "attiviStore",
        "investmentStore",
        "notesStore",
      ],
      "readonly"
    );

    // Load data from the corresponding stores
    const redditoStore = transaction.objectStore("redditoStore");
    const speseStore = transaction.objectStore("speseStore");
    const passiviStore = transaction.objectStore("passiviStore");
    const attiviStore = transaction.objectStore("attiviStore");
    const investmentStore = transaction.objectStore("investmentStore");
    const notesStore = transaction.objectStore("notesStore");

    // Read all data from each store and populate the form or tables
    redditoStore.getAll().onsuccess = function (e) {
      const redditoData = e.target.result;
      // Populate the reddito table/form with the loaded data
      populateTable("redditoTable", redditoData, ["description", "value"]);
    };

    speseStore.getAll().onsuccess = function (e) {
      const speseData = e.target.result;
      // Populate the spese inputs with the loaded data
      populateSpeseData(speseData);
    };

    passiviStore.getAll().onsuccess = function (e) {
      const passiviData = e.target.result;
      // Populate the passivi table/form with the loaded data
      populateTable("passiviTable", passiviData, ["description", "value"]);
    };

    attiviStore.getAll().onsuccess = function (e) {
      const attiviData = e.target.result;
      // Populate the attivi table/form with the loaded data
      populateTable("attiviTable", attiviData, [
        "tipo",
        "descrizione",
        "valore",
      ]);
    };

    investmentStore.getAll().onsuccess = function (e) {
      const investmentData = e.target.result;
      // Populate the investments table/form with the loaded data
      populateTable("investmentTable", investmentData, [
        "description",
        "cost",
        "expectedReturn",
        "investmentDate",
      ]);
    };

    notesStore.getAll().onsuccess = function (e) {
      const notesData = e.target.result;
      // Populate the notes section with the loaded data
      populateNotesData(notesData);
    };
  };

  dbRequest.onerror = function (event) {
    console.error("Error loading data from IndexedDB:", event.target.error);
  };
}

// Helper function to populate a table with data
function populateTable(tableId, data, fields) {
  const table = document.getElementById(tableId);
  data.forEach((item) => {
    const row = table.insertRow();
    fields.forEach((field) => {
      const cell = row.insertCell();
      cell.textContent = item[field] || "";
    });
  });
}

// Helper function to populate spese data inputs
function populateSpeseData(data) {
  data.forEach((item) => {
    const input = document.getElementById(item.id);
    if (input) {
      input.value = item.value || "";
    }
  });
}

// Helper function to populate notes data
function populateNotesData(data) {
  const notesList = document.getElementById("noteList");
  data.forEach((note) => {
    const noteItem = document.createElement("li");
    noteItem.classList.add("note-item");
    const noteInput = document.createElement("input");
    noteInput.value = note.content || "";
    noteItem.appendChild(noteInput);
    notesList.appendChild(noteItem);
  });
}

export function initializeApp() {
  // Initialize the database
  initializeDb();

  // Load existing data from the database
  loadData();

  // Attach the autoSave function to all the necessary form fields
  document.querySelectorAll("input, select").forEach((element) => {
    element.addEventListener("input", autoSave); // Trigger save on input changes
  });
}
