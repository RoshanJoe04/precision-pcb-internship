# PrecisionPCB — Automated PCB Defect Detection System

An end-to-end automated optical inspection (AOI) pipeline that uses a custom-trained YOLOv8 model to detect manufacturing defects on printed circuit boards in real time.

Built as a microservices architecture with a React dashboard, Node.js API gateway, Python inference service, and MongoDB for persistence.

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  React Frontend │────▶│  Express Gateway  │────▶│  Flask AI Service   │
│  (Vite, port    │◀────│  (port 5000)      │◀────│  (PyTorch, port     │
│   5173)         │     │                    │     │   8000)             │
└─────────────────┘     └────────┬───────────┘     └─────────────────────┘
                                 │
                        ┌────────▼───────────┐
                        │   MongoDB Atlas    │
                        └────────────────────┘
```

**Frontend** — React 19 + Vite. Interactive SVG overlays, custom SVG charts, tabbed dashboard.  
**Gateway** — Express.js. Handles uploads, stores scan logs, serves aggregated statistics.  
**AI Service** — Flask + Ultralytics YOLOv8. Returns bounding boxes, class labels, confidence scores, and latency metrics.  
**Database** — MongoDB Atlas with in-memory fallback for offline environments.

---

## Defect Classes

The model detects 6 categories of PCB manufacturing defects:

| ID | Class | Description |
|----|-------|-------------|
| 0 | missing_hole | Absent drill holes on pads |
| 1 | mouse_bite | Irregular trace edges reducing conductivity |
| 2 | open_circuit | Broken conductive paths |
| 3 | short | Unintended bridges between traces |
| 4 | spur | Protruding copper protrusions |
| 5 | spurious_copper | Residual copper deposits |

---

## Getting Started

### Docker Compose (recommended)

```bash
docker compose up --build
```

- Dashboard: http://localhost:5173  
- API Gateway: http://localhost:5000  
- AI Service: http://localhost:8000  

### Local Development

**Terminal 1 — AI Service:**
```bash
.venv\Scripts\activate
python ai_service.py
```

**Terminal 2 — API Gateway:**
```bash
cd node_backend
npm install
node server.js
```

**Terminal 3 — Frontend:**
```bash
cd pcb_frontend
npm install
npm run dev
```

---

## API Reference

### `POST /api/scan`
Upload a PCB image for inspection.

**Request:** Multipart form with field `pcb_image`  
**Response:**
```json
{
  "success": true,
  "defectCount": 2,
  "defects": [
    {
      "class_id": 2,
      "class_name": "open_circuit",
      "confidence": 0.94,
      "box": [120.4, 245.1, 150.2, 280.5]
    }
  ],
  "latencies": {
    "inference_ms": 12.7,
    "total_ms": 55.4
  }
}
```

### `GET /api/stats`
Aggregated inspection statistics (yield rate, defect distribution, average latency).

### `GET /api/logs`
Recent 30 scan records.

### `DELETE /api/logs`
Clear all scan history.

### `DELETE /api/logs/:id`
Delete a specific scan record.

---

## Tech Stack

- **ML/CV:** PyTorch, Ultralytics YOLOv8, CUDA
- **Backend:** Node.js, Express, Flask, MongoDB, Mongoose
- **Frontend:** React 19, Vite, Custom SVG Charts
- **DevOps:** Docker, Docker Compose
