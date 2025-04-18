# Frontend for Team Collaboration Platform

This is the **Frontend** for the Team Collaboration Platform. It is a modern, scalable, and feature-rich web application built using **Next.js**, **React**, and **TypeScript**. The frontend provides a seamless user experience for team communication, collaboration, and project management.

## Features

- **Real-Time Communication**: Chat, video calls, and audio calls with WebSocket and WebRTC integration.
- **Team Collaboration**: File sharing, task management, and collaborative document editing.
- **User Management**: Role-based access control, user authentication, and profile management.
- **Customizable UI**: Responsive design with Tailwind CSS for a consistent experience across devices.
- **Advanced Analytics**: Dashboards and charts for team performance and activity tracking.
- **Integration with Backend Services**: API calls to the backend for data persistence and business logic.

## How It Fits into the Larger Application

This frontend is part of a larger application that includes:

- A **backend API** (Spring Boot) for data persistence and business logic.
- A **WebSocket service** for real-time communication.

The frontend communicates with the backend API and WebSocket service to provide a unified user experience.

## Installation and Setup

### Prerequisites

- Node.js (v16 or higher)
- npm (Node Package Manager)
- Docker (optional, for containerized deployment)

### Steps to Install and Run

1. **Clone the Repository**

   ```bash
   git clone https://github.com/SabinGhost19/mmConnTeams__FRNTND.git
   cd frontend/frntnd
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   Create a `.env.local` file in the root of the project with the following content:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:8080/ws
   ```

4. **Run the Application**

   - For development:
     ```bash
     npm run dev
     ```
   - For production:
     ```bash
     npm run build
     npm start
     ```

5. **Access the Application**
   - URL: [`http://localhost:3000`](http://localhost:3000)

### Docker Deployment

1. **Build the Docker Image**

   ```bash
   docker build -t frontend-app .
   ```

2. **Run the Docker Container**
   ```bash
   docker run -p 3000:3000 --env-file .env.local frontend-app
   ```

## Project Structure

```
frntnd/
├── app/                     # Main application folder
│   ├── admin/               # Admin dashboard and pages
│   ├── chat/                # Chat functionality
│   ├── chatAsistant/        # Chat assistant features
│   ├── components/          # Reusable UI components
│   ├── contexts/            # Context providers for global state
│   ├── dashboard/           # Dashboard pages
│   ├── hooks/               # Custom React hooks
│   ├── learnmore/           # Learn more pages
│   ├── lib/                 # Utility functions and API helpers
│   ├── login/               # Login pages
│   ├── paginatest/          # Pagination test pages
│   ├── providers/           # Providers for external libraries
│   ├── register/            # Registration pages
│   ├── services/            # Service-specific pages and components
│   ├── stream/              # Streaming-related pages
│   ├── teams/               # Team management pages
│   ├── testLab/             # Test lab pages
│   ├── types/               # TypeScript types and interfaces
│   ├── users/               # User management pages
│   └── layout.tsx          # Root layout for the application
├── public/                  # Static assets
├── styles/                  # Global styles
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Project metadata and dependencies
```

### Directory Roles

- **`app/`**: Contains all the pages and components for the application.
- **`components/`**: Reusable UI components such as buttons, modals, and sidebars.
- **`contexts/`**: Context providers for managing global state (e.g., authentication).
- **`hooks/`**: Custom React hooks for reusable logic.
- **`lib/`**: Utility functions and API helpers for interacting with the backend.
- **`services/`**: Service-specific pages and components (e.g., chat, teams, admin).
- **`types/`**: TypeScript types and interfaces for strong typing.
- **`public/`**: Static assets like images and icons.
- **`tailwind.config.js`**: Configuration for Tailwind CSS.
- **`tsconfig.json`**: TypeScript configuration for the project.

## API Integration

- **Backend API**: Provides data persistence and business logic. The frontend interacts with the backend API for user authentication, team management, and more.
- **WebSocket Service**: Enables real-time communication features like chat and notifications.

## Example Usage

1. **Login**

   - Endpoint: `/login`
   - Description: User authentication with email and password.

2. **Create a Team**

   - Endpoint: `/teams`
   - Description: Create a new team with a name and description.

3. **Join a Channel**

   - Endpoint: `/chat`
   - Description: Join a chat channel and start messaging.

4. **Start a Video Call**
   - Endpoint: `/stream`
   - Description: Start a video call with team members.

## Admin Functionalities

1. **Dashboard and Management**

   - The `/admin` section provides an interface for administrators to manage users, teams, and channels. Admins can view detailed statistics and perform actions such as creating, updating, or deleting resources.

2. **Data Visualization**

   - Using `chat.js`, the admin dashboard includes graphical representations of data from the database. This allows administrators to analyze user activity, team performance, and other key metrics in a visually intuitive way.

3. **Future Enhancements**
   - Additional features such as advanced filtering, exporting data, and real-time updates for admin actions are planned to make the admin interface more robust and user-friendly.

## What I Haven't Managed to Solve and Add So Far

1. **Responsive Design**

   - Not all pages of the application are fully responsive. Due to limited experience with frontend responsiveness, implementing a design that adapts seamlessly to all devices has been challenging.

2. **Streaming Functionality**

   - The streaming feature currently works with only one camera. If another browser is opened, a different account is used, and the same room ID is entered, the camera cannot be accessed due to conflicts (e.g., "camera already in use"). To fully test and implement this feature, multiple cameras need to be connected to the device, and each account must select a different camera when joining the room.

3. **Notifications in Teams**

   - Displaying notifications for events such as new channels, new events, or being added to a new team needs to be made more robust. Currently, this functionality is disabled because it modifies the state of other components in the context. Alternatives include:
     - Using a classic RESTful approach where updates are visible only after a full page refresh.
     - Implementing real-time updates using WebSocket for a seamless experience.

4. **Admin and Team Management**
   - The delete functionality at the admin level and the ability to leave a channel or team need to be implemented more robustly. Currently, the focus has been on creating and displaying new resources and managing relationships between components.
   - **Problem Encountered**: Displaying whether a user is connected or not.
     - **Current Solution**: Upon logout, the refresh token is deleted from the database, and the query for the number of online users is based on the tokens present in the database. This solution works but may not be optimal.

## Other Concerns and Future Plans

- **Overengineering vs Practicality**: There is a concern that the project may have too many features or that too much time has been spent on documentation, analysis, and learning new technologies and protocols. This could lead to overengineering instead of focusing on the practical side: just making it work. Future efforts should aim to balance innovation with delivering a functional and user-friendly application.

## Health Check

You can verify the application is running by accessing the root URL:

```bash
http://localhost:3000
```
