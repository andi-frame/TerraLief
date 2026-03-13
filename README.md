# TerraLief

TerraLief is a disaster-response web application that helps communities and responders coordinate **shelter availability**, **route reports**, and **on-ground updates** in one place.

Youtube video:
https://youtu.be/PMIEwL-dbP8

The Report is inside /docs folder

This repository is a multi-service project containing:

- A **frontend** web client (Vite + React + TypeScript)
- A **backend** API service (Node.js + TypeScript)
- An **ML service** for estimation/prediction tasks (Python)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Core Features](#core-features)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Run with Docker (Recommended)](#run-with-docker-recommended)
- [Run Locally (Without Docker)](#run-locally-without-docker)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Project Overview

In emergency situations, reliable information can save lives. TerraLief is designed to centralize critical information such as:

- Shelter locations and shelter metadata
- Public/user reports from affected areas
- Route-related information for safer movement
- Supporting ML-powered estimation services

The app aims to provide a lightweight workflow for both contributors and responders.

---

## Core Features

- **Authentication flow** for user access
- **Shelter management** (create and retrieve shelter data)
- **Report management** for incident updates
- **Route-related APIs and UI pages**
- **Map-oriented frontend components**
- **Dedicated ML microservice** for estimation-related logic

---

## Architecture

### Frontend (`/frontend`)

- Vite + React + TypeScript
- UI pages for auth, shelters, routes, and reporting
- Data hooks and service wrappers to call backend APIs

### Backend (`/backend`)

- Node.js + TypeScript
- Layered structure:
  - `controllers` (HTTP handlers)
  - `services` (business logic)
  - `repositories` (data access)
  - `models` / `schemas` (data definitions/validation)
- Includes tests under `backend/tests`

### ML Services (`/ml-services`)

- Python service with API routes and estimation logic
- Structured under `app/api` and `app/services`

---

## Repository Structure

```text
terralief/
├── backend/
├── frontend/
├── ml-services/
├── docker-compose.yml
├── docker-compose.local.yml
└── README.md
```

---

## Prerequisites

Use one of these approaches:

### Option A (Recommended): Docker

- Docker Desktop (latest stable)
- Docker Compose

### Option B: Local development

- Node.js (LTS recommended)
- bun (comes with Node.js)
- Python 3.10+ (for `ml-services`)

> If your team standardizes versions, follow each service’s local `README.md` and config files.

---

## Environment Setup

Each service includes `.env.example`. Copy it to `.env` before running.

Create these files:

- `backend/.env` from `backend/.env.example`
- `frontend/.env` from `frontend/.env.example`
- `ml-services/.env` if needed by your local setup

Fill values based on your environment (API URLs, database config, secrets, etc.).

---

## Run with Docker (Recommended)

For Production:

```bash
docker compose up --build
```

For Development:

```bash
docker compose -f docker-compose.local.yml up --build
```

This should start the required services together.

To stop:

```bash
docker compose down
```

---

## Run Locally (Without Docker)

Run each service in its own terminal.

### 1) Backend

```bash
cd backend
bun install
bun run dev
```

### 2) Frontend

```bash
cd frontend
bun install
bun run dev
```

### 3) ML Service

```bash
cd ml-services
python -m venv .venv
source .venv/Scripts/activate
pip install -U pip
pip install -e .
python -m app.main
```

> On some setups, the ML service start command may differ depending on `pyproject.toml` or local conventions.

---

## Testing

### Backend tests

```bash
cd backend
bun test
```

If available in scripts, you can also run lint/type checks:

```bash
cd backend
bun run lint
bun run typecheck
```

### Frontend checks

```bash
cd frontend
bun run lint
```

---

## Troubleshooting

- Ensure all `.env` files exist and required variables are set.
- If ports are already in use, stop conflicting services or update port mappings.
- Rebuild containers after dependency/config updates:

```bash
docker compose down
docker compose up --build
```

- If local package resolution fails, remove lockfiles/node_modules (or venv) and reinstall cleanly.

---

## Contributing

1. Create a feature branch from `integrate` (or your team’s active branch model).
2. Keep changes scoped and documented.
3. Run tests/lint before opening a PR.
4. Add/update docs when behavior changes.

---

For service-specific details, see:

- `backend/README.md`
- `frontend/README.md`
- `ml-services/README.md`
