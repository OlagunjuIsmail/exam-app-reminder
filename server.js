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
  autoIndex: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

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

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/add", async (req, res) => {
  const { name, email, matric, date, time } = req.body;
  const examDate = new Date(date + " " + time);
  const minsReminder = new Date(examDate - 15 * 60 * 1000); // 15 minutes before exam
  const hourReminder = new Date(examDate - 60 * 60 * 1000); // 1 hour before exam
  const dayReminder = new Date(examDate - 24 * 60 * 60 * 1000); // 1 day before exam

  const confirmationMsg = {
    to: email,
    from: "olagunjuismail7@gmail.com",
    subject: "Exam reminder registration successful",
    html: `<h1 style="color:green;">Exam Reminder Registration</h1>
    <p>Hello ${name}, you have successfully registered for an exam reminder. Your details are as follows:</p>
    <p><strong>Matric Number:</strong> ${matric}</p>
    <p><strong>Exam Date:</strong> ${examDate.toString()}</p>
    <br><br>
    <p>Thank you.</p>`,
  };

  try {
    await sgMail.send(confirmationMsg);
    res.status(200).send({ message: "Exam reminder set successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending confirmation email");
    return;
  }

  const newReminder = new Reminder({
    name,
    email,
    examDate,
    minsReminder,
    hourReminder,
    dayReminder,
  });
  newReminder.save().then(() => {
    console.log("Reminder added!");
    scheduleReminder(newReminder);
  });
});

function scheduleReminder(reminder) {
  const { name, email, examDate, minsReminder, hourReminder, dayReminder } =
    reminder;

  // Schedule day reminder
  // ...
  // (task1 code remains the same)

  const task1 = cron.schedule(
    `0 ${dayReminder.getMinutes()} ${dayReminder.getHours()} ${dayReminder.getDate()} ${
      dayReminder.getMonth() + 1
    } *`,
    () => {
      const msg = {
        to: email,
        from: "olagunjuismail7@gmail.com",
        subject: "Reminder: Exam tomorrow",
        html: `<h1 style="color:blue;">Exam Reminder</h1>
              <p>Hello ${name}, this is a friendly reminder that your exam is tomorrow ${examDate.toString()}.</p>
              <br><br>
              <p>Prepare well and be punctual to the venue</p>
              <br><br>
              <p>Best of luck!</p>`,
      };
      sgMail.send(msg).catch((error) => {
        console.error(error);
      });
    },
    {
      scheduled: false,
    }
  );
  task1.start();

  // Schedule hour reminder
  // ...
  // (task2 code remains the same)

  const task2 = cron.schedule(
    `0 ${hourReminder.getMinutes()} ${hourReminder.getHours()} ${hourReminder.getDate()} ${
      hourReminder.getMonth() + 1
    } *`,
    () => {
      const msg = {
        to: email,
        from: "olagunjuismail7@gmail.com",
        subject: "Reminder: Exam in an hour",
        html: `<h1 style="color:blueviolet;">Exam Reminder</h1>
        <p>Hello ${name}, this is a friendly reminder that your exam is in an hour at ${examDate}.</p>
        <br><br>
        <p>Best of luck!</p>`,
      };
      sgMail.send(msg).catch((error) => {
        console.error(error);
      });
    },
    {
      scheduled: false,
    }
  );
  task2.start();

  // Schedule 15 minutes reminder
  // ...
  // (task3 code remains the same)
  const task3 = cron.schedule(
    `0 ${minsReminder.getMinutes()} ${minsReminder.getHours()} ${minsReminder.getDate()} ${
      minsReminder.getMonth() + 1
    } *`,
    () => {
      const msg = {
        to: email,
        from: "olagunjuismail7@gmail.com",
        subject: "Reminder: Exam in 15 minutes",
        html: `<h1 style="color:red;">Exam Reminder</h1>
        <p>Hello ${name}, this is a friendly reminder that your exam starts in the next 15 minutes. Gather all your writing materials and head to your venue right now</p>
        <br><br>
        <p>Best of luck ${name}!</p>`,
      };
      sgMail.send(msg).catch((error) => {
        console.error(error);
      });
    },
    {
      scheduled: false,
    }
  );
  task3.start();
}

app.listen(port, async () => {
  console.log(`listening on port ${port}`);

  // Query the database for existing reminders
  const reminders = await Reminder.find();
  // Schedule reminders for each existing reminder
  reminders.forEach((reminder) => {
    scheduleReminder(reminder);
  });
});
