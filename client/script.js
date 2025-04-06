let todos = [];
let streakCount = parseInt(localStorage.getItem("streakCount")) || 0;
let lastCompletedDate = localStorage.getItem("lastCompletedDate") || new Date().toDateString();

const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const todoList = document.getElementById("todoList");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");
const streakDisplay = document.getElementById("streakCount");
const completionMessage = document.getElementById("completionMessage");
const todoForm = document.getElementById("todoForm");

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const task = taskInput.value.trim();
  const priority = priorityInput.value;
  if (task) {
    const newTodo = {
      id: Date.now(),
      task,
      priority,
      completed: false,
      startTime: new Date().getTime(),
      endTime: null,
      points: 0
    };
    todos.push(newTodo);
    taskInput.value = "";
    renderTodos();
  }
});

statusFilter.addEventListener("change", renderTodos);
priorityFilter.addEventListener("change", renderTodos);

function calculatePoints(start, end) {
  const minutes = Math.floor((end - start) / 60000);
  if (minutes <= 5) return 20;
  else if (minutes <= 15) return 10;
  else return 5;
}

function updateStreak() {
  const today = new Date().toDateString();
  if (lastCompletedDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (new Date(lastCompletedDate).toDateString() === yesterday.toDateString()) {
      streakCount++;
    } else {
      streakCount = 1;
    }
    lastCompletedDate = today;
    localStorage.setItem("streakCount", streakCount);
    localStorage.setItem("lastCompletedDate", lastCompletedDate);
  }
}

function renderTodos() {
  const statusVal = statusFilter.value;
  const priorityVal = priorityFilter.value;

  const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };

  const filteredTodos = todos
    .filter(todo => {
      const statusMatch = statusVal === "" || String(todo.completed) === statusVal;
      const priorityMatch = priorityVal === "" || todo.priority === priorityVal;
      return statusMatch && priorityMatch;
    })
    .sort((a, b) => {
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
    taskSpan.innerHTML = `${todo.task} [${todo.priority}] ${todo.completed ? "✔" : ""}<br>Points: ${todo.points}`;
    if (todo.completed) taskSpan.classList.add("done");
    contentDiv.appendChild(taskSpan);

    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "todo-buttons";

    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "Mark as Done";
    toggleBtn.disabled = todo.completed;
    toggleBtn.onclick = () => {
      if (!todo.completed) {
        todo.completed = true;
        todo.endTime = new Date().getTime();
        todo.points = calculatePoints(todo.startTime, todo.endTime);
        updateStreak();
        renderTodos();
      }
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => {
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
  streakDisplay.textContent = streakCount;
}
