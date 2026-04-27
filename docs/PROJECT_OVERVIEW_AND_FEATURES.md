# NEST - Homeless Aid Platform
## Project Overview and Features Documentation

---

## Table of Contents
1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [User Roles and Access](#user-roles-and-access)
4. [Core Features](#core-features)
5. [User Workflows](#user-workflows)
6. [Data Management](#data-management)

---

## Introduction

NEST (Network for Emergency Shelter and Transition) is a comprehensive humanitarian aid platform designed to streamline the management and assistance of homeless individuals. The system connects multiple stakeholders including NGO workers, volunteers, shelter managers, and administrators to provide coordinated support services.

### Mission
To provide a centralized, efficient system for managing homeless aid operations, from initial profile creation to successful placement in shelters and employment opportunities.

### Target Users
- **Volunteers**: Field workers who register and assess homeless individuals
- **NGO Staff**: Organization members who manage resources and coordinate placements
- **Administrators**: System managers with full access to all features
- **Shelter Managers**: Staff managing shelter operations, residents, and requests

---

## System Overview

### Platform Architecture
NEST is a full-stack web application consisting of:
- **Frontend**: Modern, responsive web interface
- **Backend**: RESTful API server
- **Database**: PostgreSQL for persistent data storage
- **AI Service**: Machine learning models for intelligent recommendations

### Geographic Focus
The system currently supports operations across India with special focus on:
- Major metropolitan areas (Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad, Pune, Jaipur)
- Kerala state (Kochi, Trivandrum, Kozhikode, Thrissur, Kollam, Kannur, Palakkad, Alappuzha)

---

## User Roles and Access

### 1. Volunteer
**Primary Responsibilities:**
- Register new homeless individuals
- Conduct field assessments
- Update profile information
- View available resources

**Access Level:**
- Create and edit profiles
- View shelters and jobs
- Access dashboard with activity overview

### 2. NGO Staff
**Primary Responsibilities:**
- Manage organizational resources
- Coordinate shelter and job placements
- Monitor placement success rates
- Oversee volunteer activities

**Access Level:**
- All volunteer permissions
- Manage shelters and job listings
- Send placement requests to shelters
- View system-wide statistics

### 3. Administrator
**Primary Responsibilities:**
- System-wide management
- User account management
- Resource allocation oversight
- System configuration

**Access Level:**
- Full system access
- User management
- All NGO and volunteer permissions
- System settings and configuration

### 4. Shelter Manager
**Primary Responsibilities:**
- Manage shelter operations
- Review and respond to placement requests
- Track resident information
- Maintain medical records
- Monitor bed availability

**Access Level:**
- Shelter-specific dashboard
- Request management (accept/reject)
- Resident management
- Medical records
- Daily logs and notes

---

## Core Features

### 1. Profile Management

#### Profile Creation
**Multi-Step Registration Process:**

**Step 1: Location**
- Interactive map for precise location marking
- GPS coordinates capture
- Address autocomplete
- Location name recording

**Step 2: Basic Information**
- Full name and alias
- Age and gender
- Photo capture (optional)
- Contact information

**Step 3: Health Assessment**
- Current health status
- Disabilities or special needs
- Medical conditions
- Medication requirements

**Step 4: Skills and Work History**
- Professional skills
- Previous employment
- Work experience
- Certifications

**Step 5: Needs Assessment**
- Immediate needs identification
- Priority level assignment (Low, Medium, High, Critical)
- Special requirements

**Step 6: Consent**
- Data privacy acknowledgment
- Consent for information sharing
- Terms acceptance

#### Profile Features
- Unique QR code generation for each profile
- Comprehensive profile view with all details
- Edit and update capabilities
- Status tracking (Active, Shelter Requested, Shelter Assigned, Job Assigned, Completed)
- Activity history

### 2. Resource Management

#### Shelter Management
**Shelter Information:**
- Name and location
- Total capacity and available beds
- Contact information
- Amenities and facilities
- Manager details
- Geographic coordinates

**Shelter Operations:**
- Real-time bed availability tracking
- Capacity management
- Shelter profile pages
- Search and filter capabilities

#### Job Listings
**Job Information:**
- Job title and description
- Employer/organization
- Location
- Job type (Full-time, Part-time, Contract)
- Salary/wage information
- Required skills
- Application process

**Job Management:**
- Create and edit listings
- Track applications
- Job matching with profiles

### 3. Placement System

#### Assignment Requests
**Shelter Placement Workflow:**
1. NGO/Admin selects a profile
2. Reviews AI recommendations for suitable shelters
3. Sends placement request to chosen shelter
4. Shelter manager receives notification
5. Manager reviews profile details
6. Accepts or rejects request with reason
7. Upon acceptance:
   - Resident record created
   - Profile status updated
   - Bed availability decremented
   - Notifications sent

**Job Assignment:**
- Direct job allocation
- Profile status update
- Employment tracking

#### Request Management (Shelter Side)
**Pending Requests:**
- List of all incoming requests
- Profile preview
- Priority indicators
- Request date and details

**Request Actions:**
- **Accept**: Assign bed number, room, add notes
- **Reject**: Provide rejection reason
- View requester information

### 4. Shelter Dashboard

#### Overview Section
**Key Metrics:**
- Total beds vs. occupied beds
- Available capacity
- Pending requests count
- Recent admissions
- Upcoming discharges

**Quick Actions:**
- View pending requests
- Add walk-in resident
- Access medical records
- View daily logs

#### Resident Management
**Resident Information:**
- Personal details
- Admission date
- Bed and room assignment
- Health status
- Skills and background
- Source (NGO referral, walk-in, other)
- Current status (Active, Discharged, Transferred)

**Resident Operations:**
- Add new walk-in residents
- Update resident information
- Discharge residents
- Transfer between shelters
- View resident history

**Resident Tabs:**
- Overview: Basic information and status
- Medical: Health records and appointments
- Logs: Daily notes and observations
- Documents: Uploaded files and records

#### Medical Records
**Health Tracking:**
- Medical history
- Current conditions
- Medications
- Doctor visits
- Follow-up appointments
- Emergency contacts

**Medical Operations:**
- Add medical records
- Schedule follow-ups
- Track medication
- Record doctor consultations

#### Daily Logs
**Activity Logging:**
- Date-stamped entries
- Staff notes
- Incident reports
- Behavioral observations
- Progress notes
- Attachments support

### 5. Dashboard and Analytics

#### Volunteer/NGO Dashboard
**Statistics Display:**
- Total profiles registered
- Active cases
- Successful placements
- Pending requests

**Recent Activity:**
- Latest profile registrations
- Recent placements
- System notifications
- Quick action buttons

#### Admin Dashboard
**System Overview:**
- Total profiles in system
- Number of shelters
- Job listings count
- Successful placements
- Active volunteers
- NGO partners

**System Management:**
- Manage profiles
- Manage shelters
- Manage jobs
- View successful placements
- System settings

**System Health:**
- Database status
- API status
- Storage usage
- Performance metrics

### 6. AI-Powered Recommendations

#### Intelligent Matching
**Shelter Recommendations:**
- Based on location proximity
- Capacity availability
- Amenities match with needs
- Priority consideration
- Historical success rates

**Job Recommendations:**
- Skills matching
- Experience alignment
- Location preferences
- Salary expectations
- Job type preferences

**Recommendation Display:**
- Match score (percentage)
- Reasoning explanation
- Distance calculation
- Availability status
- Quick action buttons

### 7. Search and Filtering

#### Profile Search
- Search by name
- Filter by status
- Filter by priority
- Filter by location
- Date range filtering

#### Resource Search
- Search shelters by name/location
- Filter by availability
- Filter by capacity
- Geographic search

- Search jobs by title/employer
- Filter by job type
- Filter by location
- Salary range filtering

### 8. Authentication and Security

#### User Authentication
**Login Methods:**
- Email and password
- Phone and OTP (for volunteers)
- Role-based access

**Separate Authentication:**
- Regular users (Volunteer, NGO, Admin)
- Shelter staff (separate login portal)

**Security Features:**
- JWT token-based authentication
- Password hashing (bcrypt)
- Session management
- Role-based access control
- Secure API endpoints

### 9. Offline Support

#### Offline Capabilities
- Service worker implementation
- Offline data caching
- Queue system for offline actions
- Automatic sync when online
- Offline indicators

**Offline Features:**
- View cached profiles
- View cached resources
- Queue shelter actions
- Offline notifications

---

## User Workflows

### Workflow 1: Registering a Homeless Individual

1. **Volunteer logs in** to the system
2. **Navigates to "Create Profile"**
3. **Completes 6-step registration:**
   - Marks location on map
   - Enters personal details
   - Records health information
   - Documents skills and work history
   - Identifies immediate needs
   - Obtains consent
4. **Submits profile**
5. **System generates unique profile ID and QR code**
6. **AI analyzes profile and generates recommendations**
7. **Profile appears in system with "Active" status**

### Workflow 2: Placing Someone in a Shelter

**NGO/Admin Side:**
1. **Searches for profile** needing shelter
2. **Views profile details** and AI recommendations
3. **Selects suitable shelter** from recommendations
4. **Clicks "Request Shelter Placement"**
5. **Confirms request** with notes
6. **Profile status updates** to "Shelter Requested"

**Shelter Manager Side:**
1. **Receives notification** of new request
2. **Views request** in "Pending Requests" section
3. **Reviews profile details:**
   - Personal information
   - Health status
   - Special needs
   - Priority level
4. **Makes decision:**
   - **Accept**: Assigns bed number, room, adds notes
   - **Reject**: Provides reason for rejection
5. **Upon acceptance:**
   - New resident record created
   - Profile status updates to "Shelter Assigned"
   - Bed availability decreases
   - NGO receives confirmation

### Workflow 3: Managing Shelter Residents

1. **Shelter manager logs in**
2. **Views dashboard** with current statistics
3. **Accesses "Residents" section**
4. **Can perform various actions:**
   - View all active residents
   - Add walk-in residents
   - Update resident information
   - Add medical records
   - Create daily logs
   - Discharge residents
5. **For each resident:**
   - View complete profile
   - Track medical history
   - Monitor progress
   - Document activities

### Workflow 4: Job Placement

1. **Admin/NGO creates job listing**
2. **Profile is matched** with suitable jobs
3. **NGO assigns job** to profile
4. **Profile status updates** to "Job Assigned"
5. **Employment tracked** in system

### Workflow 5: Walk-in Admission

1. **Individual arrives at shelter**
2. **Shelter manager logs in**
3. **Navigates to "Add Resident"**
4. **Enters resident information:**
   - Personal details
   - Health status
   - Skills
   - Emergency contacts
5. **Assigns bed and room**
6. **Marks source as "Walk-in"**
7. **Resident added to system**
8. **Bed availability updated**

---

## Data Management

### Profile Data
- Personal information
- Location data
- Health records
- Skills and employment history
- Needs assessment
- Status tracking
- Placement history
- Activity logs

### Shelter Data
- Facility information
- Capacity and availability
- Staff information
- Resident records
- Medical records
- Daily logs
- Request history

### Job Data
- Job listings
- Employer information
- Requirements
- Assignments
- Application tracking

### User Data
- Account information
- Role assignments
- Activity history
- Permissions

### System Data
- Audit logs
- Sync logs
- Performance metrics
- Error logs

---

## Key Benefits

### For Volunteers
- Streamlined profile creation
- Mobile-friendly interface
- Offline capability
- Quick access to resources

### For NGOs
- Centralized management
- Efficient placement process
- Success tracking
- Resource coordination

### For Shelter Managers
- Simplified operations
- Digital record keeping
- Request management
- Resident tracking

### For Administrators
- System-wide oversight
- User management
- Resource allocation
- Analytics and reporting

### For Homeless Individuals
- Faster assistance
- Better matching
- Coordinated care
- Improved outcomes

---

## Conclusion

NEST provides a comprehensive solution for homeless aid management, connecting all stakeholders in a coordinated effort to provide efficient, effective assistance. The platform combines modern technology with humanitarian goals to create meaningful impact in the lives of those experiencing homelessness.
