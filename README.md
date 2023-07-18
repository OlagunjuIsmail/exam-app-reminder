# Exam Reminder
Access the site here https://exam-app-reminder.ismailakanfe.me/

Exam Reminder is a web application that allows users to register for exam reminders. Users can enter their personal details and exam date, and the system sends email reminders to users at specified times before the exam.

## Features
- User-friendly interface
- Email reminders sent automatically
- Multiple reminder options: 15 minutes, 1 hour, and 1 day before the exam
- User data validation to ensure accuracy

## Installation
1. Clone this repository to your local machine.
2. Run `npm install` to install the necessary dependencies.
3. Create a `.env` file and add your SendGrid API key and Atlas URI. Example:

    ```
    SG_API_KEY=your_sendgrid_api_key
    ATLAS_URI=your_atlas_uri
    ```

4. Start the server with `npm start`.

## Usage
1. Open your browser and go to http://localhost:3000.
2. Fill in the registration form with your personal details and exam date.
3. Click the "Submit" button.
4. You will receive a confirmation email and exam reminders at the specified times.

## Technologies Used
- Node.js
- Express.js
- MongoDB
- Mongoose
- SendGrid
- Cron



## License
This project is licensed under the MIT License - see the LICENSE file for details.
