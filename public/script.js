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
  const selectedPrefixValue = document.getElementById("selectedPrefixValue");
  const selectedCountryCode = document.getElementById("selectedCountryCode");

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

  // Carica i paesi dal file JSON
  loadCountries();

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

  // Chiudi il dropdown quando si clicca fuori
  document.addEventListener("click", (e) => {
    if (!selectedPrefix.contains(e.target) && !prefixDropdown.contains(e.target)) {
      closePrefixDropdown();
    }
  });

  // Event listeners - Impostazioni
  themeSelect.addEventListener("change", () => {
    // Mostra un'anteprima del tema selezionato
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
    updateThemeToggleButton();
  });

  defaultViewSelect.addEventListener("change", () => {
    // Mostra un'anteprima della vista selezionata
    const view = defaultViewSelect.value;
    switchView(view);
    viewButtons.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-view") === view);
    });
  });

  defaultPrefixSelect.addEventListener("change", () => {
    // Mostra un'anteprima del prefisso selezionato
    const prefix = defaultPrefixSelect.value;
    const country = defaultPrefixSelect.options[defaultPrefixSelect.selectedIndex].getAttribute("data-country");
    updateSelectedPrefix(prefix, country);
  });

  dateFormatSelect.addEventListener("change", () => {
    // Se ci sono persone, aggiorna la visualizzazione per mostrare il nuovo formato data
    if (allPersons.length > 0 && currentView === "cards") {
      renderPersons(allPersons);
    }
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

  // Funzione per caricare i paesi dal file JSON
  async function loadCountries() {
    try {
      const response = await fetch('countries.json');
      const data = await response.json();

      // Popola il dropdown dei prefissi
      const prefixList = document.getElementById('prefixList');
      prefixList.innerHTML = '';

      // Popola anche il select nelle impostazioni
      const defaultPrefixSelect = document.getElementById('defaultPrefixSelect');
      defaultPrefixSelect.innerHTML = '';

      data.countries.forEach(country => {
        // Aggiungi al dropdown dei prefissi
        const prefixItem = document.createElement('div');
        prefixItem.className = 'prefix-item';
        prefixItem.dataset.prefix = country.prefix;
        prefixItem.dataset.country = country.code;

        prefixItem.innerHTML = `
          <span class="fi fi-${country.code}"></span>
          <span class="prefix-country">${country.name}</span>
          <span class="prefix-code">${country.prefix}</span>
        `;

        prefixItem.addEventListener('click', function () {
          updateSelectedPrefix(country.prefix, country.code);
          closePrefixDropdown();
        });

        prefixList.appendChild(prefixItem);

        // Aggiungi all'elenco delle impostazioni
        const option = document.createElement('option');
        option.value = country.prefix;
        option.dataset.country = country.code;
        option.textContent = `${country.name} (${country.prefix})`;

        // Seleziona l'Italia come predefinito
        if (country.code === 'it') {
          option.selected = true;
        }

        defaultPrefixSelect.appendChild(option);
      });

    } catch (error) {
      console.error('Errore nel caricamento dei paesi:', error);
      showToast('Errore nel caricamento dei prefissi telefonici', 'error');
    }
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

    // Applica immediatamente le impostazioni
    applySettings(settings);

    showToast("Impostazioni salvate con successo", "success");
  }

  // Funzione per applicare le impostazioni
  function applySettings(settings) {
    // Applica il tema
    if (settings.theme === "dark") {
      document.body.classList.add("dark-theme");
      isDarkTheme = true;
    } else if (settings.theme === "light") {
      document.body.classList.remove("dark-theme");
      isDarkTheme = false;
    } else {
      // Auto - usa le preferenze del sistema
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.body.classList.toggle("dark-theme", prefersDark);
      isDarkTheme = prefersDark;
    }
    updateThemeToggleButton();

    // Applica la vista predefinita
    currentView = settings.defaultView;
    switchView(settings.defaultView);
    viewButtons.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-view") === settings.defaultView);
    });

    // Applica il prefisso predefinito
    updateSelectedPrefix(settings.defaultPrefix, settings.defaultCountry);

    // Se ci sono persone e siamo nella vista cards, aggiorna per il nuovo formato data
    if (allPersons.length > 0 && currentView === "cards") {
      renderPersons(allPersons);
    }
  }

  // Funzione per caricare le impostazioni
  function loadSettings() {
    // Carica le impostazioni da localStorage o usa i valori predefiniti
    const settings = {
      theme: localStorage.getItem("theme") || defaultSettings.theme,
      defaultView: localStorage.getItem("defaultView") || defaultSettings.defaultView,
      defaultPrefix: localStorage.getItem("defaultPrefix") || defaultSettings.defaultPrefix,
      defaultCountry: localStorage.getItem("defaultCountry") || defaultSettings.defaultCountry,
      backupEnabled: localStorage.getItem("backupEnabled") === "true",
      dateFormat: localStorage.getItem("dateFormat") || defaultSettings.dateFormat
    };

    // Imposta i valori nei controlli
    themeSelect.value = settings.theme;
    defaultViewSelect.value = settings.defaultView;
    backupToggle.checked = settings.backupEnabled;
    dateFormatSelect.value = settings.dateFormat;

    // Imposta la vista corrente
    currentView = settings.defaultView;

    // Applica le impostazioni
    applySettings(settings);
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
    // Cerca il codice paese nel select delle impostazioni
    const options = defaultPrefixSelect.options;
    for (let i = 0; i < options.length; i++) {
      if (options[i].value === prefix) {
        return options[i].getAttribute("data-country");
      }
    }
    return "it"; // Default a Italia se non trovato
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

  // Applica il tema all'avvio
  applyTheme();
});

// Aggiungi dopo la dichiarazione delle variabili DOM - Impostazioni
const prefixSettingsSearch = document.createElement("input");
prefixSettingsSearch.type = "text";
prefixSettingsSearch.placeholder = "Cerca paese o prefisso...";
prefixSettingsSearch.className = "settings-search";
prefixSettingsSearch.id = "prefixSettingsSearch";

// Aggiungi dopo il caricamento delle impostazioni (loadSettings())
// Aggiungi il campo di ricerca per i prefissi nelle impostazioni
function setupPrefixSettingsSearch() {
  const prefixSettingControl = defaultPrefixSelect.parentElement;
  prefixSettingControl.insertBefore(prefixSettingsSearch, defaultPrefixSelect);

  prefixSettingsSearch.addEventListener("input", filterPrefixSettings);
}

// Funzione per filtrare i prefissi nelle impostazioni
function filterPrefixSettings() {
  const searchTerm = prefixSettingsSearch.value.toLowerCase();
  const options = defaultPrefixSelect.options;

  for (let i = 0; i < options.length; i++) {
    const optionText = options[i].textContent.toLowerCase();
    const optionValue = options[i].value.toLowerCase();

    if (optionText.includes(searchTerm) || optionValue.includes(searchTerm)) {
      options[i].style.display = "";
    } else {
      options[i].style.display = "none";
    }
  }
}

// Modifica la funzione loadCountries() per chiamare setupPrefixSettingsSearch dopo aver caricato i paesi
async function loadCountries() {
  try {
    const response = await fetch('countries.json');
    const data = await response.json();

    // Popola il dropdown dei prefissi
    const prefixList = document.getElementById('prefixList');
    prefixList.innerHTML = '';

    // Popola anche il select nelle impostazioni
    const defaultPrefixSelect = document.getElementById('defaultPrefixSelect');
    defaultPrefixSelect.innerHTML = '';

    data.countries.forEach(country => {
      // Aggiungi al dropdown dei prefissi
      const prefixItem = document.createElement('div');
      prefixItem.className = 'prefix-item';
      prefixItem.dataset.prefix = country.prefix;
      prefixItem.dataset.country = country.code;

      prefixItem.innerHTML = `
        <span class="fi fi-${country.code}"></span>
        <span class="prefix-country">${country.name}</span>
        <span class="prefix-code">${country.prefix}</span>
      `;

      prefixItem.addEventListener('click', function () {
        updateSelectedPrefix(country.prefix, country.code);
        closePrefixDropdown();
      });

      prefixList.appendChild(prefixItem);

      // Aggiungi all'elenco delle impostazioni
      const option = document.createElement('option');
      option.value = country.prefix;
      option.dataset.country = country.code;
      option.textContent = `${country.name} (${country.prefix})`;

      // Seleziona l'Italia come predefinito
      if (country.code === 'it') {
        option.selected = true;
      }

      defaultPrefixSelect.appendChild(option);
    });

    // Aggiungi il campo di ricerca per i prefissi nelle impostazioni
    setupPrefixSettingsSearch();

  } catch (error) {
    console.error('Errore nel caricamento dei paesi:', error);
    showToast('Errore nel caricamento dei prefissi telefonici', 'error');
  }
}