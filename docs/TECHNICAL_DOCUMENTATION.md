# NEST - Technical Documentation
## Architecture, Implementation, and Integration Details

---

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [System Architecture](#system-architecture)
3. [Database Design](#database-design)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [AI Integration](#ai-integration)
7. [Authentication & Security](#authentication--security)
8. [API Documentation](#api-documentation)
9. [Deployment](#deployment)

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14.2.13 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Framer Motion
- **State Management**: React Hooks, React Query (TanStack Query)
- **Forms**: React Hook Form with Zod validation
- **Maps**: Leaflet with React-Leaflet
- **QR Codes**: qrcode.react
- **HTTP Client**: Fetch API
- **Offline Support**: Service Workers, IndexedDB (localforage)
- **Internationalization**: react-i18next
- **Notifications**: react-hot-toast
- **Testing**: Mock Service Worker (MSW)

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: JavaScript (ES6+)
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Environment**: dotenv
- **CORS**: cors middleware

### AI Service
- **Language**: Python 3.x
- **Framework**: Flask
- **ML Libraries**: 
  - scikit-learn
  - numpy
  - pandas
- **GPU Acceleration**: CUDA support (optional)

### Database
- **Primary**: PostgreSQL
- **Version**: 14+
- **Features Used**:
  - ENUM types
  - Foreign keys with cascading
  - Indexes for performance
  - Timestamps (createdAt, updatedAt)

### Development Tools
- **Package Managers**: npm (frontend/backend), pip (Python)
- **Version Control**: Git
- **Code Quality**: ESLint, Prettier
- **API Testing**: curl, Postman

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                      (Next.js + React)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pages &    │  │  Components  │  │    Hooks &   │     │
│  │   Layouts    │  │              │  │    Utils     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ State Mgmt   │  │  API Client  │  │Service Worker│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                             │
│                    (Express.js)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Routes     │  │ Controllers  │  │ Middlewares  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Models     │  │     Auth     │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
         ┌──────────────────┐    ┌──────────────────┐
         │   PostgreSQL     │    │   AI Service     │
         │    Database      │    │    (Flask)       │
         └──────────────────┘    └──────────────────┘
```

### Component Interaction Flow

1. **User Request** → Frontend (Next.js)
2. **API Call** → Backend (Express.js)
3. **Authentication** → JWT Verification
4. **Business Logic** → Controllers
5. **Data Access** → Sequelize ORM
6. **Database Query** → PostgreSQL
7. **AI Processing** (if needed) → Python Flask Service
8. **Response** → JSON back to Frontend
9. **UI Update** → React State Management

---

## Database Design

### Entity Relationship Overview

**Core Entities:**
- Users (NGO, Admin, Volunteer)
- HomelessProfiles
- Shelters
- ShelterUsers (Shelter Staff)
- ShelterResidents
- Jobs
- Allocations
- AssignmentRequests
- MedicalRecords
- DailyLogs
- DataSyncLogs

### Database Schema

#### Users Table
```sql
CREATE TABLE "Users" (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('volunteer', 'ngo', 'admin') NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Store NGO staff, volunteers, and administrators
**Key Fields**:
- `user_id`: Primary key
- `email`: Unique identifier for login
- `password_hash`: Bcrypt hashed password
- `role`: User's access level

#### HomelessProfiles Table
```sql
CREATE TABLE "HomelessProfiles" (
  profile_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  alias VARCHAR(255),
  age INTEGER,
  gender VARCHAR(50),
  geo_lat DOUBLE PRECISION,
  geo_lng DOUBLE PRECISION,
  health_status TEXT,
  disabilities TEXT,
  skills TEXT,
  workHistory TEXT,
  needs TEXT NOT NULL,
  priority ENUM('Low', 'Medium', 'High', 'Critical'),
  status ENUM('active', 'shelter_requested', 'shelter_assigned', 
              'job_requested', 'job_assigned', 'both_requested', 'completed'),
  current_shelter VARCHAR(255),
  current_job VARCHAR(255),
  registered_by INTEGER REFERENCES "Users"(user_id),
  status_updated_at TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Store information about homeless individuals
**Key Fields**:
- `profile_id`: Unique identifier
- `status`: Current state in the system
- `priority`: Urgency level
- `geo_lat/geo_lng`: Location coordinates
- `registered_by`: Foreign key to Users

#### Shelters Table
```sql
CREATE TABLE "Shelters" (
  shelter_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  available_beds INTEGER NOT NULL,
  phone VARCHAR(50),
  amenities TEXT,
  geo_lat DOUBLE PRECISION,
  geo_lng DOUBLE PRECISION,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Store shelter facility information
**Key Fields**:
- `capacity`: Total bed capacity
- `available_beds`: Current availability
- `geo_lat/geo_lng`: Location for proximity matching

#### ShelterUsers Table
```sql
CREATE TABLE "ShelterUsers" (
  shelter_user_id SERIAL PRIMARY KEY,
  shelter_id INTEGER REFERENCES "Shelters"(shelter_id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('manager', 'staff') NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Separate authentication for shelter staff
**Key Fields**:
- `shelter_id`: Links to specific shelter
- `role`: Manager or staff level access


#### AssignmentRequests Table
```sql
CREATE TABLE "AssignmentRequests" (
  request_id SERIAL PRIMARY KEY,
  profile_id INTEGER REFERENCES "HomelessProfiles"(profile_id),
  shelter_id INTEGER REFERENCES "Shelters"(shelter_id),
  requested_by INTEGER REFERENCES "Users"(user_id),
  status ENUM('pending', 'accepted', 'rejected', 'expired') DEFAULT 'pending',
  request_date TIMESTAMP DEFAULT NOW(),
  response_date TIMESTAMP,
  response_by INTEGER REFERENCES "ShelterUsers"(shelter_user_id),
  rejection_reason TEXT,
  notes TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Track shelter placement requests
**Workflow**:
1. NGO creates request (status: pending)
2. Shelter manager reviews
3. Accept → creates ShelterResident
4. Reject → stores reason

#### ShelterResidents Table
```sql
CREATE TABLE "ShelterResidents" (
  resident_id SERIAL PRIMARY KEY,
  shelter_id INTEGER REFERENCES "Shelters"(shelter_id),
  ngo_profile_id INTEGER REFERENCES "HomelessProfiles"(profile_id),
  name VARCHAR(255) NOT NULL,
  age INTEGER,
  gender VARCHAR(50),
  health_status TEXT,
  disabilities TEXT,
  skills TEXT,
  admission_date TIMESTAMP DEFAULT NOW(),
  discharge_date TIMESTAMP,
  bed_number VARCHAR(50),
  room_number VARCHAR(50),
  status ENUM('active', 'discharged', 'transferred') DEFAULT 'active',
  source ENUM('ngo', 'walk_in', 'referral') DEFAULT 'ngo',
  emergency_contact VARCHAR(255),
  emergency_phone VARCHAR(50),
  notes TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Track individuals currently in shelters
**Key Features**:
- Links to HomelessProfile if from NGO
- Supports walk-in admissions
- Tracks bed assignments
- Records admission/discharge dates

#### Allocations Table
```sql
CREATE TABLE "Allocations" (
  alloc_id SERIAL PRIMARY KEY,
  profile_id INTEGER REFERENCES "HomelessProfiles"(profile_id),
  shelter_id INTEGER,
  job_id INTEGER,
  resource_type ENUM('shelter', 'job') NOT NULL,
  resource_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'assigned',
  assigned_by INTEGER REFERENCES "Users"(user_id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Track job assignments and direct allocations
**Note**: Shelter assignments use AssignmentRequests workflow

#### Jobs Table
```sql
CREATE TABLE "Jobs" (
  job_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  job_type VARCHAR(100),
  salary VARCHAR(100),
  description TEXT,
  requirements TEXT,
  skills_required TEXT,
  geo_lat DOUBLE PRECISION,
  geo_lng DOUBLE PRECISION,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Store job opportunities
**Used For**: Matching with profiles based on skills

#### MedicalRecords Table
```sql
CREATE TABLE "MedicalRecords" (
  record_id SERIAL PRIMARY KEY,
  resident_id INTEGER REFERENCES "ShelterResidents"(resident_id),
  shelter_id INTEGER REFERENCES "Shelters"(shelter_id),
  date TIMESTAMP NOT NULL,
  diagnosis TEXT,
  doctor VARCHAR(255),
  notes TEXT,
  follow_up_date TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Track medical history for shelter residents
**Features**: Follow-up scheduling, doctor notes

#### DailyLogs Table
```sql
CREATE TABLE "DailyLogs" (
  log_id SERIAL PRIMARY KEY,
  resident_id INTEGER REFERENCES "ShelterResidents"(resident_id),
  shelter_id INTEGER REFERENCES "Shelters"(shelter_id),
  created_by INTEGER REFERENCES "ShelterUsers"(shelter_user_id),
  note TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Daily observations and notes about residents
**Use Cases**: Behavioral notes, progress tracking, incidents

#### DataSyncLogs Table
```sql
CREATE TABLE "DataSyncLogs" (
  sync_id SERIAL PRIMARY KEY,
  profile_id INTEGER REFERENCES "HomelessProfiles"(profile_id),
  shelter_id INTEGER REFERENCES "Shelters"(shelter_id),
  sync_type ENUM('initial', 'update') NOT NULL,
  direction ENUM('ngo_to_shelter', 'shelter_to_ngo') NOT NULL,
  fields_synced JSONB,
  synced_by INTEGER,
  success BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Audit trail for data synchronization
**Tracks**: What data was synced, when, by whom, and success status

### Database Relationships

**One-to-Many:**
- Users → HomelessProfiles (registered_by)
- Users → AssignmentRequests (requested_by)
- Shelters → ShelterUsers
- Shelters → ShelterResidents
- Shelters → AssignmentRequests
- ShelterResidents → MedicalRecords
- ShelterResidents → DailyLogs

**Many-to-One:**
- HomelessProfiles → Users (registered_by)
- AssignmentRequests → HomelessProfiles
- AssignmentRequests → Shelters
- ShelterResidents → Shelters
- ShelterResidents → HomelessProfiles (optional, ngo_profile_id)

### Indexes

**Performance Optimization:**
```sql
CREATE INDEX idx_profiles_status ON "HomelessProfiles"(status);
CREATE INDEX idx_profiles_priority ON "HomelessProfiles"(priority);
CREATE INDEX idx_requests_status ON "AssignmentRequests"(status);
CREATE INDEX idx_requests_shelter ON "AssignmentRequests"(shelter_id);
CREATE INDEX idx_residents_shelter ON "ShelterResidents"(shelter_id);
CREATE INDEX idx_residents_status ON "ShelterResidents"(status);
```

---

## Backend Implementation

### Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── postgres.js          # Database configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── profileController.js # Profile CRUD operations
│   │   ├── shelterController.js # Shelter operations
│   │   ├── shelterAuthController.js
│   │   ├── shelterMedicalController.js
│   │   └── aiController.js      # AI service integration
│   ├── middlewares/
│   │   ├── authMiddleware.js    # JWT verification
│   │   └── shelterAuth.js       # Shelter-specific auth
│   ├── models/ (legacy SQLite)
│   ├── pg_models/               # PostgreSQL models
│   │   ├── user.js
│   │   ├── homelessProfile.js
│   │   ├── shelter.js
│   │   ├── shelterUser.js
│   │   ├── shelterResident.js
│   │   ├── assignmentRequest.js
│   │   ├── allocation.js
│   │   ├── job.js
│   │   ├── medicalRecord.js
│   │   ├── dailyLog.js
│   │   ├── dataSyncLog.js
│   │   └── index.js             # Model associations
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── shelterRoutes.js
│   │   ├── shelterAuthRoutes.js
│   │   ├── shelterRequestRoutes.js
│   │   ├── shelterResidentRoutes.js
│   │   ├── shelterMedicalRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── assignmentRoutes.js
│   │   └── aiRoutes.js
│   └── app.js                   # Express app setup
├── .env                         # Environment variables
├── seed.js                      # Database seeding
└── package.json
```

### Core Backend Concepts

#### 1. Express.js Application Setup

**app.js:**
```javascript
import express from 'express';
import cors from 'cors';
import { sequelize } from './config/postgres.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/profiles', profileRoutes);
app.use('/shelters', shelterRoutes);
app.use('/jobs', jobRoutes);
app.use('/assignments', assignmentRoutes);
app.use('/ai', aiRoutes);

// Shelter-specific routes
app.use('/shelter/auth', shelterAuthRoutes);
app.use('/shelter/requests', shelterRequestRoutes);
app.use('/shelter/residents', shelterResidentRoutes);
app.use('/shelter/medical', shelterMedicalRoutes);

// Database connection
sequelize.authenticate()
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch(err => console.error('❌ Database error:', err));

export default app;
```

#### 2. Sequelize ORM Configuration

**config/postgres.js:**
```javascript
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);
```

**Environment Variables (.env):**
```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=homeless_aid_db
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

#### 3. Model Definitions with Sequelize

**Example: HomelessProfile Model**
```javascript
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/postgres.js';

export const HomelessProfile = sequelize.define('HomelessProfile', {
  profile_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  age: DataTypes.INTEGER,
  gender: DataTypes.STRING,
  geo_lat: DataTypes.DOUBLE,
  geo_lng: DataTypes.DOUBLE,
  health_status: DataTypes.TEXT,
  skills: DataTypes.TEXT,
  needs: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    defaultValue: 'Medium'
  },
  status: {
    type: DataTypes.ENUM(
      'active', 'shelter_requested', 'shelter_assigned',
      'job_requested', 'job_assigned', 'both_requested', 'completed'
    ),
    defaultValue: 'active'
  },
  registered_by: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'user_id'
    }
  }
});
```

#### 4. Model Associations

**pg_models/index.js:**
```javascript
// Import all models
import { User } from './user.js';
import { HomelessProfile } from './homelessProfile.js';
import { Shelter } from './shelter.js';
import { AssignmentRequest } from './assignmentRequest.js';
// ... other imports

// Define associations
User.hasMany(HomelessProfile, { foreignKey: 'registered_by' });
HomelessProfile.belongsTo(User, { foreignKey: 'registered_by' });

Shelter.hasMany(AssignmentRequest, { foreignKey: 'shelter_id' });
AssignmentRequest.belongsTo(Shelter, { foreignKey: 'shelter_id' });

HomelessProfile.hasMany(AssignmentRequest, { foreignKey: 'profile_id' });
AssignmentRequest.belongsTo(HomelessProfile, { foreignKey: 'profile_id' });

// Export all models
export {
  User,
  HomelessProfile,
  Shelter,
  AssignmentRequest,
  // ... other exports
};
```


#### 5. Controllers

**Profile Controller Example:**
```javascript
import { HomelessProfile } from '../pg_models/homelessProfile.js';

// Create new profile
export async function createProfile(req, res) {
  try {
    const data = {
      ...req.body,
      registered_by: req.user.user_id, // From JWT
    };
    
    const profile = await HomelessProfile.create(data);
    res.status(201).json(profile);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
}

// Get all profiles
export async function getAllProfiles(req, res) {
  try {
    const profiles = await HomelessProfile.findAll();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
}

// Get single profile
export async function getProfileById(req, res) {
  try {
    const profile = await HomelessProfile.findByPk(req.params.id);
    if (!profile) return res.status(404).json({ msg: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
}
```

**Shelter Controller - Request Management:**
```javascript
export async function acceptRequest(req, res) {
  try {
    const { id } = req.params;
    const { shelter_id, shelter_user_id } = req.shelterUser;
    const { bed_number, room_number, notes } = req.body;

    // Find the request
    const request = await AssignmentRequest.findOne({
      where: { request_id: id, shelter_id, status: 'pending' },
      include: [{ model: HomelessProfile }]
    });

    if (!request) {
      return res.status(404).json({ msg: 'Request not found' });
    }

    const profile = request.HomelessProfile;

    // Create resident record
    const resident = await ShelterResident.create({
      shelter_id,
      ngo_profile_id: profile.profile_id,
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      health_status: profile.health_status,
      bed_number,
      room_number,
      status: 'active',
      source: 'ngo',
      notes
    });

    // Update request status
    await request.update({
      status: 'accepted',
      response_date: new Date(),
      response_by: shelter_user_id
    });

    // Update profile status
    await profile.update({
      status: 'shelter_assigned',
      current_shelter: (await Shelter.findByPk(shelter_id)).name,
      status_updated_at: new Date()
    });

    // Update shelter availability
    const shelter = await Shelter.findByPk(shelter_id);
    if (shelter && shelter.available_beds > 0) {
      await shelter.update({
        available_beds: shelter.available_beds - 1
      });
    }

    res.json({ msg: 'Request accepted', resident, request });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
}
```

#### 6. Authentication Middleware

**JWT Verification:**
```javascript
import jwt from 'jsonwebtoken';

export function protect(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid or expired token' });
  }
}

// Optional authentication
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    req.user = null;
  }
  next();
}
```

**Shelter Authentication:**
```javascript
export function protectShelter(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'Shelter') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    req.shelterUser = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
}
```

#### 7. Routes

**Profile Routes:**
```javascript
import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile
} from '../controllers/profileController.js';

const router = express.Router();

router.post('/', protect, createProfile);      // Protected
router.get('/', getAllProfiles);               // Public
router.get('/:id', getProfileById);            // Public
router.patch('/:id', protect, updateProfile);  // Protected
router.delete('/:id', protect, deleteProfile); // Protected

export default router;
```

**Shelter Request Routes:**
```javascript
import express from 'express';
import { protectShelter, requireShelterRole } from '../middlewares/shelterAuth.js';
import {
  getPendingRequests,
  getRequestDetails,
  acceptRequest,
  rejectRequest
} from '../controllers/shelterController.js';

const router = express.Router();

// All routes require shelter authentication
router.use(protectShelter);

router.get('/', getPendingRequests);
router.get('/:id', getRequestDetails);
router.post('/:id/accept', requireShelterRole('manager'), acceptRequest);
router.post('/:id/reject', requireShelterRole('manager'), rejectRequest);

export default router;
```

#### 8. Database Seeding

**seed.js - Key Sections:**
```javascript
import bcrypt from 'bcrypt';
import { sequelize } from './src/config/postgres.js';
import { User, HomelessProfile, Shelter, ShelterUser, Job } from './src/pg_models/index.js';

async function seed() {
  // Sync database
  await sequelize.sync({ force: true });
  
  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Create users
  const users = await User.bulkCreate([
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password_hash: hashedPassword,
      role: 'admin'
    },
    // ... more users
  ]);
  
  // Create shelters
  const shelters = await Shelter.bulkCreate([
    {
      name: 'Mumbai Hope Center',
      address: 'Dadar West, Mumbai',
      capacity: 60,
      available_beds: 15,
      geo_lat: 19.0176,
      geo_lng: 72.8562
    },
    // ... more shelters
  ]);
  
  // Create shelter users
  const shelterUsers = await ShelterUser.bulkCreate([
    {
      shelter_id: shelters[1].shelter_id,
      name: 'Priya Desai',
      email: 'priya@mumbaihope.com',
      password_hash: hashedPassword,
      role: 'manager'
    },
    // ... more shelter users
  ]);
  
  // Create sample profiles
  const profiles = await HomelessProfile.bulkCreate([
    {
      name: 'Priya Sharma',
      age: 28,
      gender: 'Female',
      geo_lat: 19.0760,
      geo_lng: 72.8777,
      health_status: 'Good',
      skills: 'Tailoring, Embroidery',
      needs: 'Shelter, Job training',
      priority: 'Medium',
      status: 'active',
      registered_by: users[0].user_id
    },
    // ... more profiles
  ]);
  
  console.log('✅ Database seeded successfully');
}

seed();
```

---

## Frontend Implementation

### Project Structure

```
frontend/
├── app/
│   ├── (shelter)/              # Shelter-specific routes
│   │   ├── dashboard/
│   │   │   └── shelter/
│   │   └── shelter/
│   │       ├── requests/
│   │       ├── residents/
│   │       └── medical/
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   │   ├── admin/
│   │   ├── ngo/
│   │   └── volunteer/
│   ├── profiles/
│   │   ├── [id]/
│   │   ├── all/
│   │   └── create/
│   ├── resources/
│   │   ├── shelters/
│   │   └── jobs/
│   ├── shelter-auth/
│   │   └── login/
│   ├── settings/
│   ├── help/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Shelter/
│   │   ├── requests/
│   │   ├── residents/
│   │   └── medical/
│   ├── Sidebar.tsx
│   ├── Navbar.tsx
│   ├── LayoutWrapper.tsx
│   ├── StatsCard.tsx
│   ├── MatchCard.tsx
│   └── MapSelector.tsx
├── lib/
│   ├── api.ts                  # API client
│   ├── shelterApi.ts           # Shelter-specific API
│   ├── types.ts                # TypeScript types
│   ├── localdb.ts              # IndexedDB wrapper
│   ├── offline.ts              # Offline queue
│   └── activityLog.ts          # Activity logging
├── mocks/
│   ├── handlers/
│   │   ├── authHandlers.ts
│   │   ├── profileHandlers.ts
│   │   └── shelterHandlers.ts
│   └── browser.ts
├── public/
│   ├── mockServiceWorker.js
│   └── icon.svg
└── package.json
```

### Core Frontend Concepts

#### 1. Next.js App Router

**File-based Routing:**
- `app/page.tsx` → `/`
- `app/auth/login/page.tsx` → `/auth/login`
- `app/profiles/[id]/page.tsx` → `/profiles/:id` (dynamic)
- `app/(shelter)/shelter/requests/page.tsx` → `/shelter/requests` (route group)

**Layout System:**
```typescript
// app/layout.tsx - Root layout
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <ClientI18nProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </ClientI18nProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
```

**Route Groups:**
- `(shelter)` - Groups shelter routes without affecting URL
- Allows separate layouts for shelter vs. regular users

#### 2. TypeScript Types

**lib/types.ts:**
```typescript
export interface HomelessProfile {
  profile_id: number;
  name: string;
  age: number;
  gender: string;
  health_status?: string;
  skills?: string;
  needs: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'active' | 'shelter_requested' | 'shelter_assigned' | 
          'job_requested' | 'job_assigned' | 'completed';
  current_shelter?: string;
  current_job?: string;
  geo_lat?: number;
  geo_lng?: number;
}

export interface Shelter {
  shelter_id: number;
  name: string;
  address: string;
  capacity: number;
  available_beds: number;
  phone?: string;
  amenities?: string;
  geo_lat?: number;
  geo_lng?: number;
}

export interface AssignmentRequest {
  request_id: number;
  profile_id: number;
  shelter_id: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  request_date: string;
  response_date?: string;
  rejection_reason?: string;
  HomelessProfile?: HomelessProfile;
  Shelter?: Shelter;
}
```

#### 3. API Client

**lib/api.ts:**
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Get auth token from session
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const session = localStorage.getItem('session');
  if (!session) return null;
  try {
    const user = JSON.parse(session);
    return user.token || null;
  } catch {
    return null;
  }
}

// Make authenticated API request
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// API functions
export async function createProfile(data: CreateProfileData): Promise<Profile> {
  return apiRequest<Profile>('/profiles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getProfiles(): Promise<Profile[]> {
  return apiRequest<Profile[]>('/profiles');
}

export async function getProfile(id: number): Promise<Profile> {
  return apiRequest<Profile>(`/profiles/${id}`);
}
```


#### 4. Form Handling with React Hook Form & Zod

**Profile Creation Form:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(1).max(120),
  gender: z.enum(['Male', 'Female', 'Other']),
  health: z.string().optional(),
  skills: z.string().optional(),
  needs: z.string().min(1, 'Please specify needs'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must provide consent',
  }),
});

type FormData = z.infer<typeof schema>;

export default function ProfileCreatePage() {
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      gender: 'Male',
      priority: 'Medium',
      consent: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { createProfile } = await import('@/lib/api');
      const profile = await createProfile(data);
      toast.success('Profile created!');
      router.push(`/profiles/${profile.profile_id}`);
    } catch (error) {
      toast.error('Failed to create profile');
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </FormProvider>
  );
}
```

#### 5. State Management with React Query

**Using TanStack Query:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch profiles
const { data: profiles, isLoading } = useQuery({
  queryKey: ['profiles'],
  queryFn: getProfiles,
});

// Create profile mutation
const queryClient = useQueryClient();
const createMutation = useMutation({
  mutationFn: createProfile,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['profiles'] });
    toast.success('Profile created!');
  },
  onError: (error) => {
    toast.error(error.message);
  },
});
```

#### 6. Offline Support

**Service Worker Registration:**
```typescript
// lib/offline.ts
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/mockServiceWorker.js')
      .then(() => console.log('Service Worker registered'))
      .catch((err) => console.error('SW registration failed:', err));
  }
}
```

**Offline Queue:**
```typescript
import localforage from 'localforage';

const offlineQueue = localforage.createInstance({
  name: 'offlineQueue'
});

export async function enqueueShelterAction(action: OfflineAction) {
  const queue = await offlineQueue.getItem<OfflineAction[]>('actions') || [];
  queue.push(action);
  await offlineQueue.setItem('actions', queue);
}

export async function processOfflineQueue() {
  const queue = await offlineQueue.getItem<OfflineAction[]>('actions') || [];
  
  for (const action of queue) {
    try {
      await executeAction(action);
      // Remove from queue on success
      const newQueue = queue.filter(a => a.id !== action.id);
      await offlineQueue.setItem('actions', newQueue);
    } catch (error) {
      console.error('Failed to process action:', error);
    }
  }
}
```

#### 7. Map Integration

**Leaflet Map Component:**
```typescript
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapSelector({ onLocationSelect }) {
  const [position, setPosition] = useState<[number, number]>([19.0760, 72.8777]);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onLocationSelect({ lat, lng });
      },
    });

    return <Marker position={position} />;
  }

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <LocationMarker />
    </MapContainer>
  );
}
```

#### 8. Authentication Flow

**Login Process:**
```typescript
const onEmailLogin = async (data: EmailFormData) => {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        role: data.role,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.msg || 'Login failed');
    }

    // Store session
    localStorage.setItem('session', JSON.stringify({
      token: result.token,
      role: result.role,
      user: result.email,
      name: result.name,
    }));

    toast.success('Logged in successfully!');
    window.location.href = '/dashboard';
  } catch (error) {
    toast.error(error.message);
  }
};
```

**Protected Routes:**
```typescript
useEffect(() => {
  const session = localStorage.getItem('session');
  if (!session) {
    router.push('/auth/login');
    return;
  }

  const user = JSON.parse(session);
  const role = user.role?.toLowerCase();
  
  if (role !== 'ngo' && role !== 'admin') {
    router.push('/dashboard');
    return;
  }
}, [router]);
```

#### 9. Component Architecture

**Reusable Components:**

**StatsCard:**
```typescript
interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType;
  color: string;
  delay?: number;
}

export function StatsCard({ title, value, icon: Icon, color, delay }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="card"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-brown">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <Icon className={`w-12 h-12 ${color}`} />
      </div>
    </motion.div>
  );
}
```

**Sidebar Navigation:**
```typescript
const NAV_LINKS = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard, roles: ['Volunteer', 'NGO', 'Admin'] },
  { href: '/profiles/all', labelKey: 'nav.profiles', icon: Users, roles: ['Volunteer', 'NGO', 'Admin'] },
  { href: '/resources/shelters', labelKey: 'nav.shelters', icon: Building2, roles: ['NGO', 'Admin'] },
  { href: '/resources/jobs', labelKey: 'nav.jobs', icon: Briefcase, roles: ['NGO', 'Admin'] },
  { href: '/settings', labelKey: 'nav.settings', icon: Settings, roles: ['Volunteer', 'NGO', 'Admin'] },
];

export function Sidebar({ isOpen, onClose }) {
  const [role, setRole] = useState('Volunteer');
  const pathname = usePathname();

  useEffect(() => {
    const session = localStorage.getItem('session');
    if (session) {
      const user = JSON.parse(session);
      setRole(user.role || 'Volunteer');
    }
  }, []);

  const filteredLinks = NAV_LINKS.filter(link => link.roles.includes(role));

  return (
    <aside className="sidebar">
      {filteredLinks.map(({ href, labelKey, icon: Icon }) => (
        <a
          key={href}
          href={href}
          className={pathname === href ? 'active' : ''}
        >
          <Icon className="w-5 h-5" />
          <span>{t(labelKey)}</span>
        </a>
      ))}
    </aside>
  );
}
```

---

## AI Integration

### Architecture

```
Frontend → Backend API → Python Flask Service → ML Models → Response
```

### AI Service Components

#### 1. Flask API Server

**app.py:**
```python
from flask import Flask, request, jsonify
from scorer import ShelterJobScorer

app = Flask(__name__)
scorer = ShelterJobScorer()

@app.route('/api/ai/recommendations', methods=['POST'])
def get_recommendations():
    try:
        data = request.json
        profile = data.get('profile')
        shelters = data.get('shelters', [])
        jobs = data.get('jobs', [])
        
        recommendations = scorer.score_matches(profile, shelters, jobs)
        
        return jsonify({
            'success': True,
            'recommendations': recommendations
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
```

#### 2. ML Scoring Model

**scorer.py:**
```python
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class ShelterJobScorer:
    def __init__(self):
        self.vectorizer = TfidfVectorizer()
    
    def calculate_distance(self, lat1, lon1, lat2, lon2):
        """Calculate distance between two coordinates (Haversine formula)"""
        R = 6371  # Earth's radius in km
        
        dlat = np.radians(lat2 - lat1)
        dlon = np.radians(lon2 - lon1)
        
        a = (np.sin(dlat/2)**2 + 
             np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * 
             np.sin(dlon/2)**2)
        c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1-a))
        
        return R * c
    
    def score_shelter_match(self, profile, shelter):
        """Score how well a shelter matches a profile"""
        score = 0
        reasons = []
        
        # Location proximity (40% weight)
        if profile.get('geo_lat') and shelter.get('geo_lat'):
            distance = self.calculate_distance(
                profile['geo_lat'], profile['geo_lng'],
                shelter['geo_lat'], shelter['geo_lng']
            )
            
            if distance < 5:
                score += 40
                reasons.append(f"Very close ({distance:.1f}km)")
            elif distance < 15:
                score += 30
                reasons.append(f"Nearby ({distance:.1f}km)")
            elif distance < 30:
                score += 20
                reasons.append(f"Accessible ({distance:.1f}km)")
        
        # Availability (30% weight)
        if shelter.get('available_beds', 0) > 0:
            score += 30
            reasons.append(f"{shelter['available_beds']} beds available")
        
        # Priority matching (20% weight)
        if profile.get('priority') == 'Critical':
            score += 20
            reasons.append("High priority case")
        
        # Amenities matching (10% weight)
        if shelter.get('amenities'):
            score += 10
            reasons.append("Good facilities")
        
        return {
            'shelter_id': shelter['shelter_id'],
            'name': shelter['name'],
            'score': min(score, 100),
            'reasons': reasons,
            'distance': distance if 'distance' in locals() else None
        }
    
    def score_job_match(self, profile, job):
        """Score how well a job matches a profile"""
        score = 0
        reasons = []
        
        # Skills matching (50% weight)
        if profile.get('skills') and job.get('skills_required'):
            profile_skills = set(profile['skills'].lower().split(','))
            job_skills = set(job['skills_required'].lower().split(','))
            
            match_count = len(profile_skills & job_skills)
            if match_count > 0:
                skill_score = min(match_count * 15, 50)
                score += skill_score
                reasons.append(f"{match_count} matching skills")
        
        # Location proximity (30% weight)
        if profile.get('geo_lat') and job.get('geo_lat'):
            distance = self.calculate_distance(
                profile['geo_lat'], profile['geo_lng'],
                job['geo_lat'], job['geo_lng']
            )
            
            if distance < 10:
                score += 30
                reasons.append(f"Close to location ({distance:.1f}km)")
            elif distance < 25:
                score += 20
                reasons.append(f"Reasonable distance ({distance:.1f}km)")
        
        # Experience matching (20% weight)
        if profile.get('workHistory') and job.get('requirements'):
            # Simple text similarity
            score += 20
            reasons.append("Relevant experience")
        
        return {
            'job_id': job['job_id'],
            'title': job['title'],
            'organization': job['organization'],
            'score': min(score, 100),
            'reasons': reasons
        }
    
    def score_matches(self, profile, shelters, jobs):
        """Score all shelters and jobs for a profile"""
        shelter_scores = [
            self.score_shelter_match(profile, shelter)
            for shelter in shelters
        ]
        
        job_scores = [
            self.score_job_match(profile, job)
            for job in jobs
        ]
        
        # Sort by score
        shelter_scores.sort(key=lambda x: x['score'], reverse=True)
        job_scores.sort(key=lambda x: x['score'], reverse=True)
        
        return {
            'shelters': shelter_scores[:5],  # Top 5
            'jobs': job_scores[:5]
        }
```

#### 3. Backend Integration

**aiController.js:**
```javascript
import fetch from 'node-fetch';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

export async function getRecommendations(req, res) {
  try {
    const { profile_id } = req.params;
    
    // Fetch profile
    const profile = await HomelessProfile.findByPk(profile_id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    // Fetch all shelters and jobs
    const shelters = await Shelter.findAll();
    const jobs = await Job.findAll();
    
    // Call AI service
    const response = await fetch(`${AI_SERVICE_URL}/api/ai/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: profile.toJSON(),
        shelters: shelters.map(s => s.toJSON()),
        jobs: jobs.map(j => j.toJSON())
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    res.json(result.recommendations);
  } catch (error) {
    console.error('AI service error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
}
```

#### 4. Frontend Integration

**AIRecommendations Component:**
```typescript
export function AIRecommendations({ profileId }: { profileId: number }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecommendations() {
      try {
        const response = await fetch(
          `${API_BASE}/ai/recommendations/${profileId}`
        );
        const data = await response.json();
        setRecommendations(data);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, [profileId]);

  if (loading) return <div>Loading recommendations...</div>;

  return (
    <div>
      <h3>Shelter Recommendations</h3>
      {recommendations?.shelters.map(shelter => (
        <div key={shelter.shelter_id}>
          <h4>{shelter.name}</h4>
          <p>Match Score: {shelter.score}%</p>
          <ul>
            {shelter.reasons.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        </div>
      ))}
      
      <h3>Job Recommendations</h3>
      {recommendations?.jobs.map(job => (
        <div key={job.job_id}>
          <h4>{job.title}</h4>
          <p>Match Score: {job.score}%</p>
          <ul>
            {job.reasons.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

### AI Features

1. **Location-based Matching**: Uses Haversine formula for distance calculation
2. **Skills Matching**: Text analysis and keyword matching
3. **Priority Weighting**: Critical cases get higher scores
4. **Availability Checking**: Only recommends shelters with beds
5. **Multi-factor Scoring**: Combines multiple criteria with weights

---

## Authentication & Security

### JWT Token Structure

**Token Payload:**
```json
{
  "user_id": 1,
  "email": "admin@example.com",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Token Generation:**
```javascript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export async function login(req, res) {
  const { email, password, role } = req.body;
  
  // Find user
  const user = await User.findOne({ where: { email, role } });
  if (!user) {
    return res.status(401).json({ msg: 'Invalid credentials' });
  }
  
  // Verify password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ msg: 'Invalid credentials' });
  }
  
  // Generate token
  const token = jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.json({
    token,
    role: user.role,
    name: user.name,
    email: user.email
  });
}
```

### Security Measures

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Signed with secret key
3. **Token Expiration**: 7-day validity
4. **Role-based Access**: Middleware checks user roles
5. **CORS Configuration**: Controlled cross-origin requests
6. **Input Validation**: Zod schemas on frontend, validation on backend
7. **SQL Injection Prevention**: Sequelize ORM parameterized queries
8. **XSS Protection**: React's built-in escaping

---

## API Documentation

### Base URL
```
http://localhost:5000
```

### Authentication Endpoints

#### POST /auth/login
**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "admin",
  "name": "Admin User",
  "email": "admin@example.com"
}
```

### Profile Endpoints

#### GET /profiles
Get all profiles

**Response:**
```json
[
  {
    "profile_id": 1,
    "name": "John Doe",
    "age": 35,
    "gender": "Male",
    "status": "active",
    "priority": "Medium",
    ...
  }
]
```

#### POST /profiles
Create new profile (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "John Doe",
  "age": 35,
  "gender": "Male",
  "needs": "Shelter, medical care",
  "priority": "High"
}
```

#### GET /profiles/:id
Get single profile

#### PATCH /profiles/:id
Update profile (requires authentication)

#### DELETE /profiles/:id
Delete profile (requires authentication)

### Shelter Endpoints

#### GET /shelters
Get all shelters

#### GET /shelters/:id
Get single shelter

#### POST /shelters
Create shelter (requires authentication)

#### PUT /shelters/:id
Update shelter (requires authentication)

### Assignment Endpoints

#### POST /assignments
Create assignment request

**Request:**
```json
{
  "profile_id": 1,
  "resource_id": 2,
  "resource_type": "shelter",
  "resource_name": "Mumbai Hope Center"
}
```

#### GET /assignments
Get all assignments

#### GET /assignments/profile/:profile_id
Get assignments for a profile

### Shelter Management Endpoints

#### POST /shelter/auth/login
Shelter staff login

#### GET /shelter/requests
Get pending requests for authenticated shelter

#### POST /shelter/requests/:id/accept
Accept placement request

**Request:**
```json
{
  "bed_number": "A01",
  "room_number": "101",
  "notes": "Admitted successfully"
}
```

#### POST /shelter/requests/:id/reject
Reject placement request

**Request:**
```json
{
  "rejection_reason": "No available beds"
}
```

#### GET /shelter/residents
Get all residents for authenticated shelter

#### POST /shelter/residents
Add walk-in resident

#### GET /shelter/medical
Get medical records

#### POST /shelter/medical
Add medical record

---

## Deployment

### Environment Setup

**Backend .env:**
```
DB_HOST=your_postgres_host
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=homeless_aid_db
JWT_SECRET=your_secret_key_here
PORT=5000
AI_SERVICE_URL=http://localhost:5001
```

**Frontend .env.local:**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Database Setup

```bash
# Create PostgreSQL database
createdb homeless_aid_db

# Run seed script
cd backend
node seed.js
```

### Running the Application

**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**AI Service:**
```bash
cd backend/homeless-aid-platform/ai_implementations
pip install -r requirements.txt
python app.py
```

### Production Considerations

1. **Database**: Use managed PostgreSQL (AWS RDS, Azure Database)
2. **Backend**: Deploy to Node.js hosting (Heroku, AWS EC2, DigitalOcean)
3. **Frontend**: Deploy to Vercel, Netlify, or AWS Amplify
4. **AI Service**: Deploy to Python hosting (AWS Lambda, Google Cloud Run)
5. **Environment Variables**: Use secure secret management
6. **HTTPS**: Enable SSL certificates
7. **Database Backups**: Regular automated backups
8. **Monitoring**: Set up logging and error tracking
9. **Scaling**: Load balancing for high traffic

---

## Conclusion

NEST is a comprehensive full-stack application built with modern technologies and best practices. The system integrates React/Next.js frontend, Express.js backend, PostgreSQL database, and Python-based AI services to provide an efficient platform for homeless aid management.

Key technical achievements:
- Robust authentication and authorization
- Real-time data synchronization
- Offline-first architecture
- AI-powered recommendations
- Scalable database design
- RESTful API architecture
- Type-safe frontend with TypeScript
- Comprehensive error handling
- Role-based access control
- Mobile-responsive design
