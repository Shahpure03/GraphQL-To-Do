// script.js
let todos = [];

const todoForm = document.getElementById("todoForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const todoList = document.getElementById("todoList");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");
const completionMessage = document.getElementById("completionMessage");

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const task = taskInput.value.trim();
  const priority = priorityInput.value;
  if (task) {
    const newTodo = {
      id: Date.now(),
      task,
      priority,
      completed: false
    };
    todos.push(newTodo);
    taskInput.value = "";
    renderTodos();
  }
});

statusFilter.addEventListener("change", renderTodos);
priorityFilter.addEventListener("change", renderTodos);

function renderTodos() {
  const statusVal = statusFilter.value;
  const priorityVal = priorityFilter.value;

  const filteredTodos = todos.filter(todo => {
    const statusMatch = statusVal === "" || String(todo.completed) === statusVal;
    const priorityMatch = priorityVal === "" || todo.priority === priorityVal;
    return statusMatch && priorityMatch;
  });

  todoList.innerHTML = "";
  filteredTodos.forEach(todo => {
    const li = document.createElement("li");
    li.className = "todo-item";

    const taskSpan = document.createElement("span");
    taskSpan.textContent = `${todo.task} [${todo.priority}] ${todo.completed ? "✔" : ""}`;
    if (todo.completed) taskSpan.classList.add("done");

    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "todo-buttons";

    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "Mark as Done";
    toggleBtn.onclick = () => {
      todo.completed = !todo.completed;
      renderTodos();
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => {
      todos = todos.filter(t => t.id !== todo.id);
      renderTodos();
    };

    buttonsDiv.appendChild(toggleBtn);
    buttonsDiv.appendChild(deleteBtn);

    li.appendChild(taskSpan);
    li.appendChild(buttonsDiv);
    todoList.appendChild(li);
  });

  const allCompleted = todos.length > 0 && todos.every(todo => todo.completed);
  completionMessage.style.display = allCompleted && filteredTodos.length === todos.length ? "block" : "none";
}

renderTodos();
