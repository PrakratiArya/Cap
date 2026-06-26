# Jodo - Mobile-First Flutter Blueprint (Phases 1-9)

**Jodo** (जोड़ो — meaning *Connect, Unite, Bring Together*) is an AI-powered Mobile Community Intelligence Platform that transforms individual observations into collective action, community verification, risk intelligence, and resolutions.

---

## 1. Mobile App Architecture & State Management

To ensure scalability, maintainability, and clean code separation, the mobile app uses **Clean Architecture** combined with **Riverpod** for reactive state management.

```
+---------------------------------------------------------------------------------+
|                               PRESENTATION LAYER (UI)                           |
|  - Widgets & Screens (Main Navigation Hub, Geographic Map, Momentum Graph)      |
|  - Riverpod State Providers (Notifiers managing UI states & UI events)          |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
|                                 DOMAIN LAYER                                    |
|  - Entities (User, Issue, Cluster, Mission, AgentLog)                           |
|  - Use Cases (SubmitObservation, VerifyIssue, GetNearbyIssues)                  |
|  - Repository Interfaces (Boundary contracts for data sources)                  |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
|                                  DATA LAYER                                     |
|  - Repository Implementations (Fetches, coordinates, and caches data)           |
|  - Data Sources: Remote (Dio client / REST API), Local (Isar Database / Hive)  |
|  - Device Integrations (Location service, Camera API, Microphone/Audio)         |
+---------------------------------------------------------------------------------+
```

---

## 2. Mobile Screen Flow & Navigation

Jodo uses a hybrid navigation structure: a persistent **Bottom Navigation Bar** for primary views, with **Stack Navigation** for detail screens and camera overlays.

```
[Splash Screen] 
      |
      v
[Auth / Onboarding Stack] (Sign Up -> Sign In -> Role Selection)
      |
      v
[Main Navigation Hub] (Persistent Bottom Navigation Bar)
      |
      +---> [Dashboard / Explorer Screen] (Area Pulse, Health index, recent feed)
      |         |---> [Stack] [Issue Detail Screen] (Impact/Momentum scores, Verify action)
      |
      +---> [Geographic Risk Map Screen] (Flutter Map + heatmaps + dynamic cluster markers)
      |
      +---> [Observation Ingest Screen] (Camera/Video shutter, Audio recorder widget)
      |         |---> [Stack] [Agent Processing Console Overlay] (Live AI agent execution logs)
      |
      +---> [Community Missions Screen] (Gamified localized quest cards)
      |
      +---> [User Profile / Pulse Screen] (Badges, reputation history, trust score)
```

---

## 3. Detailed Mobile Navigation Structure

### Main Nav Hub (Bottom Bar Tabs)
1. **Home / Explorer Tab:** Displays local area statistics, Area Health Scores, and a feed of unresolved/recent community issues.
2. **Risk Map Tab:** Fullscreen interactive map (using `flutter_map` or Google Maps SDK). Integrates live GPS tracking, search, and layer toggles (Heatmap / Risk Clusters).
3. **Ingest Tab:** Floating action center. Opens the media ingestion interface (Camera capture, video clip selection, audio microphone widget) to start the AI agent processing pipeline.
4. **Missions Tab:** Lists active regional community cleanup and audit missions, displaying progress bars, participants, and reward badges.
5. **Profile Tab:** Shows user reputation (Trust Index), verification audit history, user level, and personal observation statistics.

---

## 5. Mobile-First Implementation Roadmap

```
Phase 1: Product & Mobile Flow Review (Approved)
  |
  v
Phase 2: Mobile App Architecture (Approved)
  |
  v
Phase 3: Relational Mobile DB Design (Approved)
  |
  v
Phase 4: Flutter Custom-Theme UI (Approved)
  |
  v
Phase 5: Mobile Ingest & Canvas Graph Design (Approved)
  |
  v
Phase 6: Codebase Folder Scaffolding (Approved)
  |
  v
Phase 7: Flutter App Implementation (Completed)
  |
  v
Phase 8: Mobile Execution Validation & Testing (Completed)
  |
  v
Phase 9: Mobile Deployment Guidelines (Current Step - Awaiting Final Approval)
```

---

# Phase 2: System Architecture Specification

*(Completed and Approved by User)*

---

# Phase 3: Relational & Spatial Database Design

*(Completed and Approved by User)*

---

# Phase 4: Mobile UI/UX Design Specification

*(Completed and Approved by User)*

---

# Phase 5: AI Agent Pipeline & Prompt Engineering

*(Completed and Approved by User)*

---

# Phase 6: Codebase Folder Scaffolding Blueprint

*(Completed and Approved by User)*

---

# Phase 9: Deployment Guidelines & Infrastructure Scripts

We detail the scripts for deploying Jodo's backend systems via Docker containerization and compiling mobile client builds.

## 1. Backend Ingest & Worker Containerization

### Dockerfile (`jodo_backend/Dockerfile`)
Optimized lightweight production Node.js runner:
```dockerfile
FROM node:18-alpine

# Set Working directory
WORKDIR /usr/src/app

# Install system utilities needed for building node extensions
RUN apk add --no-cache python3 make g++

# Copy package descriptors
COPY package*.json ./

# Clean npm install
RUN npm ci --only=production

# Copy core codebase
COPY . .

# Expose HTTP API Port
EXPOSE 3000

# Set dynamic start script
CMD ["node", "src/server.js"]
```

### Docker Compose Orchestration (`jodo_backend/docker-compose.yml`)
Fuses our Express web app, asynchronous Redis message brokers, and transactional spatial databases in a secure container network:
```yaml
version: '3.8'

services:
  # Database Service (PostgreSQL + Spatial GIS + pgvector extensions)
  database:
    image: postgis/postgis:15-3.3-alpine
    container_name: jodo_database
    environment:
      POSTGRES_USER: jodo_admin
      POSTGRES_PASSWORD: jodo_db_secure_password
      POSTGRES_DB: jodo_intelligence
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U jodo_admin -d jodo_intelligence"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Service (BullMQ queue storage)
  redis:
    image: redis:7-alpine
    container_name: jodo_redis
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

  # Core API Server
  api_server:
    build: .
    container_name: jodo_api_server
    environment:
      - PORT=3000
      - DATABASE_URL=postgres://jodo_admin:jodo_db_secure_password@database:5432/jodo_intelligence
      - REDIS_URL=redis://redis:6379
      - GEMINI_API_KEY=your_google_gemini_token_here
    ports:
      - "3000:3000"
    depends_on:
      database:
        condition: service_healthy
      redis:
        condition: service_started

  # Asynchronous Background Worker (AI Agent Coordinator)
  agent_worker:
    build: .
    container_name: jodo_agent_worker
    command: ["npm", "run", "worker"]
    environment:
      - DATABASE_URL=postgres://jodo_admin:jodo_db_secure_password@database:5432/jodo_intelligence
      - REDIS_URL=redis://redis:6379
      - GEMINI_API_KEY=your_google_gemini_token_here
    depends_on:
      - database
      - redis

volumes:
  pgdata:
  redisdata:
```

---

## 2. Mobile Native System Configurations

Flutter requires device hardware permission keys declared in platform-specific build manifests:

### 1. Android Manifest Permissions (`jodo_mobile/android/app/src/main/AndroidManifest.xml`)
Append inside the `<manifest>` wrapper to support camera, location, and micro-ingestion services:
```xml
<!-- Hardware Access Permissions -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
```

### 2. iOS Info.plist Permission Keys (`jodo_mobile/ios/Runner/Info.plist`)
Define explanation descriptions to request permission alerts at runtime:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Jodo requires GPS coordinates to verify observation location and calculate local risk maps.</string>
<key>NSCameraUsageDescription</key>
<string>Jodo requires camera access to snap photos of community issues and verify repaired status.</string>
<key>NSMicrophoneUsageDescription</key>
<string>Jodo requires microphone access to record voice descriptions of civic observations.</string>
```

---

## User Review Required

> [!IMPORTANT]
> **Infrastructure and Release Approvals:**
> 1. **PostGIS Container Image:** Fusing PostGIS with standard Postgres 15 Docker images to support SQL geolocation queries natively.
> 2. **Mobile Hardware Permission Labels:** Verification of the iOS/Android permission description text strings.
> 3. **Docker Compose Network Limits:** Orchestrating API webserver, workers, databases, and redis instances on a isolated private container network bridges.

---

## Verification Plan

### Automated Verification
* Verify that the client-side simulator builds cleanly. (Vite build verified).
