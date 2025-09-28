# API Contract

This document outlines the contract for the ExamPortal API.

---

## Healthcheck API

### Get App Health

- **Method:** `GET`
- **Endpoint:** `/healthcheck/app`
- **Description:** Checks the health of the application.
- **Authorization:** None
- **Headers:** None
- **Request Body:** None
- **Response:**
  ```json
  {
    "success": true,
    "message": "App is running",
    "data": null
  }
  ```

---

## Entity API

### Get Entities

- **Method:** `GET`
- **Endpoint:** `/entity`
- **Description:** Retrieves a paginated list of entities.
- **Authorization:** `SUPERADMIN`
- **Headers:**
  - `Authorization`: `Bearer <token>`
- **Query Parameters:**
  - `page` (optional, integer, default: 1)
  - `limit` (optional, integer, default: 10)
- **Response:**
  ```json
  {
    "success": true,
    "message": "Entities retrieved successfully",
    "data": {
      "total": "integer",
      "page": "integer",
      "limit": "integer",
      "totalPages": "integer",
      "entities": [
        {
          "id": "uuid",
          "name": "string",
          "address": "string"
        }
      ]
    }
  }
  ```

### Create Entity

- **Method:** `POST`
- **Endpoint:** `/entity`
- **Description:** Creates a new entity.
- **Authorization:** `SUPERADMIN`
- **Headers:**
  - `Authorization`: `Bearer <token>`
- **Request Body:**
  ```json
  {
    "name": "string",
    "address": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Entity created successfully",
    "data": {
      "id": "uuid",
      "name": "string",
      "address": "string"
    }
  }
  ```

### Update Entity

- **Method:** `PATCH`
- **Endpoint:** `/entity`
- **Description:** Updates an existing entity.
- **Authorization:** `SUPERADMIN`
- **Headers:**
  - `Authorization`: `Bearer <token>`
- **Request Body:**
  ```json
  {
    "entity_id": "uuid",
    "name": "string (optional)",
    "address": "string (optional)"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Entity updated successfully",
    "data": {
      "id": "uuid",
      "name": "string",
      "address": "string"
    }
  }
  ```

---

## Exam API

### Create Exam

- **Method:** `POST`
- **Endpoint:** `/exam`
- **Description:** Creates a new exam.
- **Authorization:** `SUPERADMIN`, `ADMIN`
- **Headers:**
  - `Authorization`: `Bearer <token>`
- **Request Body:**
  ```json
  {
    "title": "string",
    "type": "string",
    "entity_id": "uuid (optional)"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Exam created successfully",
    "data": {
      "id": "uuid",
      "title": "string"
    }
  }
  ```

### Get Exams

- **Method:** `GET`
- **Endpoint:** `/exam`
- **Description:** Retrieves a paginated list of exams.
- **Authorization:** `SUPERADMIN`, `ADMIN`, `STUDENT`
- **Headers:**
  - `Authorization`: `Bearer <token>`
- **Query Parameters:**
  - `page` (optional, integer, default: 1)
  - `limit` (optional, integer, default: 10)
  - `entity_id` (optional, uuid)
- **Response:**
  ```json
  {
    "success": true,
    "message": "Exams retrieved successfully",
    "data": {
      "total": "integer",
      "page": "integer",
      "limit": "integer",
      "totalPages": "integer",
      "exams": [
        {
          "id": "uuid",
          "title": "string",
          "type": "string",
          "active": "boolean",
          "created_at": "timestamp"
        }
      ]
    }
  }
  ```

### Create Question

- **Method:** `POST`
- **Endpoint:** `/exam/question`
- **Description:** Creates a new question for an exam.
- **Authorization:** `SUPERADMIN`, `ADMIN`
- **Headers:**
  - `Authorization`: `Bearer <token>`
- **Request Body:**
  ```json
  {
    "exam_id": "uuid",
    "question_text": "string",
    "type": "MCQ",
    "metadata": "any"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Question created successfully",
    "data": {
      "id": "uuid"
    }
  }
  ```

### Get Questions

- **Method:** `GET`
- **Endpoint:** `/exam/question`
- **Description:** Retrieves a paginated list of questions for an exam.
- **Authorization:** `SUPERADMIN`, `ADMIN`, `STUDENT`
- **Headers:**
  - `Authorization`: `Bearer <token>`
- **Query Parameters:**
  - `exam_id`: "uuid"
  - `page` (optional, integer, default: 1)
  - `limit` (optional, integer, default: 10)
- **Response:**
  ```json
  {
    "success": true,
    "message": "Questions retrieved successfully",
    "data": {
      "total": "integer",
      "page": "integer",
      "limit": "integer",
      "totalPages": "integer",
      "questions": [
        {
          "id": "uuid",
          "question_text": "string",
          "type": "MCQ",
          "metadata": "any"
        }
      ]
    }
  }
  ```

### Invite Student

- **Method:** `POST`
- **Endpoint:** `/exam/invite`
- **Description:** Invites students to an exam.
- **Authorization:** `SUPERADMIN`, `ADMIN`
- **Headers:**
  - `Authorization`: `Bearer <token>`
- **Request Body:**
  ```json
  {
    "exam_id": "uuid",
    "student_emails": ["string"]
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Students invited successfully",
    "data": {
      "totalInvited": "integer",
      "invalidEmails": ["string"]
    }
  }
  ```

---

## User API

### Login User

- **Method:** `POST`
- **Endpoint:** `/user/login`
- **Description:** Logs in a user.
- **Authorization:** None
- **Headers:**
  - `Authorization`: `Bearer <token>`
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string",
    "captcha": "integer"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "User logged in successfully",
    "data": {
      "token": "string",
      "user": {
        "id": "uuid",
        "name": "string",
        "email": "string",
        "role": "string"
      }
    }
  }
  ```

### Get Captcha

- **Method:** `GET`
- **Endpoint:** `/user/captcha`
- **Description:** Retrieves a captcha.
- **Authorization:** None
- **Headers:** None
- **Request Body:** None
- **Response:**
  ```json
  {
    "success": true,
    "message": "Captcha retrieved successfully",
    "data": {
      "token": "string",
      "captcha": "string",
      "captchaAnswer": "string"
    }
  }
  ```

### Forgot Password

- **Method:** `POST`
- **Endpoint:** `/user/password/forgot`
- **Description:** Sends a password reset link to the user's email.
- **Authorization:** None
- **Headers:** None
- **Request Body:**
  ```json
  {
    "email": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Password reset link sent successfully"
  }
  ```

### Reset Password

- **Method:** `POST`
- **Endpoint:** `/user/password/reset`
- **Description:** Resets the user's password.
- **Authorization:** `SUPERADMIN`, `ADMIN`, `STUDENT`
- **Headers:**
  - `Authorization`: `Bearer <token>`
- **Request Body:**
  ```json
  {
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Password reset successfully"
  }
  ```

### Change Password

- **Method:** `POST`
- **Endpoint:** `/user/password/change`
- **Description:** Changes the user's password.
- **Authorization:** `SUPERADMIN`, `ADMIN`, `STUDENT`
- **Headers:**
  - `Authorization`: `Bearer <token>`
- **Request Body:**
  ```json
  {
    "oldPassword": "string",
    "newPassword": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Password changed successfully"
  }
  ```

### Renew Login

- **Method:** `POST`
- **Endpoint:** `/user/renew`
- **Description:** Renews the user's login session.
- **Authorization:** `SUPERADMIN`, `ADMIN`, `STUDENT`
- **Headers:**
  - `Authorization`: `Bearer <token>`
- **Request Body:** None
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login renewed successfully",
    "data": {
      "token": "string"
    }
  }
  ```

### Invite User

- **Method:** `POST`
- **Endpoint:** `/user/invite`
- **Description:** Invites a new user.
- **Authorization:** `SUPERADMIN`, `ADMIN`
- **Headers:**
  - `Authorization`: `Bearer <token>`
- **Request Body:**
  ```json
  {
    "email": "string",
    "role": "ADMIN | STUDENT",
    "entity_id": "uuid (optional)"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "User invited successfully",
    "data": {
      "id": "uuid",
      "role": "string"
    }
  }
  ```

### Register User

- **Method:** `POST`
- **Endpoint:** `/user/register`
- **Description:** Registers a new user.
- **Authorization:** `SUPERADMIN`, `ADMIN`, `STUDENT`
- **Headers:**
  - `Authorization`: `Bearer <token>`
- **Request Body:**
  ```json
  {
    "name": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "id": "uuid",
      "role": "string"
    }
  }
  ```

### Deregister User

- **Method:** `PATCH`
- **Endpoint:** `/user/deregister`
- **Description:** Deregisters a user.
- **Authorization:** `SUPERADMIN`, `ADMIN`, `STUDENT`
- **Headers:**
  - `Authorization`: `Bearer <token>`
- **Request Body:**
  ```json
  {
    "user_id": "uuid (optional)"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "User deregistered successfully"
  }
  ```

### Update User

- **Method:** `PATCH`
- **Endpoint:** `/user`
- **Description:** Updates a user's name and profile picture.
- **Authorization:** `SUPERADMIN`, `ADMIN`, `STUDENT`
- **Headers:**
  - `Authorization`: `Bearer <token>`
  - `Content-Type`: `multipart/form-data`
- **Request Body (multipart/form-data):**
  - `name` (optional, string)
  - `profile_picture` (optional, file)
> **Note:** The `profile_picture` is handled as a file upload and is not part of the JSON body validated by the schema.
- **Response:**
  ```json
  {
    "success": true,
    "message": "User updated successfully",
    "data": {
      "id": "uuid",
      "name": "string",
      "profile_picture_url": "string"
    }
  }
  ```

### Get Users

- **Method:** `GET`
- **Endpoint:** `/user`
- **Description:** Retrieves a paginated list of users.
- **Authorization:** `SUPERADMIN`, `ADMIN`
- **Headers:**
  - `Authorization`: `Bearer <token>`
- **Query Parameters:**
  - `entity_id`: "uuid"
  - `role`: "ADMIN | STUDENT"
  - `page` (optional, integer, default: 1)
  - `limit` (optional, integer, default: 10)
- **Response:**
  ```json
  {
    "success": true,
    "message": "Users retrieved successfully",
    "data": {
      "total": "integer",
      "page": "integer",
      "limit": "integer",
      "totalPages": "integer",
      "users": [
        {
          "id": "uuid",
          "name": "string",
          "email": "string",
          "role": "string",
          "status": "string"
        }
      ]
    }
  }
