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

// describe('Exam Routes', () => {

//   it.todo('should have tests');
//   // let superadminToken;
//   // let adminToken;
//   // let studentToken;
//   // let collegeId;
//   // let examId;
//   // let questionId;
//   // let studentId;

//   // beforeAll(async () => {
//   //   // Login as superadmin
//   //   superadminToken = await login('superadmin@example.com', 'password');

//   //   // Onboard a college
//   //   const collegeRes = await request(app)
//   //     .post('/v1/colleges')
//   //     .set('Authorization', `Bearer ${superadminToken}`)
//   //     .send({
//   //       name: 'Test College for Exams',
//   //       address: 'Test Address',
//   //     });
//   //   collegeId = collegeRes.body.payload.id;

//   //   // Onboard an admin
//   //   const adminEmail = `admin_${Date.now()}@example.com`;
//   //   await request(app)
//   //     .post('/v1/users')
//   //     .set('Authorization', `Bearer ${superadminToken}`)
//   //     .send({
//   //       name: 'Test Admin for Exams',
//   //       email: adminEmail,
//   //       password: 'password',
//   //       role: 'ADMIN',
//   //       college_id: collegeId,
//   //     });

//   //   // Login as admin
//   //   adminToken = await login(adminEmail, 'password');

//   //   // Register a student
//   //   const studentEmail = `student_${Date.now()}@example.com`;
//   //   const studentRes = await request(app)
//   //     .post('/v1/users/register')
//   //     .send({
//   //       name: 'Test Student for Exams',
//   //       email: studentEmail,
//   //       password: 'password',
//   //     });
//   //   studentId = studentRes.body.payload.id;

//   //   // Login as student
//   //   studentToken = await login(studentEmail, 'password');
//   // });

//   // describe('POST /v1/exams', () => {
//   //   it('should create a new exam', async () => {
//   //     const res = await request(app)
//   //       .post('/v1/exams')
//   //       .set('Authorization', `Bearer ${adminToken}`)
//   //       .send({
//   //         title: 'Test Exam',
//   //         type: 'QUIZ',
//   //       });
//   //     expect(res.statusCode).toEqual(200);
//   //     expect(res.body.status).toBe('SUCCESS');
//   //     expect(res.body.responseMsg).toBe('EXAM_CREATED');
//   //     expect(res.body.payload).toHaveProperty('id');
//   //     examId = res.body.payload.id;
//   //   });
//   // });

//   // describe('POST /v1/exams/question', () => {
//   //   it('should create a new question', async () => {
//   //     const res = await request(app)
//   //       .post('/v1/exams/question')
//   //       .set('Authorization', `Bearer ${adminToken}`)
//   //       .send({
//   //         exam_id: examId,
//   //         question_text: 'What is 2+2?',
//   //         type: 'MCQ',
//   //         metadata: {
//   //           options: ['1', '2', '3', '4'],
//   //           correct_answers: [3],
//   //         },
//   //       });
//   //     expect(res.statusCode).toEqual(200);
//   //     expect(res.body.status).toBe('success');
//   //     expect(res.body.responseMsg).toBe('QUESTION_CREATED');
//   //     expect(res.body.payload).toHaveProperty('question_id');
//   //     questionId = res.body.payload.question_id;
//   //   });
//   // });

//   // describe('POST /v1/exams/invite', () => {
//   //   it('should invite students to an exam', async () => {
//   //     const res = await request(app)
//   //       .post('/v1/exams/invite')
//   //       .set('Authorization', `Bearer ${adminToken}`)
//   //       .send({
//   //         exam_id: examId,
//   //         student_ids: [studentId],
//   //       });
//   //     expect(res.statusCode).toEqual(200);
//   //     expect(res.body.status).toBe('SUCCESS');
//   //     expect(res.body.responseMsg).toBe('STUDENT_INVITED');
//   //   });
//   // });

//   // describe('GET /v1/exams', () => {
//   //   it('should fetch exams for a superadmin', async () => {
//   //     const res = await request(app)
//   //       .get('/v1/exams')
//   //       .set('Authorization', `Bearer ${superadminToken}`);
//   //     expect(res.statusCode).toEqual(200);
//   //     expect(res.body.status).toBe('SUCCESS');
//   //     expect(res.body.responseMsg).toBe('EXAMS_FETCHED');
//   //     expect(res.body.payload).toHaveProperty('exams');
//   //   });

//   //   it('should fetch exams for an admin', async () => {
//   //     const res = await request(app)
//   //       .get('/v1/exams')
//   //       .set('Authorization', `Bearer ${adminToken}`);
//   //     expect(res.statusCode).toEqual(200);
//   //     expect(res.body.status).toBe('SUCCESS');
//   //     expect(res.body.responseMsg).toBe('EXAMS_FETCHED');
//   //     expect(res.body.payload).toHaveProperty('exams');
//   //   });

//   //   it('should fetch exams for a student', async () => {
//   //     const res = await request(app)
//   //       .get('/v1/exams')
//   //       .set('Authorization', `Bearer ${studentToken}`);
//   //     expect(res.statusCode).toEqual(200);
//   //     expect(res.body.status).toBe('SUCCESS');
//   //     expect(res.body.responseMsg).toBe('EXAMS_FETCHED');
//   //     expect(res.body.payload).toHaveProperty('exams');
//   //   });
//   // });

//   // describe('GET /v1/exams/question', () => {
//   //   it('should fetch questions for an admin', async () => {
//   //     const res = await request(app)
//   //       .get(`/v1/exams/question?exam_id=${examId}`)
//   //       .set('Authorization', `Bearer ${adminToken}`);
//   //     expect(res.statusCode).toEqual(200);
//   //     expect(res.body.status).toBe('success');
//   //     expect(res.body.responseMsg).toBe('QUESTIONS_FETCHED');
//   //     expect(res.body.payload).toHaveProperty('questions');
//   //   });

//   //   it('should fetch questions for a student', async () => {
//   //     const res = await request(app)
//   //       .get(`/v1/exams/question?exam_id=${examId}`)
//   //       .set('Authorization', `Bearer ${studentToken}`);
//   //     expect(res.statusCode).toEqual(200);
//   //     expect(res.body.status).toBe('success');
//   //     expect(res.body.responseMsg).toBe('QUESTIONS_FETCHED');
//   //     expect(res.body.payload).toHaveProperty('questions');
//   //   });
//   // });

//   // describe('POST /v1/exams/submit', () => {
//   //   it('should submit an exam', async () => {
//   //     const res = await request(app)
//   //       .post('/v1/exams/submit')
//   //       .set('Authorization', `Bearer ${studentToken}`)
//   //       .send({
//   //         exam_id: examId,
//   //         answers: [
//   //           {
//   //             question_id: questionId,
//   //             answer: ['4'],
//   //           },
//   //         ],
//   //       });
//   //     expect(res.statusCode).toEqual(200);
//   //     expect(res.body.status).toBe('success');
//   //     expect(res.body.responseMsg).toBe('EXAM_SUBMITTED');
//   //     expect(res.body.payload).toHaveProperty('score');
//   //   });
//   // });

//   // describe('GET /v1/exams/scoreboard', () => {
//   //   it('should fetch the scoreboard', async () => {
//   //     const res = await request(app)
//   //       .get(`/v1/exams/scoreboard?exam_id=${examId}`)
//   //       .set('Authorization', `Bearer ${adminToken}`);
//   //     expect(res.statusCode).toEqual(200);
//   //     expect(res.body.status).toBe('SUCCESS');
//   //     expect(res.body.responseMsg).toBe('SCOREBOARD_FETCHED');
//   //     expect(res.body.payload).toHaveProperty('scoreboard');
//   //   });
//   // });

//   // describe('GET /v1/exams/scoreboard/download', () => {
//   //   it('should download the scoreboard as a PDF', async () => {
//   //     const res = await request(app)
//   //       .get(`/v1/exams/scoreboard/download?exam_id=${examId}`)
//   //       .set('Authorization', `Bearer ${adminToken}`);
//   //     expect(res.statusCode).toEqual(200);
//   //     expect(res.header['content-type']).toEqual('application/pdf');
//   //   });
//   // });
// });
