# Mistral OCR Mobile App - Overview & Workflow

App Name: LynxAI

This document outlines the structure, flow, and features of our Mistral OCR mobile application built with Expo (React Native) on the frontend, Node.js/Express on the backend, and MongoDB for data storage. The goal is to guide developers in understanding the user experience (UX), the technical steps involved, and how each component should interact.

## 1. Concept & Main Purpose

- **Primary Function:** The app allows users to upload images of documents and convert them into fully searchable PDF files using the Mistral OCR API.
- **Key Features:**
  - User registration & authentication (with email).
  - File upload (for images).
  - OCR processing to PDF.
  - Progress bar to show scanning and conversion status.
  - Option to save or share the generated PDF document.
  - Document history for previously uploaded and processed documents.

## 2. App Architecture

Tech Stack:
Frontend: React Native with TypeScript, Expo, and Expo Router and axios
Backend/Database: NodeJS express axios and dotenv / mongoDB
UI Framework: React Native Paper
AI Processing: Claude


1. **Expo/React Native Frontend**  
   - Manages the user interface (UI) and user experience (UX).
   - Handles file/image uploads from the device (camera or local files).
   - Displays progress updates during the OCR process.
   - Fetches processed PDF documents for view, save, or share.

2. **Node.js/Express Backend**  
   - Provides API endpoints for:
     - User registration & authentication.
     - Handling incoming file uploads.
     - Communicating with the Mistral OCR API.
     - Managing the document generation process (picture-to-PDF).
     - Returning the status and final PDF document.
     - Maintaining user document history.
   - Interacts with MongoDB to store user information and references to processed documents.

3. **MongoDB Database**  
   - Stores user data (emails, hashed passwords, user metadata).
   - Tracks user documents (file references, URLs to stored PDFs, timestamps).
   - For now, no specific schema is defined here (will be added later).

4. **Mistral OCR API**  
   - Performs the actual OCR to convert images into PDF.
   - The backend sends the image to Mistral and then retrieves the processed PDF.

---

## 3. User Flow

### 3.1 Welcome Screen
1. **Clean & Modern Design**  
   - Minimalistic look with a background image or color and a concise welcome message.
   - Prominent sign-in/sign-up button.

2. **Navigation**  
   - Users can either sign in or sign up.

### 3.2 Sign Up
1. **Email & Password Fields**  
   - Users enter an email and create a password.
2. **Submission**  
   - Data is sent to the backend for validation and user creation.
   - On success, user is automatically logged in or taken to the sign-in screen.

### 3.3 Sign In
1. **Email & Password**  
   - Users enter their credentials.
2. **Authentication**  
   - Credentials are verified by the backend.
   - On success, the user is directed to the **Main Dashboard**.

### 3.4 Main Dashboard
After a successful login, the user sees:

1. **Upload Button**  
   - Allows the user to attach an image file from the device storage or capture a new image using the camera.
2. **Document History Button**  
   - Opens a list of previously processed documents (with date and time).
3. **Settings/Profile Button** (optional)
   - For editing profile details or logging out.

### 3.5 Document Upload & Conversion
1. **Select or Capture Image**  
   - The user taps on the **Upload** button.
   - Chooses an existing image from the gallery or captures one via the camera.
2. **Initiate OCR**  
   - The app sends the image to the backend.
   - The backend relays the image to the Mistral OCR API for processing.
3. **Progress Bar**  
   - A loading or progress indicator is shown (e.g., 0% to 100%).
   - Real-time updates on the current status of the OCR conversion.
4. **Conversion Completion**  
   - Once the PDF is generated, the backend returns a link or file to the app.

### 3.6 Post-Processing Options
After conversion, the user sees:

1. **Preview PDF**  
   - Optionally view the PDF in-app or in a preview modal.
2. **Save File**  
   - Downloads or saves the file to local storage (or a cloud service if integrated).
3. **Share Document**  
   - Triggers the native share options, enabling the user to share via email, messaging apps, or other channels.

### 3.7 Document History
1. **List of Documents**  
   - Displays a chronological list of converted documents with relevant metadata (file name, conversion date).
2. **Action Items**  
   - View a specific document or re-share it.

### 3.8 Logout
1. **Logout Button**  
   - Ends the user session and returns to the **Welcome Screen**.

---

## 4. Technical Details & Implementation Outline

1. **Frontend (Expo/React Native)**
   - **Navigation:** Use React Navigation for screen routing (Welcome, Sign Up, Sign In, Dashboard, History).
   - **File Upload:** 
     - Use Expo Image Picker or the device camera.
     - Create a form-data object to send the file to the Node.js backend.
   - **Progress Indicator:** 
     - Implement a progress bar component that listens to upload progress (from either a custom event or polling).
   - **User Authentication:**
     - Use a combination of AsyncStorage (or SecureStore) to store JWT tokens (if you are using token-based auth).
     - On app launch, check for a valid token to skip sign in if still valid.

2. **Backend (Node.js/Express)**
   - **Routes & Endpoints** (example):
     - **POST** `/auth/signup` - Create user.
     - **POST** `/auth/signin` - Authenticate user.
     - **POST** `/upload` - Receive file and process OCR.
     - **GET** `/documents` - List user’s document history.
     - **GET** `/documents/:id` - Retrieve a specific document.
   - **File Handling:** 
     - Use `multer` or similar middleware to handle incoming file uploads.
   - **OCR Processing:** 
     - On receiving a file, call the Mistral OCR API with appropriate parameters.
   - **Return PDF:** 
     - Store or cache the resulting PDF. 
     - Return a link or the file to the client.
   - **Document History Management:** 
     - Save references (e.g., file paths, timestamps, user IDs) in MongoDB.

3. **Mistral OCR Integration**
   - **API Call Flow**:
     1. Receive the uploaded file on the backend.
     2. Send the file or file URL to Mistral OCR’s endpoint.
     3. Monitor the job status if Mistral uses asynchronous callbacks or polling.
     4. When done, get the resulting PDF file.
     5. Store/return the PDF to the user.
   - **Error Handling**:
     - Manage potential timeouts or failures from the OCR service.
     - Provide descriptive error messages to the frontend.

4. **User Authentication & Security**
   - **JWT Tokens** (commonly used):
     - Issued to the user upon successful sign-in or sign-up.
     - Required for protected routes (like uploading files or fetching document history).
   - **Data Validation**:
     - Validate input (e.g., email format, password strength).
   - **Error Handling**:
     - Return appropriate HTTP status codes and error messages (e.g., 400 for bad request, 401 for unauthorized).

5. **Design & UI**
   - **Modern 2025 Look**:
     - Clean, minimalistic user interface.
     - Rounded corners, large buttons for better accessibility.
     - Subtle animations for transitions and button presses.
     - Progress bar with smooth animation.
   - **Responsive Layout**:
     - Ensure the layout scales to different screen sizes and device orientations.

---

## 5. Flow Diagram (High-Level)

1. Launch App
   |
   v
2. Welcome Screen
   |--> Sign Up
   |--> Sign In
   v
3. Main Dashboard
   |--> History
   |    v
   |    Document List
   |       |--> Reopen or Reshare
   |--> Upload Photo
         v
         Send to Backend
         v
         Mistral OCR (processing)
         v
         Progress Bar
         v
         Return PDF
         |--> Save / Share
         |--> Update Document History

---

## 6. Future Enhancements (Optional)

- **Multi-Language Support**: Provide localized text for multiple languages.
- **Integration with Cloud Storage**: Optionally sync documents to a cloud service like AWS S3, Google Drive, or Dropbox.
- **Offline Functionality**: Save documents locally when offline and upload later.
- **Advanced File Management**: Folders, tagging, or searching within user documents.
- **Notifications**: Alert users when OCR processing completes (especially if done asynchronously).

---

## 7. Conclusion

The Mistral OCR Mobile App aims to simplify the process of scanning physical documents and turning them into PDF files. By following the flow described, developers can build a straightforward and user-friendly solution using:
- **Expo/React Native** for cross-platform mobile development.
- **Node.js/Express** for backend API logic.
- **MongoDB** for data persistence.
- **Mistral OCR** for robust text extraction from images.

```