document.addEventListener("DOMContentLoaded", () => {
  // Elementi DOM - Contatti
  const personList = document.getElementById("personList");
  const personCards = document.getElementById("personCards");
  const personListView = document.getElementById("personListView");
  const emptyMessage = document.getElementById("emptyMessage");
  const addBtn = document.getElementById("addBtn");
  const emptyAddBtn = document.getElementById("emptyAddBtn");
  const personModal = document.getElementById("personModal");
  const confirmModal = document.getElementById("confirmModal");
  const modalTitle = document.getElementById("modalTitle");
  const personForm = document.getElementById("personForm");
  const saveBtn = document.getElementById("saveBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const closeModalBtns = document.querySelectorAll(".close-modal");
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const deletePersonName = document.getElementById("deletePersonName");
  const searchInput = document.getElementById("searchInput");
  const viewButtons = document.querySelectorAll(".view-btn");
  const tableView = document.querySelector(".table-view");
  const cardsView = document.querySelector(".cards-view");
  const listView = document.querySelector(".list-view");
  const themeToggleBtn = document.getElementById("themeToggleBtn");

  // Elementi DOM - Navigazione
  const navItems = document.querySelectorAll(".nav-item");
  const contentSections = document.querySelectorAll(".content-section");
  const sectionTitle = document.getElementById("sectionTitle");
  const sectionDescription = document.getElementById("sectionDescription");

  // Elementi DOM - Prefisso Telefonico
  const selectedPrefix = document.getElementById("selectedPrefix");
  const prefixDropdown = document.getElementById("prefixDropdown");
  const prefixSearch = document.getElementById("prefixSearch");
  const prefixList = document.getElementById("prefixList");
  const prefixItems = document.querySelectorAll(".prefix-item");
  const selectedPrefixValue = document.getElementById("selectedPrefixValue");
  const selectedCountryCode = document.getElementById("selectedCountryCode");

  // Elementi DOM - Statistiche
  const totalContactsElement = document.getElementById("totalContacts");
  const emailDomainsElement = document.getElementById("emailDomains");
  const phoneCountriesElement = document.getElementById("phoneCountries");
  const emailChartCanvas = document.getElementById("emailChart");
  const phoneChartCanvas = document.getElementById("phoneChart");
  const exportCSVBtn = document.getElementById("exportCSV");
  const exportExcelBtn = document.getElementById("exportExcel");

  // Elementi DOM - Impostazioni
  const themeSelect = document.getElementById("themeSelect");
  const defaultViewSelect = document.getElementById("defaultViewSelect");
  const defaultPrefixSelect = document.getElementById("defaultPrefixSelect");
  const backupToggle = document.getElementById("backupToggle");
  const dateFormatSelect = document.getElementById("dateFormatSelect");
  const clearDataBtn = document.getElementById("clearDataBtn");
  const resetSettingsBtn = document.getElementById("resetSettingsBtn");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  const clearDataModal = document.getElementById("clearDataModal");
  const cancelClearBtn = document.getElementById("cancelClearBtn");
  const confirmClearBtn = document.getElementById("confirmClearBtn");

  // Campi del form
  const personIdInput = document.getElementById("personId");
  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const emailInput = document.getElementById("email");
  const phoneNumberInput = document.getElementById("phoneNumber");
  const birthDateInput = document.getElementById("birthDate");
  const addressInput = document.getElementById("address");
  const notesInput = document.getElementById("notes");

  // Messaggi di errore
  const firstNameError = document.getElementById("firstNameError");
  const lastNameError = document.getElementById("lastNameError");
  const emailError = document.getElementById("emailError");
  const phoneError = document.getElementById("phoneError");

  // Variabili di stato
  let personToDeleteId = null;
  let allPersons = [];
  let currentView = localStorage.getItem("defaultView") || "table";
  let isDarkTheme = localStorage.getItem("theme") === "dark";
  let emailChart = null;
  let phoneChart = null;
  let currentSection = "contacts";

  // Impostazioni predefinite
  const defaultSettings = {
    theme: "light",
    defaultView: "table",
    defaultPrefix: "+39",
    defaultCountry: "it",
    backupEnabled: false,
    dateFormat: "dd/mm/yyyy"
  };

  // Carica le impostazioni
  loadSettings();

  // Applica il tema salvato
  applyTheme();

  // Inizializza la vista corretta
  initializeView();

  // Carica le persone all'avvio
  loadPersons();

  // Event listeners - Navigazione
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const section = item.getAttribute("data-section");
      switchSection(section);
    });
  });

  // Event listeners - Contatti
  addBtn.addEventListener("click", () => openAddPersonModal());
  emptyAddBtn.addEventListener("click", () => openAddPersonModal());
  saveBtn.addEventListener("click", handleFormSubmit);
  cancelBtn.addEventListener("click", closePersonModal);
  closeModalBtns.forEach((btn) =>
    btn.addEventListener("click", closeAllModals)
  );
  cancelDeleteBtn.addEventListener("click", closeConfirmModal);
  confirmDeleteBtn.addEventListener("click", confirmDelete);

  // Event listeners - Ricerca
  searchInput.addEventListener("input", filterPersons);

  // Event listeners - Viste
  viewButtons.forEach(btn => {
    btn.addEventListener("click", function () {
      const viewType = this.getAttribute("data-view");

      // Aggiorna lo stato attivo dei pulsanti
      viewButtons.forEach(b => b.classList.remove("active"));
      this.classList.add("active");

      // Cambia la vista
      switchView(viewType);
    });
  });

  // Event listeners - Tema
  themeToggleBtn.addEventListener("click", toggleTheme);

  // Event listeners - Prefisso Telefonico
  selectedPrefix.addEventListener("click", togglePrefixDropdown);
  prefixSearch.addEventListener("input", filterPrefixes);
  prefixItems.forEach(item => {
    item.addEventListener("click", () => {
      const prefix = item.getAttribute("data-prefix");
      const country = item.getAttribute("data-country");
      updateSelectedPrefix(prefix, country);
      closePrefixDropdown();
    });
  });

  // Chiudi il dropdown quando si clicca fuori
  document.addEventListener("click", (e) => {
    if (!selectedPrefix.contains(e.target) && !prefixDropdown.contains(e.target)) {
      closePrefixDropdown();
    }
  });

  // Event listeners - Statistiche
  exportCSVBtn.addEventListener("click", exportToCSV);
  exportExcelBtn.addEventListener("click", exportToExcel);

  // Event listeners - Impostazioni
  themeSelect.addEventListener("change", () => {
    const theme = themeSelect.value;
    if (theme === "light") {
      document.body.classList.remove("dark-theme");
      isDarkTheme = false;
    } else if (theme === "dark") {
      document.body.classList.add("dark-theme");
      isDarkTheme = true;
    } else {
      // Auto - usa le preferenze del sistema
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.body.classList.toggle("dark-theme", prefersDark);
      isDarkTheme = prefersDark;
    }
    localStorage.setItem("theme", theme);
    updateThemeToggleButton();

    // Aggiorna i grafici se siamo nella sezione statistiche
    if (currentSection === "statistics") {
      updateCharts();
    }
  });

  defaultViewSelect.addEventListener("change", () => {
    const view = defaultViewSelect.value;
    switchView(view);
    viewButtons.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-view") === view);
    });
  });

  defaultPrefixSelect.addEventListener("change", () => {
    const prefix = defaultPrefixSelect.value;
    const country = defaultPrefixSelect.options[defaultPrefixSelect.selectedIndex].getAttribute("data-country");
    localStorage.setItem("defaultPrefix", prefix);
    localStorage.setItem("defaultCountry", country);
  });

  saveSettingsBtn.addEventListener("click", saveSettings);
  clearDataBtn.addEventListener("click", () => {
    clearDataModal.style.display = "block";
  });

  cancelClearBtn.addEventListener("click", () => {
    clearDataModal.style.display = "none";
  });

  confirmClearBtn.addEventListener("click", clearAllData);
  resetSettingsBtn.addEventListener("click", resetSettings);

  // Validazione per il campo telefono - accetta solo numeri
  phoneNumberInput.addEventListener("input", function (e) {
    this.value = this.value.replace(/[^0-9]/g, "");
    validatePhone();
  });

  // Validazione per i campi del form
  firstNameInput.addEventListener("input", validateFirstName);
  lastNameInput.addEventListener("input", validateLastName);
  emailInput.addEventListener("input", validateEmail);

  // Funzione per inizializzare la vista corretta
  function initializeView() {
    // Imposta la vista corrente in base alle preferenze salvate
    const savedView = localStorage.getItem("defaultView") || "table";
    currentView = savedView;

    // Aggiorna i pulsanti delle viste
    viewButtons.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-view") === savedView);
    });

    // Applica la vista corrente
    switchView(currentView);
  }

  // Funzione per caricare le persone dal server
  async function loadPersons() {
    try {
      const response = await fetch("/api/items");
      const persons = await response.json();

      // Salva tutte le persone
      allPersons = persons;

      // Renderizza le persone
      renderPersons(persons);

      // Aggiorna le statistiche
      updateStatistics();
    } catch (error) {
      console.error("Errore nel caricamento delle persone:", error);
      showToast("Errore nel caricamento delle persone", "error");
    }
  }

  // Funzione per renderizzare le persone
  function renderPersons(persons) {
    // Svuota le liste
    personList.innerHTML = "";
    personCards.innerHTML = "";
    personListView.innerHTML = "";

    // Mostra o nascondi il messaggio "vuoto"
    if (persons.length === 0) {
      emptyMessage.style.display = "block";
      tableView.style.display = "none";
      cardsView.style.display = "none";
      listView.style.display = "none";
    } else {
      emptyMessage.style.display = "none";

      // Nascondi tutte le viste
      tableView.style.display = "none";
      cardsView.style.display = "none";
      listView.style.display = "none";

      // Mostra solo la vista corrente
      if (currentView === "table") {
        tableView.style.display = "block";
      } else if (currentView === "cards") {
        cardsView.style.display = "block";
      } else if (currentView === "list") {
        listView.style.display = "block";
      }

      // Aggiungi ogni persona alle viste
      persons.forEach((person) => {
        const row = createPersonRow(person);
        personList.appendChild(row);

        const card = createPersonCard(person);
        personCards.appendChild(card);

        const listItem = createPersonListItem(person);
        personListView.appendChild(listItem);
      });
    }
  }

  // Funzione per creare una riga della tabella per una persona
  function createPersonRow(person) {
    const tr = document.createElement("tr");

    // Crea le celle con i dati della persona
    const firstName = document.createElement("td");
    firstName.textContent = person.firstName || "";

    const lastName = document.createElement("td");
    lastName.textContent = person.lastName || "";

    const email = document.createElement("td");
    email.textContent = person.email || "";

    const phone = document.createElement("td");
    phone.textContent = person.phone || "";

    // Crea la cella per le azioni
    const actions = document.createElement("td");
    actions.className = "action-btns";

    // Pulsante modifica
    const editBtn = document.createElement("button");
    editBtn.className = "btn edit-btn";
    editBtn.innerHTML = '<i class="fas fa-pen"></i>';
    editBtn.addEventListener("click", () => openEditPersonModal(person));

    // Pulsante elimina
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn delete-btn";
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.addEventListener("click", () => openDeleteConfirmation(person));

    // Aggiungi i pulsanti alla cella delle azioni
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    // Aggiungi tutte le celle alla riga
    tr.appendChild(firstName);
    tr.appendChild(lastName);
    tr.appendChild(email);
    tr.appendChild(phone);
    tr.appendChild(actions);

    return tr;
  }

  // Funzione per creare una card per una persona
  function createPersonCard(person) {
    const card = document.createElement("div");
    card.className = "person-card";

    // Crea l'avatar con le iniziali
    const initials = `${person.firstName?.charAt(0) || ""}${person.lastName?.charAt(0) || ""}`.toUpperCase();

    card.innerHTML = `
      <div class="card-header">
        <div class="avatar">${initials}</div>
        <div class="card-name">
          <h3>${person.firstName || ""} ${person.lastName || ""}</h3>
          <p>${person.email || ""}</p>
        </div>
      </div>
      <div class="card-info">
        ${person.phone ? `<div class="info-item"><i class="fas fa-phone"></i>${person.phone}</div>` : ''}
        ${person.birthDate ? `<div class="info-item"><i class="fas fa-calendar"></i>${formatDate(person.birthDate)}</div>` : ''}
        ${person.address ? `<div class="info-item"><i class="fas fa-map-marker-alt"></i>${person.address}</div>` : ''}
      </div>
      <div class="card-actions">
        <button class="btn edit-btn"><i class="fas fa-pen"></i></button>
        <button class="btn delete-btn"><i class="fas fa-trash"></i></button>
      </div>
    `;

    // Aggiungi event listeners ai pulsanti
    card.querySelector(".edit-btn").addEventListener("click", () => openEditPersonModal(person));
    card.querySelector(".delete-btn").addEventListener("click", () => openDeleteConfirmation(person));

    return card;
  }

  // Funzione per creare un elemento lista per una persona
  function createPersonListItem(person) {
    const li = document.createElement("li");
    li.className = "list-item";

    // Crea l'avatar con le iniziali
    const initials = `${person.firstName?.charAt(0) || ""}${person.lastName?.charAt(0) || ""}`.toUpperCase();

    li.innerHTML = `
      <div class="list-avatar">${initials}</div>
      <div class="list-details">
        <div class="list-name">${person.firstName || ""} ${person.lastName || ""}</div>
        <div class="list-contact">
          <span class="list-email"><i class="fas fa-envelope"></i>${person.email || ""}</span>
          ${person.phone ? `<span class="list-phone"><i class="fas fa-phone"></i>${person.phone}</span>` : ''}
        </div>
      </div>
      <div class="list-actions">
        <button class="btn edit-btn"><i class="fas fa-pen"></i></button>
        <button class="btn delete-btn"><i class="fas fa-trash"></i></button>
      </div>
    `;

    // Aggiungi event listeners ai pulsanti
    li.querySelector(".edit-btn").addEventListener("click", () => openEditPersonModal(person));
    li.querySelector(".delete-btn").addEventListener("click", () => openDeleteConfirmation(person));

    return li;
  }

  // Funzione per formattare la data
  function formatDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    const format = localStorage.getItem("dateFormat") || "dd/mm/yyyy";

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    if (format === "dd/mm/yyyy") {
      return `${day}/${month}/${year}`;
    } else if (format === "mm/dd/yyyy") {
      return `${month}/${day}/${year}`;
    } else {
      return `${year}-${month}-${day}`;
    }
  }

  // Funzione per filtrare le persone
  function filterPersons() {
    const searchTerm = searchInput.value.toLowerCase();

    if (!searchTerm) {
      renderPersons(allPersons);
      return;
    }

    const filteredPersons = allPersons.filter(person => {
      return (
        (person.firstName || "").toLowerCase().includes(searchTerm) ||
        (person.lastName || "").toLowerCase().includes(searchTerm) ||
        (person.email || "").toLowerCase().includes(searchTerm) ||
        (person.phone || "").toLowerCase().includes(searchTerm) ||
        (person.address || "").toLowerCase().includes(searchTerm)
      );
    });

    renderPersons(filteredPersons);
  }

  // Funzione per filtrare i prefissi
  function filterPrefixes() {
    const searchTerm = prefixSearch.value.toLowerCase();
    const items = prefixList.querySelectorAll(".prefix-item");

    items.forEach(item => {
      const country = item.querySelector(".prefix-country").textContent.toLowerCase();
      const code = item.querySelector(".prefix-code").textContent.toLowerCase();

      if (country.includes(searchTerm) || code.includes(searchTerm)) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
  }

  // Funzione per cambiare vista
  function switchView(viewType) {
    // Aggiorna la variabile di stato
    currentView = viewType;

    // Nascondi tutte le viste
    tableView.style.display = "none";
    cardsView.style.display = "none";
    listView.style.display = "none";

    // Mostra solo la vista selezionata
    if (viewType === "table") {
      tableView.style.display = "block";
    } else if (viewType === "cards") {
      cardsView.style.display = "block";
    } else if (viewType === "list") {
      listView.style.display = "block";
    }

    // Salva la preferenza
    localStorage.setItem("defaultView", viewType);
  }

  // Funzione per cambiare sezione
  function switchSection(section) {
    currentSection = section;

    // Aggiorna la classe attiva nei link di navigazione
    navItems.forEach(item => {
      item.classList.toggle("active", item.getAttribute("data-section") === section);
    });

    // Mostra la sezione corretta
    contentSections.forEach(s => {
      s.classList.toggle("active", s.id === `${section}Section`);
    });

    // Aggiorna il titolo e la descrizione
    if (section === "contacts") {
      sectionTitle.textContent = "Gestione Anagrafica";
      sectionDescription.textContent = "Gestisci i dati delle persone in modo semplice ed efficiente";
      searchInput.placeholder = "Cerca persona...";
      document.querySelector(".search-container").style.display = "flex";
    } else if (section === "statistics") {
      sectionTitle.textContent = "Statistiche";
      sectionDescription.textContent = "Visualizza statistiche e analisi dei dati";
      document.querySelector(".search-container").style.display = "none";
      updateStatistics();
    } else if (section === "settings") {
      sectionTitle.textContent = "Impostazioni";
      sectionDescription.textContent = "Personalizza l'applicazione secondo le tue preferenze";
      document.querySelector(".search-container").style.display = "none";
    }
  }

  // Funzione per cambiare tema
  function toggleTheme() {
    isDarkTheme = !isDarkTheme;

    if (isDarkTheme) {
      document.body.classList.add("dark-theme");
      themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i><span>Tema Chiaro</span>';
      themeSelect.value = "dark";
    } else {
      document.body.classList.remove("dark-theme");
      themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i><span>Tema Scuro</span>';
      themeSelect.value = "light";
    }

    // Salva la preferenza
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");

    // Aggiorna i grafici
    if (currentSection === "statistics") {
      updateCharts();
    }
  }

  // Funzione per applicare il tema
  function applyTheme() {
    const theme = localStorage.getItem("theme");

    if (theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.body.classList.add("dark-theme");
      themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i><span>Tema Chiaro</span>';
      isDarkTheme = true;
    } else {
      document.body.classList.remove("dark-theme");
      themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i><span>Tema Scuro</span>';
      isDarkTheme = false;
    }
  }

  // Funzione per aggiornare il pulsante del tema
  function updateThemeToggleButton() {
    const theme = localStorage.getItem("theme");

    if (theme === "dark") {
      themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i><span>Tema Chiaro</span>';
    } else if (theme === "light") {
      themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i><span>Tema Scuro</span>';
    } else {
      // Auto
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      themeToggleBtn.innerHTML = prefersDark ?
        '<i class="fas fa-sun"></i><span>Tema Chiaro</span>' :
        '<i class="fas fa-moon"></i><span>Tema Scuro</span>';
    }
  }

  // Funzione per mostrare/nascondere il dropdown dei prefissi
  function togglePrefixDropdown() {
    prefixDropdown.classList.toggle("show");
    if (prefixDropdown.classList.contains("show")) {
      prefixSearch.focus();
    }
  }

  // Funzione per chiudere il dropdown dei prefissi
  function closePrefixDropdown() {
    prefixDropdown.classList.remove("show");
  }

  // Funzione per aggiornare il prefisso selezionato
  function updateSelectedPrefix(prefix, country) {
    selectedPrefix.innerHTML = `
      <span class="fi fi-${country}"></span>
      <span class="prefix-text">${prefix}</span>
      <i class="fas fa-chevron-down"></i>
    `;
    selectedPrefixValue.value = prefix;
    selectedCountryCode.value = country;
  }

  // Funzione per aggiornare le statistiche
  function updateStatistics() {
    if (!allPersons.length) {
      totalContactsElement.textContent = "0";
      emailDomainsElement.textContent = "0";
      phoneCountriesElement.textContent = "0";

      // Inizializza grafici vuoti
      updateCharts({}, {});
      return;
    }

    // Totale contatti
    totalContactsElement.textContent = allPersons.length;

    // Domini email
    const emailDomains = {};
    allPersons.forEach(person => {
      if (person.email) {
        const domain = person.email.split('@')[1];
        if (domain) {
          emailDomains[domain] = (emailDomains[domain] || 0) + 1;
        }
      }
    });
    emailDomainsElement.textContent = Object.keys(emailDomains).length;

    // Prefissi telefonici
    const phoneCountries = {};
    allPersons.forEach(person => {
      if (person.phone) {
        const prefix = person.phone.split(' ')[0];
        if (prefix && prefix.startsWith('+')) {
          phoneCountries[prefix] = (phoneCountries[prefix] || 0) + 1;
        }
      }
    });
    phoneCountriesElement.textContent = Object.keys(phoneCountries).length;

    // Aggiorna i grafici
    updateCharts(emailDomains, phoneCountries);
  }

  // Funzione per aggiornare i grafici
  function updateCharts(emailDomains = {}, phoneCountries = {}) {
    const textColor = isDarkTheme ? '#f5f6fa' : '#2d3436';
    const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    // Configurazione comune
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: gridColor
          },
          ticks: {
            color: textColor
          }
        },
        x: {
          grid: {
            color: gridColor
          },
          ticks: {
            color: textColor
          }
        }
      }
    };

    // Grafico domini email
    const emailDomainsData = {
      labels: Object.keys(emailDomains),
      datasets: [{
        label: 'Numero di contatti',
        data: Object.values(emailDomains),
        backgroundColor: [
          'rgba(108, 92, 231, 0.7)',
          'rgba(162, 155, 254, 0.7)',
          'rgba(46, 204, 113, 0.7)',
          'rgba(52, 152, 219, 0.7)',
          'rgba(155, 89, 182, 0.7)',
          'rgba(241, 196, 15, 0.7)',
          'rgba(230, 126, 34, 0.7)',
          'rgba(231, 76, 60, 0.7)'
        ],
        borderColor: [
          'rgba(108, 92, 231, 1)',
          'rgba(162, 155, 254, 1)',
          'rgba(46, 204, 113, 1)',
          'rgba(52, 152, 219, 1)',
          'rgba(155, 89, 182, 1)',
          'rgba(241, 196, 15, 1)',
          'rgba(230, 126, 34, 1)',
          'rgba(231, 76, 60, 1)'
        ],
        borderWidth: 1
      }]
    };

    // Grafico prefissi telefonici
    const phoneCountriesData = {
      labels: Object.keys(phoneCountries),
      datasets: [{
        label: 'Numero di contatti',
        data: Object.values(phoneCountries),
        backgroundColor: [
          'rgba(108, 92, 231, 0.7)',
          'rgba(162, 155, 254, 0.7)',
          'rgba(46, 204, 113, 0.7)',
          'rgba(52, 152, 219, 0.7)',
          'rgba(155, 89, 182, 0.7)',
          'rgba(241, 196, 15, 0.7)',
          'rgba(230, 126, 34, 0.7)',
          'rgba(231, 76, 60, 0.7)'
        ],
        borderColor: [
          'rgba(108, 92, 231, 1)',
          'rgba(162, 155, 254, 1)',
          'rgba(46, 204, 113, 1)',
          'rgba(52, 152, 219, 1)',
          'rgba(155, 89, 182, 1)',
          'rgba(241, 196, 15, 1)',
          'rgba(230, 126, 34, 1)',
          'rgba(231, 76, 60, 1)'
        ],
        borderWidth: 1
      }]
    };

    // Distruggi i grafici esistenti se presenti
    if (emailChart) emailChart.destroy();
    if (phoneChart) phoneChart.destroy();

    // Crea nuovi grafici
    emailChart = new Chart(emailChartCanvas, {
      type: 'pie',
      data: emailDomainsData,
      options: {
        ...chartOptions,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: textColor
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    phoneChart = new Chart(phoneChartCanvas, {
      type: 'bar',
      data: phoneCountriesData,
      options: chartOptions
    });
  }

  // Funzione per esportare in CSV
  function exportToCSV() {
    if (!allPersons.length) {
      showToast("Non ci sono dati da esportare", "info");
      return;
    }

    // Intestazioni CSV
    const headers = ["ID", "Nome", "Cognome", "Email", "Telefono", "Data di Nascita", "Indirizzo", "Note"];

    // Righe dati
    const rows = allPersons.map(person => [
      person.id,
      person.firstName || "",
      person.lastName || "",
      person.email || "",
      person.phone || "",
      person.birthDate || "",
      person.address || "",
      person.notes || ""
    ]);

    // Combina intestazioni e righe
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    // Crea un blob e un link per il download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "contatti.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Esportazione CSV completata", "success");
  }

  // Funzione per esportare in Excel
  function exportToExcel() {
    if (!allPersons.length) {
      showToast("Non ci sono dati da esportare", "info");
      return;
    }

    // Crea un array di oggetti per l'esportazione
    const data = allPersons.map(person => ({
      ID: person.id,
      Nome: person.firstName || "",
      Cognome: person.lastName || "",
      Email: person.email || "",
      Telefono: person.phone || "",
      "Data di Nascita": person.birthDate || "",
      Indirizzo: person.address || "",
      Note: person.notes || ""
    }));

    // Converti in XML per Excel
    let xml = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
    xml += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
    xml += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
    xml += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
    xml += 'xmlns:html="http://www.w3.org/TR/REC-html40">';

    // Aggiungi foglio di lavoro
    xml += '<Worksheet ss:Name="Contatti">';
    xml += '<Table>';

    // Intestazioni
    xml += '<Row>';
    for (const key in data[0]) {
      xml += `<Cell><Data ss:Type="String">${key}</Data></Cell>`;
    }
    xml += '</Row>';

    // Dati
    data.forEach(item => {
      xml += '<Row>';
      for (const key in item) {
        const value = item[key] !== null && item[key] !== undefined ? item[key] : "";
        xml += `<Cell><Data ss:Type="String">${value}</Data></Cell>`;
      }
      xml += '</Row>';
    });

    xml += '</Table></Worksheet></Workbook>';

    // Crea un blob e un link per il download
    const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "contatti.xls");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Esportazione Excel completata", "success");
  }

  // Funzione per cancellare tutti i dati
  async function clearAllData() {
    try {
      // Cancella tutti i contatti uno per uno
      for (const person of allPersons) {
        await fetch(`/api/items/${person.id}`, {
          method: "DELETE"
        });
      }

      // Aggiorna la lista
      allPersons = [];
      renderPersons([]);
      updateStatistics();

      // Chiudi il modal
      clearDataModal.style.display = "none";

      showToast("Tutti i dati sono stati cancellati", "success");
    } catch (error) {
      console.error("Errore nella cancellazione dei dati:", error);
      showToast("Errore nella cancellazione dei dati", "error");
    }
  }

  // Funzione per salvare le impostazioni
  function saveSettings() {
    const settings = {
      theme: themeSelect.value,
      defaultView: defaultViewSelect.value,
      defaultPrefix: defaultPrefixSelect.value,
      defaultCountry: defaultPrefixSelect.options[defaultPrefixSelect.selectedIndex].getAttribute("data-country"),
      backupEnabled: backupToggle.checked,
      dateFormat: dateFormatSelect.value
    };

    // Salva le impostazioni in localStorage
    for (const key in settings) {
      localStorage.setItem(key, settings[key]);
    }

    // Applica le impostazioni
    applyTheme();
    switchView(settings.defaultView);

    // Aggiorna i pulsanti delle viste
    viewButtons.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-view") === settings.defaultView);
    });

    showToast("Impostazioni salvate con successo", "success");
  }

  // Funzione per caricare le impostazioni
  function loadSettings() {
    // Carica le impostazioni da localStorage o usa i valori predefiniti
    const theme = localStorage.getItem("theme") || defaultSettings.theme;
    const defaultView = localStorage.getItem("defaultView") || defaultSettings.defaultView;
    const defaultPrefix = localStorage.getItem("defaultPrefix") || defaultSettings.defaultPrefix;
    const defaultCountry = localStorage.getItem("defaultCountry") || defaultSettings.defaultCountry;
    const backupEnabled = localStorage.getItem("backupEnabled") === "true";
    const dateFormat = localStorage.getItem("dateFormat") || defaultSettings.dateFormat;

    // Imposta i valori nei controlli
    themeSelect.value = theme;
    defaultViewSelect.value = defaultView;
    defaultPrefixSelect.value = defaultPrefix;
    backupToggle.checked = backupEnabled;
    dateFormatSelect.value = dateFormat;

    // Imposta la vista corrente
    currentView = defaultView;
  }

  // Funzione per ripristinare le impostazioni predefinite
  function resetSettings() {
    // Ripristina i valori predefiniti
    themeSelect.value = defaultSettings.theme;
    defaultViewSelect.value = defaultSettings.defaultView;
    defaultPrefixSelect.value = defaultSettings.defaultPrefix;
    backupToggle.checked = defaultSettings.backupEnabled;
    dateFormatSelect.value = defaultSettings.dateFormat;

    // Salva le impostazioni
    saveSettings();

    showToast("Impostazioni ripristinate", "success");
  }

  // Funzioni di validazione
  function validateFirstName() {
    const value = firstNameInput.value.trim();
    if (!value) {
      firstNameError.textContent = "Il nome è obbligatorio";
      return false;
    }
    firstNameError.textContent = "";
    return true;
  }

  function validateLastName() {
    const value = lastNameInput.value.trim();
    if (!value) {
      lastNameError.textContent = "Il cognome è obbligatorio";
      return false;
    }
    lastNameError.textContent = "";
    return true;
  }

  function validateEmail() {
    const value = emailInput.value.trim();
    if (!value) {
      emailError.textContent = "L'email è obbligatoria";
      return false;
    }

    // Regex per validare l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      emailError.textContent = "Inserisci un indirizzo email valido";
      return false;
    }

    emailError.textContent = "";
    return true;
  }

  function validatePhone() {
    const phoneNumber = phoneNumberInput.value.trim();

    if (phoneNumber && phoneNumber.length !== 10) {
      phoneError.textContent = "Il numero di telefono deve avere 10 cifre";
      return false;
    }

    phoneError.textContent = "";
    return true;
  }

  // Funzione per validare tutti i campi
  function validateForm() {
    const isFirstNameValid = validateFirstName();
    const isLastNameValid = validateLastName();
    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();

    return isFirstNameValid && isLastNameValid && isEmailValid && isPhoneValid;
  }

  // Funzione per aprire il modal per aggiungere una persona
  function openAddPersonModal() {
    modalTitle.textContent = "Aggiungi Persona";
    personForm.reset();
    personIdInput.value = "";

    // Resetta i messaggi di errore
    firstNameError.textContent = "";
    lastNameError.textContent = "";
    emailError.textContent = "";
    phoneError.textContent = "";

    // Imposta il prefisso predefinito
    const defaultPrefix = localStorage.getItem("defaultPrefix") || "+39";
    const defaultCountry = localStorage.getItem("defaultCountry") || "it";
    updateSelectedPrefix(defaultPrefix, defaultCountry);

    personModal.style.display = "block";
    firstNameInput.focus();
  }

  // Funzione per aprire il modal per modificare una persona
  function openEditPersonModal(person) {
    modalTitle.textContent = "Modifica Persona";

    // Resetta i messaggi di errore
    firstNameError.textContent = "";
    lastNameError.textContent = "";
    emailError.textContent = "";
    phoneError.textContent = "";

    // Popola il form con i dati della persona
    personIdInput.value = person.id;
    firstNameInput.value = person.firstName || "";
    lastNameInput.value = person.lastName || "";
    emailInput.value = person.email || "";

    // Gestisci il numero di telefono con prefisso
    if (person.phone) {
      // Cerca di estrarre il prefisso e il numero
      const phoneMatch = person.phone.match(/^(\+\d+)\s*(.*)$/);
      if (phoneMatch) {
        updateSelectedPrefix(phoneMatch[1], getCountryCodeFromPrefix(phoneMatch[1]));
        phoneNumberInput.value = phoneMatch[2];
      } else {
        // Se non c'è un formato riconoscibile, usa il prefisso predefinito
        const defaultPrefix = localStorage.getItem("defaultPrefix") || "+39";
        const defaultCountry = localStorage.getItem("defaultCountry") || "it";
        updateSelectedPrefix(defaultPrefix, defaultCountry);
        phoneNumberInput.value = person.phone;
      }
    } else {
      const defaultPrefix = localStorage.getItem("defaultPrefix") || "+39";
      const defaultCountry = localStorage.getItem("defaultCountry") || "it";
      updateSelectedPrefix(defaultPrefix, defaultCountry);
      phoneNumberInput.value = "";
    }

    birthDateInput.value = person.birthDate || "";
    addressInput.value = person.address || "";
    notesInput.value = person.notes || "";

    personModal.style.display = "block";
    firstNameInput.focus();
  }

  // Funzione per ottenere il codice paese dal prefisso
  function getCountryCodeFromPrefix(prefix) {
    const prefixMap = {
      "+39": "it",
      "+1": "us",
      "+44": "gb",
      "+33": "fr",
      "+49": "de",
      "+34": "es",
      "+41": "ch",
      "+43": "at",
      "+32": "be",
      "+31": "nl",
      "+351": "pt",
      "+30": "gr",
      "+46": "se",
      "+47": "no",
      "+45": "dk",
      "+358": "fi",
      "+48": "pl",
      "+36": "hu",
      "+420": "cz",
      "+7": "ru"
    };

    return prefixMap[prefix] || "it";
  }

  // Funzione per aprire la conferma di eliminazione
  function openDeleteConfirmation(person) {
    personToDeleteId = person.id;
    const fullName = `${person.firstName || ""} ${person.lastName || ""
      }`.trim();
    deletePersonName.textContent = fullName || "ID: " + person.id;
    confirmModal.style.display = "block";
  }

  // Funzione per gestire l'invio del form
  async function handleFormSubmit() {
    // Valida il form
    if (!validateForm()) {
      return;
    }

    // Formatta il numero di telefono con prefisso
    const prefix = selectedPrefixValue.value;
    const phoneNumber = phoneNumberInput.value.trim();
    const fullPhone = phoneNumber ? `${prefix} ${phoneNumber}` : "";

    // Raccogli i dati dal form
    const personData = {
      firstName: firstNameInput.value.trim(),
      lastName: lastNameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: fullPhone,
      birthDate: birthDateInput.value || "",
      address: addressInput.value.trim() || "",
      notes: notesInput.value.trim() || "",
    };

    const id = personIdInput.value;

    try {
      let response;

      if (id) {
        // Aggiorna una persona esistente
        response = await fetch(`/api/items/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(personData),
        });

        if (response.ok) {
          closePersonModal();
          loadPersons();
          showToast("Persona aggiornata con successo", "success");
        } else {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Errore nell'aggiornamento della persona"
          );
        }
      } else {
        // Aggiungi una nuova persona
        response = await fetch("/api/items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(personData),
        });

        if (response.ok) {
          closePersonModal();
          loadPersons();
          showToast("Persona aggiunta con successo", "success");
        } else {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Errore nell'aggiunta della persona"
          );
        }
      }
    } catch (error) {
      console.error("Errore nella gestione del form:", error);
      showToast(error.message, "error");
    }
  }

  // Funzione per confermare l'eliminazione
  async function confirmDelete() {
    if (!personToDeleteId) return;

    try {
      const response = await fetch(`/api/items/${personToDeleteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        closeConfirmModal();
        loadPersons();
        showToast("Persona eliminata con successo", "success");
      } else {
        if (response.status !== 204) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Errore nell'eliminazione della persona"
          );
        }
      }
    } catch (error) {
      console.error("Errore nell'eliminazione:", error);
      showToast(error.message, "error");
    }
  }

  // Funzioni per chiudere i modal
  function closePersonModal() {
    personModal.style.display = "none";
    personForm.reset();
  }

  function closeConfirmModal() {
    confirmModal.style.display = "none";
    personToDeleteId = null;
  }

  function closeAllModals() {
    personModal.style.display = "none";
    confirmModal.style.display = "none";
    clearDataModal.style.display = "none";
    personForm.reset();
    personToDeleteId = null;
  }

  // Funzione per mostrare toast notifications
  function showToast(message, type) {
    const toastContainer = document.getElementById("toastContainer");

    // Crea un nuovo toast
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    // Aggiungi l'icona appropriata
    let icon;
    if (type === "success") {
      icon = "check-circle";
    } else if (type === "error") {
      icon = "exclamation-circle";
    } else {
      icon = "info-circle";
    }

    toast.innerHTML = `
      <i class="fas fa-${icon}"></i>
      <span>${message}</span>
    `;

    // Aggiungi il toast al container
    toastContainer.appendChild(toast);

    // Rimuovi il toast dopo 3 secondi
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(50px)";

      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  // Chiudi i modal se si clicca fuori da essi
  window.addEventListener("click", (e) => {
    if (e.target === personModal) {
      closePersonModal();
    }
    if (e.target === confirmModal) {
      closeConfirmModal();
    }
    if (e.target === clearDataModal) {
      clearDataModal.style.display = "none";
    }
  });
});