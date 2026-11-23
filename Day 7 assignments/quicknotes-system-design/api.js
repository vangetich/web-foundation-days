const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.getElementById("load-btn");
const statusEl = document.getElementById("status");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitBtn = document.getElementById("submit-btn");
const notesList = document.getElementById("notes-list");

let notes = [];

/**
 * Reusable API helper.
 * Returns both status and data so callers can
 * display status codes when needed.
 */
async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  let data = null;
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  }

  return {
    status: response.status,
    data
  };
}

/** Prevent buttons being clicked during requests. */
function setLoading(isLoading) {
  loadBtn.disabled = isLoading;
  submitBtn.disabled = isLoading;
}

/** Validate a note title. */
function validateTitle(title) {
  const cleaned = title.trim();

  if (cleaned.length === 0) {
    statusEl.textContent = "Title is required.";
    return false;
  }

  if (cleaned.length > 100) {
    statusEl.textContent = "Title must be 100 characters or fewer.";
    return false;
  }

  return true;
}

/** Render the current notes list. */
function renderNotes() {
  notesList.innerHTML = "";

  if (notes.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.textContent = "No notes found.";
    notesList.appendChild(emptyMessage);
    return;
  }

  notes.forEach((note) => {
    const li = document.createElement("li");
    li.className = "note";

    const title = document.createElement("h3");
    title.textContent = note.title;

    const body = document.createElement("p");
    body.textContent = note.body;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      deleteNote(note.id);
    });

    li.appendChild(title);
    li.appendChild(body);
    li.appendChild(deleteBtn);
    notesList.appendChild(li);
  });
}

/** Load notes from the API. */
async function loadNotes() {
  try {
    setLoading(true);
    statusEl.textContent = "Loading notes...";

    const result = await request(`${API_URL}?_limit=10`);
    notes = result.data;
    renderNotes();
    statusEl.textContent = `Loaded ${notes.length} notes from the server.`;
  } catch (error) {
    console.error(error);
    statusEl.textContent =
      "Sorry, we couldn't load notes right now. Please try again.";
  } finally {
    setLoading(false);
  }
}

/** Create a note through the API. */
async function createNote(title, body) {
  if (!validateTitle(title)) {
    return;
  }

  try {
    submitBtn.disabled = true;
    statusEl.textContent = "Creating note...";

    const cleanedTitle = title.trim();
    const cleanedBody = body.trim();
    const result = await request(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: cleanedTitle,
        body: cleanedBody,
        userId: 1
      })
    });

    const newNote = {
      id: result.data.id,
      title: cleanedTitle,
      body: cleanedBody,
      userId: 1
    };

    notes.unshift(newNote);
    renderNotes();
    statusEl.textContent =
      `Note created (status ${result.status}, id ${result.data.id}).`;
    noteForm.reset();
  } catch (error) {
    console.error(error);
    statusEl.textContent = "Unable to create note. Please try again.";
  } finally {
    submitBtn.disabled = false;
  }
}

/** Delete a note through the API and remove it from local state. */
async function deleteNote(id) {
  try {
    statusEl.textContent = "Deleting note...";

    await request(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    // JSONPlaceholder simulates writes; changes are not persisted remotely.
    notes = notes.filter((note) => note.id !== id);
    renderNotes();
    statusEl.textContent = `Note ${id} deleted successfully.`;
  } catch (error) {
    console.error(error);
    statusEl.textContent = "Unable to delete the note. Please try again.";
  }
}

loadBtn.addEventListener("click", loadNotes);

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createNote(titleInput.value, bodyInput.value);
});