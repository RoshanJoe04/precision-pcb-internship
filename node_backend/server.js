const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// File upload buffer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// MongoDB connection
const MONGO_URI = "mongodb://roshanjoe39_db_user:RoshanProject2026@ac-bgwxojw-shard-00-00.ircts1g.mongodb.net:27017,ac-bgwxojw-shard-00-01.ircts1g.mongodb.net:27017,ac-bgwxojw-shard-00-02.ircts1g.mongodb.net:27017/?ssl=true&replicaSet=atlas-8yuoh8-shard-0&authSource=admin&appName=roshan";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

let isDbConnected = false;
let inMemoryDbFallback = []; // In-memory fallback for offline environments

mongoose.connect(MONGO_URI)
  .then(() => {
      console.log("MongoDB connected.");
      isDbConnected = true;
  })
  .catch(err => {
      console.error("MongoDB connection failed, using in-memory fallback.", err.message);
      isDbConnected = false;
  });

// Scan log schema
const ScanLogSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    filename: String,
    defectsDetected: Number,
    defects: [{
        classId: Number,
        className: String,
        confidence: Number,
        box: [Number] // [x1, y1, x2, y2]
    }],
    inferenceTimeMs: Number
});
const ScanLog = mongoose.model('ScanLog', ScanLogSchema);

// Helper function to return combined or fallback data
async function getLogs() {
    if (isDbConnected) {
        try {
            return await ScanLog.find().sort({ timestamp: -1 }).limit(30);
        } catch (err) {
            console.error("Database query failed, using in-memory logs:", err.message);
        }
    }
    return [...inMemoryDbFallback].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 30);
}

// POST /api/scan — Upload and inspect an image
app.post('/api/scan', upload.single('pcb_image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No image file provided." });
    }

    try {
        // Forward image to AI service
        const form = new FormData();
        form.append('image', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        // Send to inference service
        console.log(`Forwarding '${req.file.originalname}' to AI pipeline...`);
        const pythonResponse = await axios.post(`${AI_SERVICE_URL}/predict`, form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        if (pythonResponse.data.success) {
            const aiData = pythonResponse.data;
            const logPayload = {
                timestamp: new Date(),
                filename: req.file.originalname,
                defectsDetected: aiData.defect_count,
                defects: aiData.defects.map(d => ({
                    classId: d.class_id,
                    className: d.class_name,
                    confidence: d.confidence,
                    box: d.box
                })),
                inferenceTimeMs: aiData.latencies.total_ms
            };

            // C. Save scan log to active database or in-memory fallback
            let savedEntry = null;
            if (isDbConnected) {
                try {
                    savedEntry = await ScanLog.create(logPayload);
                } catch (dbErr) {
                    console.error("Failed to log scan to MongoDB, fallback active:", dbErr.message);
                }
            }
            
            if (!savedEntry) {
                // Generate simulated ObjectId for fallback consistency
                const mockId = new mongoose.Types.ObjectId();
                savedEntry = { _id: mockId, ...logPayload };
                inMemoryDbFallback.unshift(savedEntry);
            }

            // D. Dispatch processed metrics back to React frontend
            return res.json({
                success: true,
                logId: savedEntry._id,
                annotatedImage: aiData.annotated_image,
                defectCount: aiData.defect_count,
                defects: aiData.defects,
                imageSize: aiData.image_size,
                latencies: aiData.latencies
            });
        } else {
            return res.status(500).json({ success: false, error: pythonResponse.data.error });
        }

    } catch (networkError) {
        console.error("Communications failure with Python backend:", networkError.message);
        return res.status(500).json({ success: false, message: "AI microservice pipeline currently unreachable." });
    }
});

// 2. GET route: Retrieve history logs
app.get('/api/logs', async (req, res) => {
    try {
        const logs = await getLogs();
        return res.json({ success: true, logs });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// 3. GET route: Retrieve aggregated statistics dashboard
app.get('/api/stats', async (req, res) => {
    try {
        let totalScans = 0;
        let cleanScans = 0;
        let totalLatency = 0;
        let defectCounts = {
            missing_hole: 0,
            mouse_bite: 0,
            open_circuit: 0,
            short: 0,
            spur: 0,
            spurious_copper: 0
        };

        if (isDbConnected) {
            try {
                totalScans = await ScanLog.countDocuments();
                cleanScans = await ScanLog.countDocuments({ defectsDetected: 0 });
                
                const avgLatencyRes = await ScanLog.aggregate([
                    { $group: { _id: null, avgLatency: { $avg: "$inferenceTimeMs" } } }
                ]);
                totalLatency = avgLatencyRes.length > 0 ? avgLatencyRes[0].avgLatency * totalScans : 0;

                const categoryAggregation = await ScanLog.aggregate([
                    { $unwind: "$defects" },
                    { $group: { _id: "$defects.className", count: { $sum: 1 } } }
                ]);

                categoryAggregation.forEach(cat => {
                    if (defectCounts.hasOwnProperty(cat._id)) {
                        defectCounts[cat._id] = cat.count;
                    }
                });
            } catch (dbErr) {
                console.error("DB aggregation failed, defaulting to in-memory stats calculation:", dbErr.message);
                // Trigger fallback calculations below
                totalScans = 0; 
            }
        }

        // Run client-side calculation if DB is empty, disconnected, or threw errors
        if (totalScans === 0) {
            totalScans = inMemoryDbFallback.length;
            inMemoryDbFallback.forEach(log => {
                if (log.defectsDetected === 0) cleanScans++;
                totalLatency += log.inferenceTimeMs;
                log.defects.forEach(def => {
                    if (defectCounts.hasOwnProperty(def.className)) {
                        defectCounts[def.className]++;
                    }
                });
            });
        }

        const avgLatency = totalScans > 0 ? (totalLatency / totalScans) : 0;
        const yieldRate = totalScans > 0 ? ((cleanScans / totalScans) * 100) : 100;

        return res.json({
            success: true,
            stats: {
                totalScans,
                cleanScans,
                defectiveScans: totalScans - cleanScans,
                yieldRate: round(yieldRate, 2),
                avgLatencyMs: round(avgLatency, 2),
                defectDistribution: defectCounts
            }
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// 4. DELETE route: Clear specific log
app.delete('/api/logs/:id', async (req, res) => {
    const logId = req.params.id;
    try {
        let deleted = false;
        if (isDbConnected) {
            try {
                const resDb = await ScanLog.findByIdAndDelete(logId);
                if (resDb) deleted = true;
            } catch (dbErr) {
                console.error("Database deletion failed:", dbErr.message);
            }
        }
        
        // Always check in-memory list as well
        const initialLen = inMemoryDbFallback.length;
        inMemoryDbFallback = inMemoryDbFallback.filter(log => log._id.toString() !== logId);
        if (inMemoryDbFallback.length < initialLen) deleted = true;

        if (deleted) {
            return res.json({ success: true, message: "System Record erased." });
        } else {
            return res.status(404).json({ success: false, message: "Inspection record not found." });
        }
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// 5. DELETE route: Wipe all logs
app.delete('/api/logs', async (req, res) => {
    try {
        if (isDbConnected) {
            try {
                await ScanLog.deleteMany({});
            } catch (dbErr) {
                console.error("Database purge failed:", dbErr.message);
            }
        }
        inMemoryDbFallback = [];
        return res.json({ success: true, message: "Scan archive database successfully cleared." });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

function round(val, places) {
    const factor = Math.pow(10, places);
    return Math.round(val * factor) / factor;
}

app.listen(5000, () => console.log("MERN Router running actively on Port 5000"));