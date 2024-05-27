document.addEventListener("DOMContentLoaded", () => {
    const remindersList = document.getElementById("reminders-list");
  
    fetch("/reminders")
      .then(response => response.json())
      .then(reminders => {
        reminders.forEach(reminder => {
          const reminderItem = document.createElement("div");
          reminderItem.className = "reminder-item";
  
          reminderItem.innerHTML = `
            <h3>${reminder.name}</h3>
            <p>Email: ${reminder.email}</p>
            <p>Matric: ${reminder.matric}</p>
            <p>Exam Date: ${new Date(reminder.examDate).toLocaleString()}</p>
            <button class="btn btn-warning edit-reminder" data-id="${reminder._id}">Edit</button>
            <button class="btn btn-danger delete-reminder" data-id="${reminder._id}">Delete</button>
          `;
  
          remindersList.appendChild(reminderItem);
        });
  
        document.querySelectorAll(".delete-reminder").forEach(button => {
          button.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            deleteReminder(id);
          });
        });
  
        document.querySelectorAll(".edit-reminder").forEach(button => {
          button.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            editReminder(id);
          });
        });
      });
  
    function deleteReminder(id) {
      fetch(`/reminder/${id}`, { method: "DELETE" })
        .then(response => {
          if (response.ok) {
            location.reload();
          } else {
            alert("Failed to delete reminder");
          }
        })
        .catch(error => {
          console.error("Error:", error);
          alert("An error occurred. Please try again.");
        });
    }
  
    function editReminder(id) {
      // Implement edit functionality here
      // Fetch reminder data, populate a form, and send a PUT request to update the reminder
    }
  });
  