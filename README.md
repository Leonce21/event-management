Event Management Frontend (Angular 21)

This project is a modern Angular 21 frontend application for an Event Management System.
It consumes open REST APIs to create, update, delete, and view events.

The application follows enterprise-level Angular architecture, with clear separation of concerns, reusable services, and feature modules.

🚀 Tech Stack

Angular 21

TypeScript

RxJS

SCSS

Angular Router

HTTPClient

REST API Integration

Modular Architecture


🔗 Backend API Integration

The frontend communicates with a RESTful backend (NestJS / Spring Boot compatible).

API Endpoints Used
Method	Endpoint	Description
POST	/api/events	Create an event
PUT	/api/events/{id}	Update an event
DELETE	/api/events/{id}	Delete an event
GET	/api/events/{id}	Get single event
GET	/api/events	Get all events

All endpoints are open (no authentication required).

🛠️ Setup & Installation
1️⃣ Prerequisites

Node.js (v18+ recommended)

Angular CLI 21+

npm install -g @angular/cli

2️⃣ Install Dependencies
npm install

3️⃣ Run Development Server
ng serve


The application will be available at:

http://localhost:4200