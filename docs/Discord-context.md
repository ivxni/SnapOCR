# LynxAI - OCR Mobile App (Discord Summary)

## 🚀 SnapOCR?
Mobile app that converts document images to searchable PDFs using OCR technology.

## 🛠️ Tech Stack
**Frontend:** React Native + Expo + TypeScript  
**Backend:** Node.js + Express  
**Database:** MongoDB  
**OCR:** Mistral API  
**UI:** React Native Paper

## ✨ Key Features
- 📧 User auth (email/password)
- 📷 Image upload (camera/gallery)
- 🔄 OCR processing with progress bar
- 📄 PDF generation & sharing
- 📚 Document history
- ⭐ Modern 2025 UI design

## 🏗️ Architecture
```
Mobile App (React Native)
    ↓ (API calls)
Backend (Node.js/Express)
    ↓ (OCR requests)
Mistral API
    ↓ (stores data)
MongoDB
```

## 📱 User Flow
1. **Welcome** → Sign Up/In
2. **Dashboard** → Upload image
3. **Processing** → OCR conversion with progress
4. **Result** → View/Save/Share PDF
5. **History** → Access previous documents

## 🗃️ Database Collections
- **Users:** Auth + profile data
- **Documents:** File metadata + PDF links
- **ProcessingJobs:** OCR status tracking
- **Logs:** Analytics + debugging

## 📁 Folder Structure
```
LynxAI/
├── frontend/          # React Native app
│   ├── components/    # UI components
│   ├── screens/       # App screens
│   ├── services/      # API calls
│   └── types/         # TypeScript types
└── backend/           # Node.js server
    ├── controllers/   # Route handlers
    ├── models/        # MongoDB schemas
    ├── routes/        # API endpoints
    └── services/      # Business logic
```

## 🔑 Main API Endpoints
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login  
- `POST /upload` - Image upload & OCR
- `GET /documents` - User's document history
- `GET /documents/:id` - Specific document

## 💡 Core Workflow
Image Upload → Backend Processing → Mistral OCR → PDF Generation → Save to DB → Return to User

*Perfect for developers who need a quick overview! 🚀*
