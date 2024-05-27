const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const cron = require("node-cron");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

sgMail.setApiKey(process.env.SG_API_KEY);

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 60000,
  socketTimeoutMS: 60000,
});
mongoose.set("strictQuery", false);

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// Schemas and Models
const Schema = mongoose.Schema;
const reminderSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  examDate: { type: Date, required: true },
  minsReminder: { type: Date, required: true },
  hourReminder: { type: Date, required: true },
  dayReminder: { type: Date, required: true },
});
const Reminder = mongoose.model("Reminder", reminderSchema);

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/add", async (req, res) => {
  const { name, email, matric, date, time } = req.body;
  if (!name || !email || !matric || !date || !time) {
    return res.status(400).send("All fields are required");
  }

  const examDate = new Date(`${date} ${time}`);
  const minsReminder = new Date(examDate - 15 * 60 * 1000);
  const hourReminder = new Date(examDate - 60 * 60 * 1000);
  const dayReminder = new Date(examDate - 24 * 60 * 60 * 1000);

  const newReminder = new Reminder({
    name,
    email,
    examDate,
    minsReminder,
    hourReminder,
    dayReminder,
  });

  try {
    await newReminder.save();
    scheduleReminder(newReminder);

    const confirmationMsg = {
      to: email,
      from: "olagunjuismail7@gmail.com",
      subject: "Exam reminder registration successful",
      html: `<h1 style="color:green;">Exam Reminder Registration</h1>
             <p>Hello ${name}, you have successfully registered for an exam reminder. Your details are as follows:</p>
             <p><strong>Matric Number:</strong> ${matric}</p>
             <p><strong>Exam Date:</strong> ${examDate.toString()}</p>
             <p>Thank you.</p>`,
    };
    await sgMail.send(confirmationMsg);
    res.status(200).send({ message: "Exam reminder set successfully" });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send("An error occurred while setting the reminder. Please try again.");
  }
});

app.get("/reminders", async (req, res) => {
  try {
    const reminders = await Reminder.find();
    res.status(200).json(reminders);
  } catch (error) {
    console.error("Error fetching reminders:", error);
    res.status(500).send("An error occurred while fetching reminders");
  }
});

app.put("/reminder/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, matric, date, time } = req.body;

  if (!name || !email || !matric || !date || !time) {
    return res.status(400).send("All fields are required");
  }

  const examDate = new Date(`${date} ${time}`);
  const minsReminder = new Date(examDate - 15 * 60 * 1000);
  const hourReminder = new Date(examDate - 60 * 60 * 1000);
  const dayReminder = new Date(examDate - 24 * 60 * 60 * 1000);

  try {
    const updatedReminder = await Reminder.findByIdAndUpdate(id, {
      name,
      email,
      examDate,
      minsReminder,
      hourReminder,
      dayReminder,
    }, { new: true });

    if (!updatedReminder) {
      return res.status(404).send("Reminder not found");
    }

    res.status(200).json(updatedReminder);
  } catch (error) {
    console.error("Error updating reminder:", error);
    res.status(500).send("An error occurred while updating the reminder");
  }
});

app.delete("/reminder/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedReminder = await Reminder.findByIdAndDelete(id);

    if (!deletedReminder) {
      return res.status(404).send("Reminder not found");
    }

    res.status(200).send("Reminder deleted successfully");
  } catch (error) {
    console.error("Error deleting reminder:", error);
    res.status(500).send("An error occurred while deleting the reminder");
  }
});

function scheduleReminder(reminder) {
  const { name, email, examDate, minsReminder, hourReminder, dayReminder } = reminder;

  // Schedule day reminder
  const task1 = cron.schedule(
    `0 ${dayReminder.getMinutes()} ${dayReminder.getHours()} ${dayReminder.getDate()} ${
      dayReminder.getMonth() + 1
    } *`,
    () => sendEmail(email, "Reminder: Exam tomorrow", generateEmailContent(name, `your exam is tomorrow ${examDate.toString()}`)),
    { scheduled: false }
  );
  task1.start();

  // Schedule hour reminder
  const task2 = cron.schedule(
    `0 ${hourReminder.getMinutes()} ${hourReminder.getHours()} ${hourReminder.getDate()} ${
      hourReminder.getMonth() + 1
    } *`,
    () => sendEmail(email, "Reminder: Exam in an hour", generateEmailContent(name, `your exam is in an hour at ${examDate}`)),
    { scheduled: false }
  );
  task2.start();

  // Schedule 15 minutes reminder
  const task3 = cron.schedule(
    `0 ${minsReminder.getMinutes()} ${minsReminder.getHours()} ${minsReminder.getDate()} ${
      minsReminder.getMonth() + 1
    } *`,
    () => sendEmail(email, "Reminder: Exam in 15 minutes", generateEmailContent(name, `your exam starts in the next 15 minutes.`)),
    { scheduled: false }
  );
  task3.start();
}

function sendEmail(to, subject, htmlContent) {
  const msg = { to, from: "olagunjuismail7@gmail.com", subject, html: htmlContent };
  sgMail.send(msg).catch((error) => console.error("Error sending email:", error));
}

function generateEmailContent(name, message) {
  return `<h1 style="color:blue;">Exam Reminder</h1>
          <p>Hello ${name}, this is a friendly reminder that ${message}</p>
          <p>Best of luck!</p>`;
}

app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  try {
    const reminders = await Reminder.find();
    reminders.forEach(scheduleReminder);
  } catch (error) {
    console.error("Error querying reminders:", error);
  }
});

module.exports = { app };
