const GRAPHQL_URL = "http://localhost:4000/graphql";

let todos = [];
let points = 0;
let streak = 0;
let currentStreakId = null;

const todoForm = document.getElementById("todoForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const todoList = document.getElementById("todoList");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");
const completionMessage = document.getElementById("completionMessage");
const gqlLogBox = document.getElementById("gqlLog");

todoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const task = taskInput.value.trim();
  const priority = priorityInput.value;
  if (task) {
    const newTodo = await addTodo(task, priority);
    todos.push({ ...newTodo, startTime: new Date() });
    taskInput.value = "";
    renderTodos();
  }
});

statusFilter.addEventListener("change", renderTodos);
priorityFilter.addEventListener("change", renderTodos);

// --- GraphQL Functions ---
function logGQL(code) {
  console.log("🚀 GraphQL Operation Sent:\n", code);
  if (gqlLogBox) gqlLogBox.textContent = code;
}

async function fetchTodos() {
  const query = `
    query {
      getTodos {
        id
        task
        completed
        priority
      }
    }
  `;
  logGQL(query);
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const result = await res.json();
  return result.data.getTodos;
}

async function addTodo(task, priority) {
  const mutation = `
    mutation {
      addTodo(task: "${task}", priority: "${priority}") {
        id
        task
        completed
        priority
      }
    }
  `;
  logGQL(mutation);
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: mutation }),
  });
  const result = await res.json();
  return result.data.addTodo;
}

async function toggleTodo(id) {
  const mutation = `
    mutation {
      toggleTodo(id: ${id}) {
        id
        completed
      }
    }
  `;
  logGQL(mutation);
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: mutation }),
  });
  const result = await res.json();
  return result.data.toggleTodo;
}

async function deleteTodo(id) {
  const mutation = `
    mutation {
      deleteTodo(id: ${id}) {
        id
      }
    }
  `;
  logGQL(mutation);
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: mutation }),
  });
  const result = await res.json();
  return result.data.deleteTodo;
}

// --- Render and Interaction Logic ---
function renderTodos() {
  const statusVal = statusFilter.value;
  const priorityVal = priorityFilter.value;

  const filteredTodos = todos.filter(todo => {
    const statusMatch = statusVal === "" || String(todo.completed) === statusVal;
    const priorityMatch = priorityVal === "" || todo.priority === priorityVal;
    return statusMatch && priorityMatch;
  });

  filteredTodos.sort((a, b) => {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    if (a.completed !== b.completed) return a.completed - b.completed;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  todoList.innerHTML = "";

  filteredTodos.forEach(todo => {
    const li = document.createElement("li");
    li.className = "todo-item";

    const contentDiv = document.createElement("div");
    contentDiv.className = "todo-content";

    const taskSpan = document.createElement("span");
    taskSpan.textContent = `${todo.task} [${todo.priority}] ${todo.completed ? "✔" : ""}`;
    if (todo.completed) taskSpan.classList.add("done");
    contentDiv.appendChild(taskSpan);

    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "todo-buttons";

    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = todo.completed ? "Undo" : "Mark as Done";
    toggleBtn.onclick = async () => {
      await toggleTodo(todo.id);
      todo.completed = !todo.completed;
      
      if (todo.completed) {
        const endTime = new Date();
        const durationInMinutes = Math.max(1, Math.round((endTime - new Date(todo.startTime)) / 60000));
        const earnedPoints = 10 * durationInMinutes;
        points += earnedPoints;
        streak += 1;
        currentStreakId = todo.id;
        alert(`✅ Task Completed!\n+${earnedPoints} Points\n🔥 Current Streak: ${streak}`);
      } else {
        streak = 0;
        currentStreakId = null;
        alert("Task marked incomplete. Streak reset!");
      }

      renderTodos();
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = async () => {
      await deleteTodo(todo.id);
      todos = todos.filter(t => t.id !== todo.id);
      renderTodos();
    };

    buttonsDiv.appendChild(toggleBtn);
    buttonsDiv.appendChild(deleteBtn);

    li.appendChild(contentDiv);
    li.appendChild(buttonsDiv);
    todoList.appendChild(li);
  });

  const allCompleted = todos.length > 0 && todos.every(todo => todo.completed);
  const noFilterActive = statusVal === "" && priorityVal === "";
  completionMessage.style.display = allCompleted && noFilterActive ? "block" : "none";
}

async function init() {
  todos = await fetchTodos();
  todos = todos.map(todo => ({ ...todo, startTime: new Date() }));
  renderTodos();
}

init();
