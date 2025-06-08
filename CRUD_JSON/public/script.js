document.addEventListener("DOMContentLoaded", () => {
  // Elementi DOM
  const personList = document.getElementById("personList");
  const emptyMessage = document.getElementById("emptyMessage");
  const addBtn = document.getElementById("addBtn");
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

  // Campi del form
  const personIdInput = document.getElementById("personId");
  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const birthDateInput = document.getElementById("birthDate");
  const addressInput = document.getElementById("address");
  const notesInput = document.getElementById("notes");

  // Variabile per memorizzare l'ID della persona da eliminare
  let personToDeleteId = null;

  // Carica le persone all'avvio
  loadPersons();

  // Event listeners
  addBtn.addEventListener("click", () => openAddPersonModal());
  saveBtn.addEventListener("click", handleFormSubmit);
  cancelBtn.addEventListener("click", closePersonModal);
  closeModalBtns.forEach((btn) =>
    btn.addEventListener("click", closeAllModals)
  );
  cancelDeleteBtn.addEventListener("click", closeConfirmModal);
  confirmDeleteBtn.addEventListener("click", confirmDelete);

  // Validazione per il campo telefono - accetta solo numeri
  phoneInput.addEventListener("input", function (e) {
    this.value = this.value.replace(/[^0-9]/g, "");
  });

  // Funzione per caricare le persone dal server
  async function loadPersons() {
    try {
      const response = await fetch("/api/items");
      const persons = await response.json();

      // Svuota la lista
      personList.innerHTML = "";

      // Mostra o nascondi il messaggio "vuoto"
      if (persons.length === 0) {
        emptyMessage.style.display = "block";
        document.getElementById("personTable").style.display = "none";
      } else {
        emptyMessage.style.display = "none";
        document.getElementById("personTable").style.display = "table";

        // Aggiungi ogni persona alla tabella
        persons.forEach((person) => {
          const row = createPersonRow(person);
          personList.appendChild(row);
        });
      }
    } catch (error) {
      console.error("Errore nel caricamento delle persone:", error);
      showNotification("Errore nel caricamento delle persone", "error");
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

  // Funzione per aprire il modal per aggiungere una persona
  function openAddPersonModal() {
    modalTitle.textContent = "Aggiungi Persona";
    personForm.reset();
    personIdInput.value = "";
    personModal.style.display = "block";
    firstNameInput.focus();
  }

  // Funzione per aprire il modal per modificare una persona
  function openEditPersonModal(person) {
    modalTitle.textContent = "Modifica Persona";

    // Popola il form con i dati della persona
    personIdInput.value = person.id;
    firstNameInput.value = person.firstName || "";
    lastNameInput.value = person.lastName || "";
    emailInput.value = person.email || "";
    phoneInput.value = person.phone || "";
    birthDateInput.value = person.birthDate || "";
    addressInput.value = person.address || "";
    notesInput.value = person.notes || "";

    personModal.style.display = "block";
    firstNameInput.focus();
  }

  // Funzione per aprire la conferma di eliminazione
  function openDeleteConfirmation(person) {
    personToDeleteId = person.id;
    const fullName = `${person.firstName || ""} ${
      person.lastName || ""
    }`.trim();
    deletePersonName.textContent = fullName || "ID: " + person.id;
    confirmModal.style.display = "block";
  }

  // Funzione per gestire l'invio del form
  async function handleFormSubmit() {
    // Verifica validità dei campi obbligatori
    if (
      !firstNameInput.value.trim() ||
      !lastNameInput.value.trim() ||
      !emailInput.value.trim()
    ) {
      showNotification(
        "I campi Nome, Cognome e Email sono obbligatori",
        "error"
      );
      return;
    }

    // Raccogli i dati dal form
    const personData = {
      firstName: firstNameInput.value.trim(),
      lastName: lastNameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim() || "",
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
          showNotification("Persona aggiornata con successo", "success");
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
          showNotification("Persona aggiunta con successo", "success");
        } else {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Errore nell'aggiunta della persona"
          );
        }
      }
    } catch (error) {
      console.error("Errore nella gestione del form:", error);
      showNotification(error.message, "error");
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
        showNotification("Persona eliminata con successo", "success");
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
      showNotification(error.message, "error");
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
    personForm.reset();
    personToDeleteId = null;
  }

  // Funzione per mostrare notifiche
  function showNotification(message, type) {
    // Controlla se esiste già una notifica
    let notification = document.querySelector(".notification");

    // Se esiste, rimuovila
    if (notification) {
      notification.remove();
    }

    // Crea una nuova notifica
    notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Aggiungi la notifica al DOM
    document.body.appendChild(notification);

    // Mostra la notifica con animazione
    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    // Rimuovi la notifica dopo 3 secondi
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        notification.remove();
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
  });
});
