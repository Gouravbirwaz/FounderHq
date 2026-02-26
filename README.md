# FounderHQ - Command Center

FounderHQ is a unified platform designed as a "Command Center" for founders, investors, and mentors. It features a robust real-time communication system, a centralized dashboard, and a huddle feature for collaborative work.

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Vanilla CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Real-time**: Socket.io-client

### Backend (Core)
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (Beanie ODM / Motor)
- **Authentication**: JWT (python-jose)
- **Search**: MongoDB Regex Search

### Huddle Service (Microservice)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io (WebRTC signals)

---

## 🏗 Project Structure

```bash
.
├── frontend-nextjs/       # Next.js Frontend application
├── backend-python/        # FastAPI Main Backend
├── huddle-feature/        # Huddle Microservice (Node.js)
│   └── server/            # Socket.io & Express server
├── docker-compose.yml     # Container orchestration
└── .gitignore             # Git ignore patterns
```

---

## 🛠 Installation & Setup

### Method 1: Docker (Recommended)

Make sure you have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Gouravbirwaz/FounderHq.git
   cd FounderHq
   ```

2. **Spin up the services**:
   ```bash
   docker-compose up --build
   ```

The application will be available at:
- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:8000`
- **Huddle Service**: `http://localhost:5001`

---

### Method 2: Manual Setup

#### 1. Backend (Python)
```bash
cd backend-python
python -m venv env
source env/bin/activate  # Windows: .\env\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

#### 2. Frontend (Next.js)
```bash
cd frontend-nextjs
npm install
npm run dev
```

#### 3. Huddle Service (Node.js)
```bash
cd huddle-feature/server
npm install
node index.js
```

--- 

## ⚙️ Environment Variables
 
Each component requires specific environment variables. Reference the `.env.example` files (if available) or use the following defaults:

### Backend (.env)
- `MONGO_URL`: MongoDB connection string
- `DB_NAME`: `founderhq`
- `JWT_SECRET`: Your secret key

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL`: `http://localhost:8000`
- `NEXT_PUBLIC_WS_URL`: `ws://localhost:8000`

### Huddle Service (.env)
- `MONGO_URI`: `mongodb://localhost:27017/huddle_db`
- `JWT_SECRET`: Your secret key

---

## 🛡 License
This project is licensed under the ISC License.
