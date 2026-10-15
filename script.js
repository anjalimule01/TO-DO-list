const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = [];
let currentFilter = "all";

// Load tasks from Local Storage
function loadTasks() {
    try {
        const savedTasks = localStorage.getItem("tasks");

        if (savedTasks) {
            const parsedTasks = JSON.parse(savedTasks);

            if (Array.isArray(parsedTasks)) {
                tasks = parsedTasks;
            }
        }
    } catch (error) {
        console.error("Error loading tasks:", error);
        tasks = [];
    }
}

// Save tasks to Local Storage
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Escape HTML to safely display task text
function escapeHTML(text) {
    const element = document.createElement("span");
    element.textContent = text;
    return element.innerHTML;
}

// Add a new task
taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const taskText = taskInput.value.trim();

    if (taskText === "") return;

    const newTask = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        text: taskText,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();

    taskInput.value = "";
    taskInput.focus();
});

// Display tasks
function renderTasks() {
    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(function (task) {
        if (currentFilter === "active") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    filteredTasks.forEach(function (task) {
        const li = document.createElement("li");

        li.className = "task-item";

        if (task.completed) {
            li.classList.add("completed");
        }

        li.dataset.id = task.id;

        li.innerHTML = `
            <input
                type="checkbox"
                class="complete-checkbox"
                ${task.completed ? "checked" : ""}
                aria-label="Mark task as completed"
            >

            <span class="task-text">${escapeHTML(task.text)}</span>

            <button type="button" class="edit-btn">Edit</button>

            <button type="button" class="delete-btn">Delete</button>
        `;

        taskList.appendChild(li);
    });

    const remainingTasks = tasks.filter(function (task) {
        return !task.completed;
    }).length;

    taskCount.textContent =
        remainingTasks + (remainingTasks === 1
            ? " task remaining"
            : " tasks remaining");

    saveTasks();
}

// Edit and delete tasks using event delegation
taskList.addEventListener("click", function (event) {
    const li = event.target.closest(".task-item");

    if (!li) return;

    const taskId = li.dataset.id;

    if (event.target.classList.contains("delete-btn")) {
        tasks = tasks.filter(function (task) {
            return task.id !== taskId;
        });

        saveTasks();
        renderTasks();
    }

    if (event.target.classList.contains("edit-btn")) {
        const task = tasks.find(function (task) {
            return task.id === taskId;
        });

        if (!task) return;

        const updatedText = prompt("Edit your task:", task.text);

        if (updatedText !== null && updatedText.trim() !== "") {
            task.text = updatedText.trim();

            saveTasks();
            renderTasks();
        }
    }
});

// Mark tasks as completed or active
taskList.addEventListener("change", function (event) {
    if (!event.target.classList.contains("complete-checkbox")) {
        return;
    }

    const li = event.target.closest(".task-item");
    const taskId = li.dataset.id;

    const task = tasks.find(function (task) {
        return task.id === taskId;
    });

    if (!task) return;

    task.completed = event.target.checked;

    saveTasks();
    renderTasks();
});

// Filter tasks
filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(function (btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        renderTasks();
    });
});

// Initialize application
loadTasks();
renderTasks();