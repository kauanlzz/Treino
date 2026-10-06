"use strict";

const STORAGE_KEY = "ritmo-weekly-plan-v1";
const MAX_WORKOUT_NAME_LENGTH = 80;
const MAX_OBSERVATION_LENGTH = 240;
const DAYS = [
  { id: "seg", name: "Segunda-feira" },
  { id: "ter", name: "Terça-feira" },
  { id: "qua", name: "Quarta-feira" },
  { id: "qui", name: "Quinta-feira" },
  { id: "sex", name: "Sexta-feira" },
  { id: "sab", name: "Sábado" },
  { id: "dom", name: "Domingo" },
];
const weekGrid = document.querySelector("#week-grid");
const completedCount = document.querySelector("#completed-count");
const plannedCount = document.querySelector("#planned-count");
const progressTrack = document.querySelector("#progress-track");
const progressFill = document.querySelector("#progress-fill");
const statusMessage = document.querySelector("#status-message");
const openDays = new Set();

function createEmptySchedule() {
  return Object.fromEntries(DAYS.map(({ id }) => [id, []]));
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function loadSchedule() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return createEmptySchedule();

    const parsed = JSON.parse(stored);
    if (!isRecord(parsed) || parsed.version !== 1 || !isRecord(parsed.days)) {
      throw new Error("Formato de dados inválido.");
    }

    return Object.fromEntries(DAYS.map(({ id }) => {
      const items = Array.isArray(parsed.days[id]) ? parsed.days[id] : [];
      const workouts = items
        .filter((item) => isRecord(item) && typeof item.id === "string" && typeof item.name === "string" && item.name.trim().length > 0)
        .slice(0, 100)
        .map((item) => ({
          id: item.id,
          name: item.name.trim().slice(0, MAX_WORKOUT_NAME_LENGTH),
          observation: typeof item.observation === "string" ? item.observation.slice(0, MAX_OBSERVATION_LENGTH) : "",
          completed: item.completed === true,
        }));
      return [id, workouts];
    }));
  } catch {
    statusMessage.textContent = "Não foi possível ler os dados salvos. Um cronograma vazio foi iniciado.";
    return createEmptySchedule();
  }
}

let schedule = loadSchedule();

function saveSchedule() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, days: schedule }));
    return true;
  } catch {
    announce("Não foi possível salvar neste navegador. A alteração vale apenas nesta sessão.");
    return false;
  }
}

function announce(message) {
  statusMessage.textContent = message;
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function resizeObservation(observation) {
  observation.style.height = "auto";
  const borderHeight = observation.offsetHeight - observation.clientHeight;
  observation.style.height = `${observation.scrollHeight + borderHeight}px`;
}

function renderWorkout(dayId, workout) {
  const row = createElement("div", `workout-row${workout.completed ? " is-complete" : ""}`);
  const checkbox = createElement("input", "workout-check");
  checkbox.type = "checkbox";
  checkbox.checked = workout.completed;
  checkbox.dataset.action = "complete";
  checkbox.dataset.day = dayId;
  checkbox.dataset.id = workout.id;
  checkbox.setAttribute("aria-label", `${workout.completed ? "Desmarcar" : "Marcar"} ${workout.name} como concluído`);

  const copy = createElement("div", "workout-copy");
  const name = createElement("span", "workout-name", workout.name);
  const observation = createElement("textarea", "workout-observation");
  observation.rows = 2;
  observation.maxLength = MAX_OBSERVATION_LENGTH;
  observation.placeholder = "Adicionar observação...";
  observation.value = workout.observation;
  observation.dataset.action = "observation";
  observation.dataset.day = dayId;
  observation.dataset.id = workout.id;
  observation.setAttribute("aria-label", `Observação para ${workout.name}`);
  copy.append(name, observation);

  const removeButton = createElement("button", "remove-button", "Remover");
  removeButton.type = "button";
  removeButton.dataset.action = "remove";
  removeButton.dataset.day = dayId;
  removeButton.dataset.id = workout.id;
  removeButton.setAttribute("aria-label", `Remover ${workout.name}`);
  row.append(checkbox, copy, removeButton);
  return row;
}

function renderDay(day, index) {
  const card = createElement("article", "day-card");
  const header = createElement("header", "day-card-header");
  header.append(createElement("h3", "day-title", day.name), createElement("span", "day-index", `D${index + 1}`));

  const list = createElement("div", "day-list");
  list.setAttribute("aria-label", `Treinos de ${day.name}`);
  const workouts = schedule[day.id];
  if (workouts.length === 0) {
    list.append(createElement("p", "empty-day", "Nenhum treino planejado"));
  } else {
    workouts.forEach((workout) => list.append(renderWorkout(day.id, workout)));
  }

  const addButton = createElement("button", "add-button");
  addButton.type = "button";
  addButton.dataset.action = "toggle-form";
  addButton.dataset.day = day.id;
  addButton.setAttribute("aria-expanded", String(openDays.has(day.id)));
  const addSymbol = createElement("span", "add-symbol", "+");
  addSymbol.setAttribute("aria-hidden", "true");
  addButton.append(addSymbol, document.createTextNode("Adicionar treino"));

  const form = createElement("form", "workout-form");
  form.hidden = !openDays.has(day.id);
  form.dataset.day = day.id;
  const nameLabel = createElement("label", "field-label", "Nome do treino");
  const nameInput = createElement("input", "field-control");
  nameInput.type = "text";
  nameInput.name = "name";
  nameInput.placeholder = "Ex.: Corrida leve";
  nameInput.maxLength = MAX_WORKOUT_NAME_LENGTH;
  nameInput.required = true;
  nameInput.autocomplete = "off";
  nameLabel.append(nameInput);

  const actions = createElement("div", "form-actions");
  const saveButton = createElement("button", "save-button", "Salvar treino");
  saveButton.type = "submit";
  const cancelButton = createElement("button", "cancel-button", "Cancelar");
  cancelButton.type = "button";
  cancelButton.dataset.action = "cancel-form";
  cancelButton.dataset.day = day.id;
  actions.append(saveButton, cancelButton);
  form.append(nameLabel, actions);
  card.append(header, list, addButton, form);
  return card;
}

function renderSchedule() {
  weekGrid.replaceChildren(...DAYS.map((day, index) => renderDay(day, index)));
  weekGrid.querySelectorAll('textarea[data-action="observation"]').forEach(resizeObservation);
  const workouts = DAYS.flatMap(({ id }) => schedule[id]);
  const completed = workouts.filter(({ completed }) => completed).length;
  const planned = workouts.length;
  const percentage = planned === 0 ? 0 : Math.round((completed / planned) * 100);

  completedCount.textContent = String(completed);
  plannedCount.textContent = String(planned);
  progressTrack.setAttribute("aria-valuemax", String(planned));
  progressTrack.setAttribute("aria-valuenow", String(completed));
  progressTrack.setAttribute("aria-valuetext", `${completed} de ${planned} concluídos`);
  progressFill.style.width = `${percentage}%`;
}

function createWorkoutId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

weekGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { action, day, id } = button.dataset;
  if (action === "toggle-form") {
    if (openDays.has(day)) {
      openDays.delete(day);
      renderSchedule();
      weekGrid.querySelector(`button[data-action="toggle-form"][data-day="${day}"]`)?.focus();
    } else {
      openDays.add(day);
      renderSchedule();
      weekGrid.querySelector(`form[data-day="${day}"] input[name="name"]`)?.focus();
    }
  } else if (action === "cancel-form") {
    openDays.delete(day);
    renderSchedule();
    weekGrid.querySelector(`button[data-action="toggle-form"][data-day="${day}"]`)?.focus();
  } else if (action === "remove") {
    const workout = schedule[day].find((item) => item.id === id);
    schedule[day] = schedule[day].filter((item) => item.id !== id);
    const saved = saveSchedule();
    renderSchedule();
    if (saved) announce(workout ? `Treino ${workout.name} removido.` : "Treino removido.");
    weekGrid.querySelector(`button[data-action="toggle-form"][data-day="${day}"]`)?.focus();
  }
});

weekGrid.addEventListener("change", (event) => {
  const observation = event.target;
  if (observation instanceof HTMLTextAreaElement && observation.dataset.action === "observation") {
    const workout = schedule[observation.dataset.day].find((item) => item.id === observation.dataset.id);
    if (!workout) return;

    workout.observation = observation.value;
    saveSchedule();
    return;
  }

  const checkbox = event.target;
  if (!(checkbox instanceof HTMLInputElement) || checkbox.dataset.action !== "complete") return;

  const workout = schedule[checkbox.dataset.day].find((item) => item.id === checkbox.dataset.id);
  if (!workout) return;

  workout.completed = checkbox.checked;
  const saved = saveSchedule();
  renderSchedule();
  if (saved) announce(checkbox.checked ? `${workout.name} marcado como concluído.` : `${workout.name} desmarcado.`);
  [...weekGrid.querySelectorAll('input[data-action="complete"]')]
    .find((item) => item.dataset.id === workout.id)
    ?.focus();
});

weekGrid.addEventListener("input", (event) => {
  const observation = event.target;
  if (observation instanceof HTMLTextAreaElement && observation.dataset.action === "observation") {
    resizeObservation(observation);
  }
});

weekGrid.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.matches(".workout-form")) return;

  event.preventDefault();
  const formData = new FormData(form);
  const name = String(formData.get("name") ?? "").trim();
  const input = form.elements.namedItem("name");
  if (!name) {
    input.setCustomValidity("Digite o nome do treino.");
    input.reportValidity();
    input.addEventListener("input", () => input.setCustomValidity(""), { once: true });
    return;
  }

  const day = form.dataset.day;
  schedule[day].push({
    id: createWorkoutId(),
    name: name.slice(0, MAX_WORKOUT_NAME_LENGTH),
    observation: "",
    completed: false,
  });
  openDays.delete(day);
  const saved = saveSchedule();
  renderSchedule();
  if (saved) announce(`${name} adicionado a ${DAYS.find((item) => item.id === day).name}.`);
  weekGrid.querySelector(`button[data-action="toggle-form"][data-day="${day}"]`)?.focus();
});

renderSchedule();