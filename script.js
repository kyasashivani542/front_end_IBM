let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// ✅ Ask for notification permission
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Add Task
function addTask() {
  let taskName = document.getElementById("taskName").value;
  let taskDate = document.getElementById("taskDate").value;
  let taskTime = document.getElementById("taskTime").value;
  let taskPriority = document.getElementById("taskPriority").value;

  if (taskName === "" || taskDate === "" || taskTime === "") {
    alert("Please enter task name, date, and time!");
    return;
  }

  let newTask = {
    id: Date.now(),
    name: taskName,
    date: taskDate,
    time: taskTime,
    priority: taskPriority,
    completed: false,
    reminded: false
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  // Reset inputs
  document.getElementById("taskName").value = "";
  document.getElementById("taskDate").value = "";
  document.getElementById("taskTime").value = "";
  document.getElementById("taskPriority").value = "Medium";
}

// Render Tasks
function renderTasks() {
  let taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  let searchText = document.getElementById("searchBox").value.toLowerCase();
  let filterPriority = document.getElementById("filterPriority").value;

  // Sort by date+time, then priority
  tasks.sort((a, b) => {
    let aDateTime = new Date(a.date + "T" + a.time);
    let bDateTime = new Date(b.date + "T" + b.time);
    if (aDateTime.getTime() !== bDateTime.getTime()) {
      return aDateTime - bDateTime;
    }
    const priorityOrder = { High: 1, Medium: 2, Low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  tasks.forEach(task => {
    if (
      (filterPriority === "All" || task.priority === filterPriority) &&
      task.name.toLowerCase().includes(searchText)
    ) {
      let li = document.createElement("li");
      li.className = task.completed ? "completed" : "";
      li.innerHTML = `
        <span><strong>${task.name}</strong> - ${task.date} ${task.time} [${task.priority}]</span>
        <button class="done" onclick="toggleComplete(${task.id})">✔</button>
        <button class="delete" onclick="deleteTask(${task.id})">❌</button>
      `;
      taskList.appendChild(li);
    }
  });

  updateProgress();
}

// Toggle Complete
function toggleComplete(id) {
  let task = tasks.find(t => t.id === id);
  task.completed = !task.completed;
  saveTasks();
  renderTasks();
}

// Delete Task
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

// Save
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Progress
function updateProgress() {
  let total = tasks.length;
  let completed = tasks.filter(t => t.completed).length;
  let percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  document.getElementById("progressText").textContent = percent + "%";
  document.getElementById("progressFill").style.width = percent + "%";
}

// 🔔 Reminder Checker with Desktop Notification
function checkReminders() {
  let now = new Date();
  tasks.forEach(task => {
    let taskDateTime = new Date(task.date + "T" + task.time);

    if (!task.completed && !task.reminded && Math.abs(taskDateTime - now) < 60000) {
      showNotification(task.name, task.priority);
      task.reminded = true;
      saveTasks();
    }
  });
}

// Show Desktop Notification
function showNotification(taskName, priority) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("⏰ Study Reminder", {
      body: `Time to study: ${taskName} [${priority}]`,
      icon: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png" // optional icon
    });
  } else {
    alert(`⏰ Reminder: ${taskName} [${priority}]`); // fallback
  }
}

// Check reminders every 30s
setInterval(checkReminders, 30000);

// Initial render
renderTasks();
