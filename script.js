let todos = [];
let streak = 0;
let lastStreakDate = "";

const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const todoList = document.getElementById("todoList");
const gqlLog = document.getElementById("gqlLog");
const streakDisplay = document.getElementById("streakCount");
const completionMessage = document.getElementById("completionMessage");

const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");

function initStreak() {
  streak = parseInt(localStorage.getItem("streak")) || 0;
  lastStreakDate = localStorage.getItem("lastStreakDate") || "";
  updateStreakDisplay();
}

document.getElementById("todoForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const task = taskInput.value.trim();
  const priority = priorityInput.value;

  if (task) {
    const newTodo = {
      id: Date.now(),
      task,
      completed: false,
      priority,
    };
    todos.push(newTodo);
    logGraphQLOperation("ADD", newTodo);
    renderTodos();
    taskInput.value = "";
    checkStreak(); // Optional: Check after task added
  }
});

statusFilter.addEventListener("change", renderTodos);
priorityFilter.addEventListener("change", renderTodos);

function toggleComplete(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    logGraphQLOperation("TOGGLE", todo);
    renderTodos();
    checkStreak();
  }
}

function deleteTodo(id) {
  const todo = todos.find((t) => t.id === id);
  todos = todos.filter((t) => t.id !== id);
  logGraphQLOperation("DELETE", todo);
  renderTodos();
  checkStreak();
}

function renderTodos() {
  todoList.innerHTML = "";

  const status = statusFilter.value;
  const priority = priorityFilter.value;

  const filtered = todos.filter((todo) => {
    const statusMatch = status === "" || String(todo.completed) === status;
    const priorityMatch = priority === "" || todo.priority === priority;
    return statusMatch && priorityMatch;
  });

  filtered.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item";

    const content = document.createElement("div");
    content.className = "todo-content";
    content.innerHTML = `
      <span class="${todo.completed ? "done" : ""}">${todo.task}</span>
      <small>Priority: ${todo.priority}</small>
    `;

    const buttons = document.createElement("div");
    buttons.className = "todo-buttons";

    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = todo.completed ? "Undo" : "Done";
    toggleBtn.addEventListener("click", () => toggleComplete(todo.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    buttons.appendChild(toggleBtn);
    buttons.appendChild(deleteBtn);

    li.appendChild(content);
    li.appendChild(buttons);
    todoList.appendChild(li);
  });

  const allCompleted = todos.length > 0 && todos.every((t) => t.completed);
  completionMessage.style.display = allCompleted ? "block" : "none";
}

function checkStreak() {
  const today = new Date().toISOString().split("T")[0];
  const allCompleted = todos.length > 0 && todos.every((t) => t.completed);

  if (allCompleted && lastStreakDate !== today) {
    streak += 1;
    lastStreakDate = today;
    localStorage.setItem("streak", streak.toString());
    localStorage.setItem("lastStreakDate", lastStreakDate);
    updateStreakDisplay();
  }
}

function updateStreakDisplay() {
  streakDisplay.textContent = streak;
}

function logGraphQLOperation(type, data) {
  const logElement = document.getElementById('gqlLog');

  let operation = '';

  if (type === 'ADD') {
    operation = `
mutation {
  addTodo(task: "${data.task}", priority: "${data.priority}") {
    id
    task
    completed
    priority
  }
}`;
  } else if (type === 'DELETE') {
    operation = `
mutation {
  deleteTodo(id: ${data.id}) {
    id
  }
}`;
  } else if (type === 'TOGGLE') {
    operation = `
mutation {
  toggleTodo(id: ${data.id}) {
    id
    completed
  }
}`;
  }

  const timestamp = new Date().toLocaleTimeString();
  logElement.textContent += `\n[${timestamp}] ${type}:\n${operation}\n`;
}

window.onload = () => {
  initStreak();
  renderTodos();
};
