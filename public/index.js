document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearFeedback();
  
      const name = document.querySelector("#name").value.trim();
      const email = document.querySelector("#email").value.trim();
      const matric = document.querySelector("#matric").value.trim();
      const date = document.querySelector("#date").value.trim();
      const time = document.querySelector("#time").value.trim();
  
      const data = { name, email, matric, date, time };
  
      // Validate inputs
      if (!name || !email || !matric || !date || !time) {
        showFeedback("Please fill in all fields", "error");
        return;
      }
      if (!validateEmail(email)) {
        showFeedback("Please enter a valid email address", "error");
        return;
      }
      if (!validateDate(date)) {
        showFeedback("Please enter a valid date in the format YYYY-MM-DD", "error");
        return;
      }
      if (!validateTime(time)) {
        showFeedback("Please enter a valid time in the format HH:mm in the 24-hr format", "error");
        return;
      }
  
      // Show loading indicator
      showLoading(true);
  
      // Ensure the URL is correct
      const url = window.location.origin;
  
      try {
        const response = await fetch(`${url}/add`, {
          method: "POST",
          body: JSON.stringify(data),
          headers: { "Content-Type": "application/json" },
        });
  
        if (response.ok) {
          // Redirect to success page
          window.location.href = "/success.html";
        } else {
          showFeedback("Failed to add reminder. Please try again.", "error");
        }
      } catch (error) {
        console.error("Error:", error);
        showFeedback("An error occurred. Please try again.", "error");
      } finally {
        // Hide loading indicator
        showLoading(false);
      }
  
      form.reset();
    });
  
    function validateEmail(email) {
      const re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }
  
    function validateDate(date) {
      const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
      return dateFormat.test(date);
    }
  
    function validateTime(time) {
      const pattern = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      return pattern.test(time);
    }
  
    function showFeedback(message, type) {
      const feedback = document.createElement("div");
      feedback.className = `alert alert-${type}`;
      feedback.innerText = message;
      form.prepend(feedback);
    }
  
    function clearFeedback() {
      const feedbacks = document.querySelectorAll(".alert");
      feedbacks.forEach((feedback) => feedback.remove());
    }
  
    function showLoading(show) {
      const submitButton = document.querySelector("button[type='submit']");
      if (show) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
      } else {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Submit';
      }
    }
  });
  