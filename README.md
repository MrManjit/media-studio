# 📸 Media Studio

A modern full-stack media management application inspired by Google Photos, built using Django REST Framework, Next.js, PostgreSQL, and Docker.

Media Studio allows users to upload, organize, preview, favorite, and manage images and videos with a clean and responsive interface.

---

## ✨ Features

### 📤 Upload
- Upload images and videos
- Automatic file storage and metadata tracking
- Supports multiple media formats

### 📁 Media Library
- View all uploaded media
- Image and video support
- Fullscreen preview
- Download files
- Search by filename
- Filter by media type
- Sort by:
  - Newest
  - Oldest
  - Name
  - File size

### ❤️ Favorites
- Mark media as favorite
- View all favorite files
- Remove media from favorites

### 🗑 Trash Management
- Soft delete media
- Restore deleted media
- Permanently delete files

---

## 🏗️ Tech Stack

### Backend
- Python 3.13
- Django 5
- Django REST Framework
- PostgreSQL
- Redis
- Pillow
- Celery (ready for background tasks)

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

### DevOps
- Docker
- Docker Compose

---

## 🏛 Architecture

```
                 Browser
                     |
                     |
              Next.js Frontend
                     |
               REST API Calls
                     |
            Django REST Framework
                     |
        +------------+------------+
        |                         |
   PostgreSQL                 Media Storage
(Database & Metadata)       (Images/Videos)
                     |
                  Redis
             (Background Tasks)
```

---

## 🚀 Getting Started

### 1. Clone repository

```bash
git clone <your-repository-url>
cd media-studio
```

---

### 2. Configure environment

Create `.env` file:

```env
POSTGRES_DB=mediastudio
POSTGRES_USER=mediastudio
POSTGRES_PASSWORD=your_password

DJANGO_SECRET_KEY=your_secret_key
DJANGO_DEBUG=True
```

---

### 3. Start application

```bash
docker compose up --build
```

---

### 4. Access services

Frontend:

```
http://localhost:3000
```

Backend API:

```
http://localhost:8000
```

Admin:

```
http://localhost:8000/admin
```

---

## 📡 Current API Endpoints

### Media

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/media/` | List media |
| POST | `/api/media/upload/` | Upload media |
| DELETE | `/api/media/{id}/` | Move media to trash |

### Favorites

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/media/favorites/` | List favorites |
| POST | `/api/media/{id}/favorite/` | Toggle favorite |

### Trash

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/media/trash/` | View trash |
| POST | `/api/media/{id}/restore/` | Restore media |
| DELETE | `/api/media/{id}/permanent/` | Permanently delete |

---

## 🛣 Roadmap

### Version 1.0
- Albums and Collections
- Album covers
- Add/remove media from albums

### Version 1.1
- AI image tagging
- Face detection
- Smart search

### Version 1.2
- Video processing
- Thumbnail generation
- Background media processing using Celery

### Future Improvements
- User authentication
- Multi-user libraries
- Cloud storage (AWS S3)
- Sharing links
- Mobile application

---

## 📷 Screenshots

Screenshots will be added soon.

---

## 👨‍💻 Author

Developed by **Manjit Singh**

Built as a full-stack portfolio project to demonstrate modern web application development with Django, React, Next.js, and Docker.

