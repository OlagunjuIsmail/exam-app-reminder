const form = document.querySelector("form");
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.querySelector("#name").value;
    const email = document.querySelector("#email").value;
    const matric = document.querySelector("#matric").value;
    const date = document.querySelector("#date").value;
    const time = document.querySelector("#time").value;

    const data = { name, email, matric, date, time };

    // validation
    if (!name || !email || !matric || !date || !time) {
        alert("Please fill in all fields");
        return;
    }
    if (!validateEmail(email)) {
        alert("Please enter a valid email address");
        return;
    }
    if (!validateDate(date)) {
        alert("Please enter a valid date in the format DD-MM-YY");
        return;
    }
    if (!validateTime(time)) {
        alert("Please enter a valid time in the format HH:mm in the 24-hr format");
        return;
    }
    fetch("http://localhost:3000/add", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      })

      .then(() => {
        // Redirect to success page
        window.location.href = "success.html";
      })

      form.reset();
      
    
});

function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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
