// import request from 'supertest';
// import { Op } from 'sequelize';
// import app from '../../src/app';
// import { login } from '../utils';
// import College from '../../src/models/college.model.js';
// import Enrollment from '../../src/models/enrollment.model.js';
// import Exam from '../../src/models/exam.model.js';
// import Question from '../../src/models/question.model.js';
// import Result from '../../src/models/result.model.js';
// import Submission from '../../src/models/submission.model.js';
// import User from '../../src/models/user.model.js';

// describe('User Routes', () => {

//   it.todo('should have tests');
//   // let token;
//   // let collegeId;

//   // beforeAll(async () => {
//   //   token = await login('superadmin@example.com', 'password');
//   //   const collegeRes = await request(app)
//   //     .post('/v1/colleges')
//   //     .set('Authorization', `Bearer ${token}`)
//   //     .send({
//   //       name: 'Test College',
//   //       address: 'Test Address',
//   //     });
//   //   collegeId = collegeRes.body.payload.id;
//   // });

//   // describe('POST /v1/users/register', () => {
//   //   it('should register a new student', async () => {
//   //     const res = await request(app)
//   //       .post('/v1/users/register')
//   //       .send({
//   //         name: 'Test Student',
//   //         email: `student_${Date.now()}@example.com`,
//   //         password: 'password',
//   //       });
//   //     expect(res.statusCode).toEqual(200);
//   //     expect(res.body.status).toBe('SUCCESS');
//   //     expect(res.body.responseMsg).toBe('STUDENT_REGISTERED');
//   //     expect(res.body.payload).toHaveProperty('id');
//   //     expect(res.body.payload.role).toBe('STUDENT');
//   //   });
//   // });

//   // describe('POST /v1/users/login', () => {
//   //   it('should login a user', async () => {
//   //     const res = await request(app)
//   //       .post('/v1/users/login')
//   //       .send({
//   //         email: 'superadmin@example.com',
//   //         password: 'password',
//   //       });
//   //     expect(res.statusCode).toEqual(200);
//   //     expect(res.body.status).toBe('SUCCESS');
//   //     expect(res.body.responseMsg).toBe('LOGIN_SUCCESSFUL');
//   //     expect(res.body.payload).toHaveProperty('token');
//   //     expect(res.body.payload.user).toHaveProperty('id');
//   //     expect(res.body.payload.user.role).toBe('SUPERADMIN');
//   //   });

//   //   it('should fail to login with wrong credentials', async () => {
//   //     const res = await request(app)
//   //       .post('/v1/users/login')
//   //       .send({
//   //         email: 'wrong@example.com',
//   //         password: 'wrongpassword',
//   //       });
//   //     expect(res.statusCode).toEqual(404);
//   //     expect(res.body.status).toBe('FAILURE');
//   //     expect(res.body.responseMsg).toBe('AUTHENTICATION_FAILED');
//   //   });
//   // });

//   // describe('GET /v1/users', () => {
//   //   it('should list users', async () => {
//   //     const res = await request(app)
//   //       .get('/v1/users')
//   //       .set('Authorization', `Bearer ${token}`);
//   //     expect(res.statusCode).toEqual(200);
//   //     expect(res.body.status).toBe('SUCCESS');
//   //     expect(res.body.responseMsg).toBe('ADMINS_FETCHED');
//   //     expect(res.body.payload).toHaveProperty('users');
//   //   });
//   // });

//   // describe('POST /v1/users', () => {
//   //   it('should onboard a new user', async () => {
//   //     const res = await request(app)
//   //       .post('/v1/users')
//   //       .set('Authorization', `Bearer ${token}`)
//   //       .send({
//   //         name: 'Test Admin',
//   //         email: `admin_${Date.now()}@example.com`,
//   //         password: 'password',
//   //         role: 'ADMIN',
//   //         college_id: collegeId,
//   //       });
//   //     expect(res.statusCode).toEqual(200);
//   //     expect(res.body.status).toBe('SUCCESS');
//   //     expect(res.body.responseMsg).toBe('USER_ONBOARDED');
//   //     expect(res.body.payload).toHaveProperty('id');
//   //   });
//   // });

//   // describe('PATCH /v1/users/toggle-active', () => {
//   //   it('should toggle user active status', async () => {
//   //     // First, create a user to toggle
//   //     const newUserRes = await request(app)
//   //       .post('/v1/users')
//   //       .set('Authorization', `Bearer ${token}`)
//   //       .send({
//   //         name: 'Test User for Toggle',
//   //         email: `toggle_${Date.now()}@example.com`,
//   //         password: 'password',
//   //         role: 'STUDENT',
//   //         college_id: collegeId,
//   //       });
//   //     const userId = newUserRes.body.payload.id;

//   //     const res = await request(app)
//   //       .patch('/v1/users/toggle-active')
//   //       .set('Authorization', `Bearer ${token}`)
//   //       .send({
//   //         user_id: userId,
//   //         active: false,
//   //       });
//   //     expect(res.statusCode).toEqual(200);
//   //     expect(res.body.status).toBe('SUCCESS');
//   //     expect(res.body.responseMsg).toBe('User status updated');
//   //     expect(res.body.payload.active).toBe(false);
//   //   });
//   // });
// });
