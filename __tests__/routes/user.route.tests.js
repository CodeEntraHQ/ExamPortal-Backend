import request from "supertest";
import app from "../../src/app.js"; // Adjust the path to your Express app
import http from "http";

const server = http.createServer(app);
import { verifyJWT } from "../../src/middleware/auth.middleware.js";

// Mock the verifyJWT middleware to bypass authentication for testing
jest.mock("../../src/middleware/auth.middleware.js", () => ({
  verifyJWT: jest.fn((req, res, next) => next()),
}));

describe("User Routes", () => {
  test("POST / - onboardUsers", async () => {
    const response = await request(server)
      .post("/v1/users/onboard")
      .send({ name: "Test User", email: "test@example.com" });
    expect(response.statusCode).toBe(200); // Adjust based on your controller logic
    expect(response.body).toHaveProperty("message");
  });

  // test("POST /login - loginUser", async () => {
  //   const response = await request(app)
  //     .post("/login")
  //     .send({ email: "test@example.com", password: "password123" });
  //   expect(response.statusCode).toBe(200); // Adjust based on your controller logic
  //   expect(response.body).toHaveProperty("token");
  // });

  // test("POST /register - studentRegistration", async () => {
  //   const response = await request(app)
  //     .post("/register")
  //     .send({ name: "Student", email: "student@example.com", password: "password123" });
  //   expect(response.statusCode).toBe(201); // Adjust based on your controller logic
  //   expect(response.body).toHaveProperty("message");
  // });

  // test("GET / - getAllAdmins", async () => {
  //   const response = await request(app).get("/");
  //   expect(response.statusCode).toBe(200); // Adjust based on your controller logic
  //   expect(response.body).toBeInstanceOf(Array); // Assuming it returns an array of admins
  // });

  // test("GET /students - getAllStudents", async () => {
  //   const response = await request(app).get("/students");
  //   expect(response.statusCode).toBe(200); // Adjust based on your controller logic
  //   expect(response.body).toBeInstanceOf(Array); // Assuming it returns an array of students
  // });
});