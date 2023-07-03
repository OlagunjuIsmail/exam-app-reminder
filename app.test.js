const request = require("supertest");
const { app } = require("./server"); // Update the path to your server file

describe("POST /add", () => {
  it("should add a new reminder and send a confirmation email", async () => {
    const reminder = {
      name: "Test Name",
      email: "olagunjuakanfe@gmail.com",
      matric: "12345",
      date: "2023-07-03",
      time: "17:20",
    };
    const response = await request(app).post("/add").send(reminder);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Exam reminder set successfully");
  }, 40000);
});
