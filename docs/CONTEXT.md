# Mistral OCR Conversion App: Context & Features

## 1. Introduction
This document provides a high-level overview of the **Mistral OCR Conversion App**. The aim of this app is to allow users to quickly convert images of documents into fully searchable PDF documents using the **Mistral OCR** service. The frontend is built with **Lynx**, the backend uses **Node.js (Express)**, and **MongoDB** is used as the database.

## Tech Stack:
- Frontend/App: LynxJS
- Backend/Database: NodeJS Express / MongoDB
- AI Processing: Claude

## 2. Core Objectives
1. **Simple and Modern UI**: A minimalistic 2025 design approach, focusing on user-friendliness.
2. **OCR Conversion**: Integrate Mistral OCR API to process image files and produce PDF outputs.
3. **Single Task Flow**: The user can convert one document at a time, ensuring clarity and avoiding confusion.
4. **History Tracking**: The user can review previously converted documents.
5. **File Management**: Users can save or share the converted PDFs.

## 3. App Flow Summary
Below is a simplified overview of the user journey:

1. **Welcome Screen**  
   - Clean, modern landing page.  
   - Offers a signup button or a prompt to log in if the user already has an account.

2. **Signup / Login**  
   - Allows the user to create a new account using their email address or log in with existing credentials.  
   - On success, the user is directed to the main dashboard.

3. **Main Dashboard**  
   - Displays an **Upload** button for starting a new conversion task.  
   - Shows a brief instruction on how to use the OCR service.  
   - Provides a menu or icon for navigation to different sections (e.g., History, Settings, Logout).

4. **File Upload & Conversion**  
   - After clicking the **Upload** button, the user selects an image file (document picture).  
   - The system sends the file to the backend.  
   - The backend then calls the **Mistral OCR API**.  
   - A progress bar is displayed to indicate the conversion status.

5. **PDF Generation**  
   - The OCR API responds with a converted document in PDF format.  
   - The system stores this PDF in MongoDB or on a dedicated file storage.  
   - The user is notified when the conversion is complete.

6. **Save or Share**  
   - The user can then choose to **save** the resulting PDF in their document library or directly **share** it.  
   - Sharing options can include email or other integrated platforms.

7. **Document History**  
   - A dedicated page lists all previously converted documents.  
   - Each history item displays:  
     - Document name  
     - Creation date  
     - Option to download or share

8. **Logout**  
   - The user can log out at any time to end the session.

## 4. Detailed Feature Breakdown

### 4.1 Welcome Screen
- **Purpose**: Provide a clean entry point for new and returning users.  
- **Features**:  
  - Large signup or login buttons.  
  - Branding elements (logo, app name).  
  - Possibly a short tagline, e.g., *"Transform images to PDFs in just one click."*

### 4.2 Signup & Login
- **Purpose**: Securely authenticate users.  
- **Implementation**:  
  - **Signup**: Collect email, password, and any basic user information.  
  - **Login**: Validate credentials against the database.  
  - **Password Handling**: Passwords should be hashed and never stored in plain text.  
  - **Session Management**: Use JWT or sessions to maintain authentication status.

### 4.3 Main Dashboard
- **Purpose**: Central hub for users after authentication.  
- **Key Elements**:  
  - **Upload Button**: Triggers the file selection and conversion process.  
  - **Menu**: Navigation to other sections (History, Settings, etc.).  
  - **Quick Stats** (optional): Show total documents converted or any personalized data.

### 4.4 File Upload & Mistral OCR Integration
- **Purpose**: Let the user attach an image file and convert it to a PDF using Mistral OCR.  
- **Workflow**:  
  1. **User selects file** in the app.  
  2. **Frontend** sends file data (or a reference) to the **Node.js (Express) backend**.  
  3. **Backend** calls **Mistral OCR API** with the uploaded file.  
  4. **OCR** returns the recognized text and a generated PDF.  
  5. **Backend** either temporarily stores the file or streams it directly to the database/storage.  
  6. A **progress bar** on the frontend updates the user about the status (uploading, processing, completed).

### 4.5 PDF Generation
- **Purpose**: Provide the final converted document to the user.  
- **Implementation**:  
  - Store PDFs in **MongoDB** (GridFS) or a file storage service, referencing them in the database.  
  - Return the PDF link or ID to the frontend once processing is complete.  

### 4.6 Save & Share
- **Purpose**: Allow quick actions once the PDF is ready.  
- **Implementation**:  
  - **Save**: Moves the document into the user's "converted documents" collection or folder.  
  - **Share**: Provide a share link or direct integration (email, external app, etc.).  
  - **UI**: Buttons or icons for each action, placed near the PDF preview or download link.

### 4.7 Document History
- **Purpose**: Access previously converted documents.  
- **Features**:  
  - List all documents with names, thumbnails, or short descriptions.  
  - **On-click**: Download or share.  
  - Remove or archive documents if desired.

### 4.8 Logout
- **Purpose**: End user session and maintain security.  
- **Implementation**:  
  - **Client-side**: Clear tokens or session data.  
  - **Server-side**: Invalidate session tokens if using session-based authentication.

## 5. High-Level Technical Overview

### 5.1 Frontend (Lynx)
- **Framework**: Lynx (a minimal UI library).  
- **Structure**:  
  - **Pages**: `WelcomePage`, `SignupPage`, `LoginPage`, `DashboardPage`, `HistoryPage`  
  - **Components**: `UploadButton`, `DocumentPreview`, `ProgressBar`, `Menu`  
- **API Calls**:  
  - `POST /api/auth/signup`  
  - `POST /api/auth/login`  
  - `POST /api/ocr/upload`  
  - `GET /api/history`  
  - etc.

### 5.2 Backend (Node.js & Express)
- **API**:  
  - **Auth Routes**: Handle signup & login  
  - **OCR Route**: Endpoint for image upload and calling Mistral OCR  
  - **History Route**: Retrieve user's past conversions  
- **Middleware**:  
  - **Authentication** (JWT or session-based)  
  - **File Handling** (multer or similar for uploads)  
  - **Error Handling** (centralized error responses)

### 5.3 Mistral OCR Integration
- **API Call**:
  - Send a `multipart/form-data` request with the image to Mistral's endpoint.  
  - Handle the response containing the recognized text and PDF.  
  - Possible retry or error handling if Mistral service is unreachable.

### 5.4 Database (MongoDB)
- **Data Storage**:  
  - **Users Collection**: Basic user profile & authentication info.  
  - **Documents Collection**: Metadata about each converted document (filename, user reference, date).  
  - **File Storage**: PDF files can be stored via GridFS or a separate storage system.

## 6. Future Enhancements
- **Multiple File Conversion**: Allow users to upload multiple images and combine into a single PDF.  
- **Editing Tools**: Add the ability to reorder or remove pages before finalizing the PDF.  
- **Notifications**: Notify users via email when conversions are complete.  
- **Role-Based Access**: Admin roles, usage limits, or premium features.

## 7. Security Considerations
- **File Scanning**: Ensure uploaded files are scanned for viruses.  
- **Secure API Keys**: Keep Mistral OCR API keys in safe environment variables.  
- **HTTPS**: Use HTTPS for all requests to protect user data.  
- **Access Control**: Validate user ownership of documents before displaying or allowing downloads.

## 8. Conclusion
This document outlines the core architecture, features, and user flow of the **Mistral OCR Conversion App**. By following this guide, developers can implement each part systematically. For more in-depth technical details, refer to the separate documentation regarding data models, environment variables, and deployment procedures.

## 9. Database Schema

### 9.1 MongoDB Collections

#### Users Collection
```javascript
{
  _id: ObjectId,                // Auto-generated MongoDB ID
  uuid: String,                 // Unique UUIDv4 identifier for public-facing contexts
  email: String,                // User's email address (unique)
  password: String,             // Hashed password
  firstName: String,            // User's first name
  lastName: String,             // User's last name
  createdAt: Date,              // Account creation timestamp
  updatedAt: Date,              // Last account update timestamp
  lastLogin: Date,              // Last login timestamp
  role: String,                 // User role (default: "user", can be "admin")
  isVerified: Boolean,          // Email verification status
  verificationToken: String,    // Token for email verification
  resetPasswordToken: String,   // Token for password reset
  resetPasswordExpires: Date,   // Expiration for password reset token
  settings: {                   // User preferences
    notificationsEnabled: Boolean,
    defaultShareOption: String  // "email", "link", etc.
  },
  usageStats: {                 // Usage statistics
    totalDocumentsConverted: Number,
    totalStorageUsed: Number    // In bytes
  }
}
```

#### Documents Collection
```javascript
{
  _id: ObjectId,                // Auto-generated MongoDB ID
  userId: ObjectId,             // Reference to Users collection
  originalFileName: String,     // Original uploaded file name
  pdfFileName: String,          // Generated PDF file name
  fileSize: Number,             // Size in bytes
  fileType: String,             // MIME type of original file
  status: String,               // "processing", "completed", "failed"
  createdAt: Date,              // Upload timestamp
  completedAt: Date,            // Conversion completion timestamp
  fileId: ObjectId,             // Reference to GridFS file (if using GridFS)
  storageUrl: String,           // URL to file if using external storage
  textContent: String,          // Extracted text content from OCR
  pageCount: Number,            // Number of pages in the document
  isArchived: Boolean,          // Whether user has archived this document
  shareInfo: [{                 // Information about document shares
    shareId: String,            // Unique share identifier
    shareType: String,          // "email", "link", etc.
    createdAt: Date,            // When the share was created
    expiresAt: Date,            // When the share expires (optional)
    accessCount: Number,        // Number of times accessed
    recipientEmail: String      // If shared via email
  }],
  tags: [String],               // User-defined tags for organization
  metadata: {                   // Additional metadata
    ocrConfidence: Number,      // OCR confidence score (0-100)
    processingTime: Number,     // Time taken for OCR processing (ms)
    imageQuality: String        // "low", "medium", "high"
  }
}
```

#### Files Collection (GridFS)
If using MongoDB's GridFS for file storage:

```javascript
// fs.files collection (automatically created by GridFS)
{
  _id: ObjectId,                // File ID
  length: Number,               // File size in bytes
  chunkSize: Number,            // Size of each chunk
  uploadDate: Date,             // Upload date
  filename: String,             // Name of the file
  metadata: {                   // Custom metadata
    userId: ObjectId,           // Reference to user
    documentId: ObjectId,       // Reference to document
    contentType: String,        // MIME type
    originalFileName: String    // Original file name
  }
}

// fs.chunks collection (automatically created by GridFS)
{
  _id: ObjectId,                // Chunk ID
  files_id: ObjectId,           // Reference to the file
  n: Number,                    // Chunk number
  data: Binary                  // Binary data
}
```

#### Sessions Collection (if using server-side sessions)
```javascript
{
  _id: String,                  // Session ID
  expires: Date,                // Session expiration date
  session: String,              // Encrypted session data
  userId: ObjectId              // Reference to user
}
```

### 9.2 Indexes

For optimal performance, the following indexes should be created:

```javascript
// Users Collection
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ uuid: 1 }, { unique: true })
db.users.createIndex({ verificationToken: 1 })
db.users.createIndex({ resetPasswordToken: 1 })

// Documents Collection
db.documents.createIndex({ userId: 1 })
db.documents.createIndex({ createdAt: -1 })
db.documents.createIndex({ "shareInfo.shareId": 1 })
db.documents.createIndex({ tags: 1 })
db.documents.createIndex({ status: 1 })

// If using text search on document content
db.documents.createIndex({ textContent: "text" })
```

### 9.3 Relationships

- **One-to-Many**: A User has many Documents
- **One-to-One**: A Document has one File (if using GridFS)
- **One-to-Many**: A Document has many Shares (embedded in the document)

## 10. Folder Structure

### 10.1 Project Root Structure

```
mistral-ocr-app/
├── client/                     # Frontend (Lynx) application
├── server/                     # Backend (Node.js/Express) application
├── .gitignore                  # Git ignore file
├── README.md                   # Project documentation
├── package.json                # Root package.json for scripts and workspaces
├── docker-compose.yml          # Docker configuration
└── .env.example                # Example environment variables
```

### 10.2 Frontend Structure (client/)

```
client/
├── public/                     # Static assets
│   ├── favicon.ico             # Favicon
│   ├── index.html              # HTML entry point
│   ├── manifest.json           # PWA manifest
│   └── assets/                 # Images, fonts, etc.
│       ├── images/             # Image assets
│       └── fonts/              # Font files
├── src/                        # Source code
│   ├── components/             # Reusable UI components
│   │   ├── common/             # Shared components
│   │   │   ├── Button.js       # Button component
│   │   │   ├── Input.js        # Input component
│   │   │   ├── Modal.js        # Modal component
│   │   │   └── ...             # Other common components
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.js       # Header component
│   │   │   ├── Footer.js       # Footer component
│   │   │   ├── Sidebar.js      # Sidebar component
│   │   │   └── ...             # Other layout components
│   │   ├── auth/               # Authentication components
│   │   │   ├── LoginForm.js    # Login form
│   │   │   └── SignupForm.js   # Signup form
│   │   ├── dashboard/          # Dashboard components
│   │   │   ├── UploadButton.js # Upload button component
│   │   │   ├── ProgressBar.js  # Progress bar component
│   │   │   └── ...             # Other dashboard components
│   │   ├── document/           # Document-related components
│   │   │   ├── DocumentCard.js # Document card component
│   │   │   ├── DocumentList.js # Document list component
│   │   │   └── ...             # Other document components
│   │   └── ...                 # Other component categories
│   ├── pages/                  # Page components
│   │   ├── WelcomePage.js      # Welcome page
│   │   ├── LoginPage.js        # Login page
│   │   ├── SignupPage.js       # Signup page
│   │   ├── DashboardPage.js    # Dashboard page
│   │   ├── HistoryPage.js      # History page
│   │   ├── SettingsPage.js     # Settings page
│   │   └── ...                 # Other pages
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.js          # Authentication hook
│   │   ├── useDocuments.js     # Documents hook
│   │   └── ...                 # Other hooks
│   ├── services/               # API services
│   │   ├── api.js              # API client setup
│   │   ├── authService.js      # Authentication service
│   │   ├── documentService.js  # Document service
│   │   └── ...                 # Other services
│   ├── utils/                  # Utility functions
│   │   ├── formatters.js       # Data formatters
│   │   ├── validators.js       # Form validators
│   │   └── ...                 # Other utilities
│   ├── context/                # React context providers
│   │   ├── AuthContext.js      # Authentication context
│   │   └── ...                 # Other contexts
│   ├── styles/                 # Global styles
│   │   ├── global.css          # Global CSS
│   │   ├── variables.css       # CSS variables
│   │   └── ...                 # Other style files
│   ├── App.js                  # Main App component
│   ├── index.js                # Application entry point
│   └── routes.js               # Route definitions
├── package.json                # Frontend dependencies
├── .eslintrc.js                # ESLint configuration
└── README.md                   # Frontend documentation
```

### 10.3 Backend Structure (server/)

```
server/
├── src/                        # Source code
│   ├── config/                 # Configuration files
│   │   ├── database.js         # Database configuration
│   │   ├── environment.js      # Environment variables
│   │   ├── mistral.js          # Mistral API configuration
│   │   └── ...                 # Other configurations
│   ├── controllers/            # Route controllers
│   │   ├── authController.js   # Authentication controller
│   │   ├── documentController.js # Document controller
│   │   ├── userController.js   # User controller
│   │   └── ...                 # Other controllers
│   ├── middleware/             # Express middleware
│   │   ├── auth.js             # Authentication middleware
│   │   ├── errorHandler.js     # Error handling middleware
│   │   ├── upload.js           # File upload middleware
│   │   └── ...                 # Other middleware
│   ├── models/                 # Database models
│   │   ├── User.js             # User model
│   │   ├── Document.js         # Document model
│   │   └── ...                 # Other models
│   ├── routes/                 # API routes
│   │   ├── authRoutes.js       # Authentication routes
│   │   ├── documentRoutes.js   # Document routes
│   │   ├── userRoutes.js       # User routes
│   │   └── ...                 # Other routes
│   ├── services/               # Business logic services
│   │   ├── authService.js      # Authentication service
│   │   ├── documentService.js  # Document service
│   │   ├── ocrService.js       # OCR service (Mistral integration)
│   │   ├── storageService.js   # File storage service
│   │   └── ...                 # Other services
│   ├── utils/                  # Utility functions
│   │   ├── logger.js           # Logging utility
│   │   ├── validators.js       # Input validators
│   │   ├── helpers.js          # Helper functions
│   │   └── ...                 # Other utilities
│   ├── app.js                  # Express app setup
│   └── server.js               # Server entry point
├── tests/                      # Test files
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── fixtures/               # Test fixtures
├── package.json                # Backend dependencies
├── .eslintrc.js                # ESLint configuration
└── README.md                   # Backend documentation
```

### 10.4 Shared Resources

```
shared/                         # Shared between client and server
├── constants/                  # Shared constants
│   ├── errorCodes.js           # Error codes
│   └── statusCodes.js          # Status codes
├── types/                      # Type definitions
│   ├── User.js                 # User type
│   └── Document.js             # Document type
└── utils/                      # Shared utilities
    ├── validation.js           # Validation utilities
    └── formatting.js           # Formatting utilities
```

---