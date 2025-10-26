# 🚀 START HERE - Quick Testing Guide

## ✅ Step 1: Tesseract - DONE!

You already have Tesseract installed! The `brew install tesseract` command succeeded.  
(Ignore the `apt-get` error - that's for Ubuntu, not macOS)

---

## 🔧 Step 2: Setup Backend (3 commands)

```bash
# Terminal 1 - Backend Setup
cd /Users/dennisvengerov/Desktop/Projects/doc/backend

# 1. Create virtual environment
python -m venv .venv

# 2. Activate it
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt
```

---

## 🗄️ Step 3: Setup Database (One-Time)

### A) Initialize Database Tables

1. **Open**: https://app.supabase.com/project/uwfeebxchoitwymaaqrh/sql

2. **Copy entire file**: Open `backend/setup.sql` and copy everything

3. **Paste & Run**: Paste into SQL Editor, click **RUN**

4. **Verify**: Should see "Setup complete! Tables created:"

### B) Create Storage Bucket

1. **Open**: https://app.supabase.com/project/uwfeebxchoitwymaaqrh/storage

2. **Create bucket**:
   - Click "New bucket"
   - Name: `private-user-docs`
   - **IMPORTANT**: Keep it **Private** (toggle OFF "Public bucket")
   - Click "Create bucket"

---

## 🚀 Step 4: Start Servers

### Terminal 1 - Backend
```bash
cd /Users/dennisvengerov/Desktop/Projects/doc/backend
source .venv/bin/activate
./start.sh
```

**Expected**: 
```
INFO:     Uvicorn running on http://127.0.0.1:8080
INFO:     Application startup complete.
```

**Keep this terminal open!**

### Terminal 2 - Frontend

```bash
cd /Users/dennisvengerov/Desktop/Projects/doc

# Create .env.local file
echo "VITE_API_BASE_URL=http://localhost:8080" > .env.local

# Start frontend
npm run dev
```

**Expected**:
```
  ➜  Local:   http://localhost:5173/
```

**Keep this terminal open too!**

---

## 🧪 Step 5: Test It!

### 1. Open Browser

Go to: **http://localhost:5173**

### 2. Navigate to Dashboard

Click "Get Started" or "Dashboard" in navigation

### 3. Upload a Document

- Find any PDF on your computer (invoice, receipt, etc.)
- Click **"Upload Document"** button
- Select the PDF
- Wait 5-15 seconds for processing
- Document should appear in left sidebar!

### 4. Ask Questions

- Click on the document in the sidebar to select it
- Type a question: "What is this document about?"
- Press Enter
- Answer should appear in 2-5 seconds!

---

## ✅ Success Checklist

- [ ] Backend running at http://localhost:8080
- [ ] Frontend running at http://localhost:5173
- [ ] Dashboard page loads
- [ ] "Upload Document" button visible
- [ ] Can select and upload a PDF
- [ ] Document appears in sidebar
- [ ] Can click document to select it
- [ ] Can type and ask questions
- [ ] Answers appear with citations

---

## 🔍 Verify Backend

Open: **http://localhost:8080/docs**

You should see interactive API documentation!

---

## 🐛 Quick Troubleshooting

**Backend won't start:**
```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
```

**Frontend can't connect:**
```bash
# Create .env.local if it doesn't exist
echo "VITE_API_BASE_URL=http://localhost:8080" > .env.local

# Restart frontend
npm run dev
```

**Upload fails:**
- Check backend terminal for errors
- Verify storage bucket exists (Step 3B)
- Check file is PDF/PNG/JPEG

---

## 📚 Full Documentation

For detailed instructions, see:
- **`TEST_INSTRUCTIONS.md`** - Complete testing guide
- **`backend/README.md`** - API documentation
- **`backend/SETUP.md`** - Setup troubleshooting

---

## 🎯 What to Test

1. **Upload**: Upload 2-3 different PDFs
2. **List**: Verify all appear in sidebar
3. **Select**: Click each document
4. **Question**: Ask questions about each
5. **Verify**: Check Supabase Storage & Database

### Questions to Try:
- "What is this document about?"
- "What is the due date?"
- "Who is this from?"
- "What is the total amount?"
- "Summarize the key points"

---

## 🎉 You're Ready!

Both servers running? Dashboard loaded? **Start testing!**

Upload a document and watch the magic happen! 🚀

