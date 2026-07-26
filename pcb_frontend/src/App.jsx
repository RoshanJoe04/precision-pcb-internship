import React, { useState, useEffect, useRef } from 'react';

// Custom inline SVG Icons for zero-dependency high performance
const Icons = {
  Scan: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="4" y1="12" x2="20" y2="12"/></svg>
  ),
  Analytics: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
  ),
  History: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  Upload: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
  ),
  Trash: ({ size = 16 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
  ),
  CheckCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  ),
  AlertTriangle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  ),
  Zap: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  Cpu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>
  ),
  Menu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
  ),
  Close: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  )
};

function App() {
  const [activeTab, setActiveTab] = useState('inspection'); // 'inspection' | 'analytics' | 'history'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [naturalSize, setNaturalSize] = useState({ width: 640, height: 640 });
  
  // Pipeline response data
  const [resultImage, setResultImage] = useState(null);
  const [defects, setDefects] = useState([]);
  const [defectCount, setDefectCount] = useState(0);
  const [latencies, setLatencies] = useState(null);
  
  // App states
  const [loading, setLoading] = useState(false);
  const [selectedDefectIdx, setSelectedDefectIdx] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(null); // null = checking, true/false
  
  // Logs & Analytics Data
  const [consoleLogs, setConsoleLogs] = useState([
    { time: '0.00', tag: 'SYS', message: 'System ready.' }
  ]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [stats, setStats] = useState({
    totalScans: 0,
    cleanScans: 0,
    defectiveScans: 0,
    yieldRate: 100,
    avgLatencyMs: 0,
    defectDistribution: {
      missing_hole: 0,
      mouse_bite: 0,
      open_circuit: 0,
      short: 0,
      spur: 0,
      spurious_copper: 0
    }
  });

  // Refs for auto-scroll
  const consoleEndRef = useRef(null);

  // ── localStorage helpers for offline persistence ──
  const LOCAL_LOGS_KEY = 'pcb_local_logs';

  const getLocalLogs = () => {
    try {
      const raw = localStorage.getItem(LOCAL_LOGS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  };

  const saveLocalLogs = (logs) => {
    try {
      localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(logs));
    } catch { /* storage full — silently fail */ }
  };

  const computeLocalStats = (logs) => {
    const totalScans = logs.length;
    const defectiveScans = logs.filter(l => l.defectsDetected > 0).length;
    const cleanScans = totalScans - defectiveScans;
    const yieldRate = totalScans > 0 ? Math.round((cleanScans / totalScans) * 100) : 100;
    const avgLatencyMs = totalScans > 0
      ? Math.round(logs.reduce((sum, l) => sum + (l.inferenceTimeMs || 0), 0) / totalScans)
      : 0;
    const defectDistribution = {
      missing_hole: 0, mouse_bite: 0, open_circuit: 0,
      short: 0, spur: 0, spurious_copper: 0
    };
    logs.forEach(l => {
      if (l.defects) {
        l.defects.forEach(d => {
          const cls = d.className || d.class_name;
          if (cls && defectDistribution.hasOwnProperty(cls)) {
            defectDistribution[cls]++;
          }
        });
      }
    });
    return { totalScans, cleanScans, defectiveScans, yieldRate, avgLatencyMs, defectDistribution };
  };

  // ── Backend health check ──
  const checkBackendHealth = async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch('http://localhost:5000/api/stats', { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        setBackendOnline(true);
        return true;
      }
      setBackendOnline(false);
      return false;
    } catch {
      setBackendOnline(false);
      return false;
    }
  };

  // ── Initialization ──
  useEffect(() => {
    const init = async () => {
      const online = await checkBackendHealth();
      if (online) {
        fetchHistory();
        fetchStats();
        addLog('SYS', 'Backend connected. Online mode.');
      } else {
        // Load from localStorage
        const localLogs = getLocalLogs();
        setHistoryLogs(localLogs);
        setStats(computeLocalStats(localLogs));
        addLog('SYS', 'Backend offline. Running in local mode (localStorage).', 'err');
      }
    };
    init();

    // Periodic health check every 30s
    const interval = setInterval(async () => {
      const wasOnline = backendOnline;
      const nowOnline = await checkBackendHealth();
      if (!wasOnline && nowOnline) {
        addLog('SYS', 'Backend reconnected! Switching to online mode.', 'ai');
        fetchHistory();
        fetchStats();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs]);

  // Fetch past scan archives (online only)
  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/logs');
      const data = await res.json();
      if (data.success) {
        setHistoryLogs(data.logs);
      }
    } catch (err) {
      // Fallback to local
      setHistoryLogs(getLocalLogs());
    }
  };

  // Fetch analytics aggregations (online only)
  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      // Fallback: compute from local logs
      setStats(computeLocalStats(getLocalLogs()));
    }
  };

  // Add line to custom diagnostic console
  const addLog = (tag, message, type = 'sys') => {
    const elapsed = ((performance.now() - window.performance.timing.navigationStart) / 1000).toFixed(2);
    setConsoleLogs(prev => [...prev, { time: elapsed, tag, message, type }]);
  };

  const handleFileChange = (file) => {
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResultImage(null);
      setDefects([]);
      setDefectCount(0);
      setLatencies(null);
      setSelectedDefectIdx(null);
      
      // Calculate natural image dimensions for interactive overlay scale matching
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        addLog('SYS', `Loaded '${file.name}' (${img.naturalWidth}×${img.naturalHeight}px).`);
      };
    }
  };

  // Drag-and-drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Execute scanning pipeline
  const handleScanSequence = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setSelectedDefectIdx(null);
    setConsoleLogs([]);
    
    addLog('SYS', 'Starting inspection...');
    
    setTimeout(() => {
      addLog('GATE', `Uploading ${selectedFile.name}...`);
    }, 150);

    setTimeout(() => {
      addLog('AI', 'Loading model...');
    }, 350);

    setTimeout(() => {
      addLog('AI', 'Running inference...');
    }, 550);

    const formData = new FormData();
    formData.append('pcb_image', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/api/scan', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        addLog('AI', `Inference finished. Total defects: ${data.defectCount} | Latency: ${data.latencies.inference_ms}ms`, 'ai');
        addLog('DB', 'Results saved.', 'db');
        addLog('SYS', 'Inspection complete.', 'sys');
        
        setResultImage(`data:image/jpeg;base64,${data.annotatedImage}`);
        setDefects(data.defects);
        setDefectCount(data.defectCount);
        setLatencies(data.latencies);

        // Also persist to localStorage as backup
        const localRecord = {
          _id: `local_${Date.now()}`,
          filename: selectedFile.name,
          timestamp: new Date().toISOString(),
          defectsDetected: data.defectCount,
          inferenceTimeMs: data.latencies.inference_ms,
          defects: data.defects.map(d => ({ className: d.class_name, confidence: d.confidence }))
        };
        const updated = [localRecord, ...getLocalLogs()].slice(0, 100);
        saveLocalLogs(updated);
        
        // Refresh stats & logs tabs
        fetchHistory();
        fetchStats();
      } else {
        addLog('SYS', `Scan failed: ${data.error}`, 'err');
      }
    } catch (err) {
      // ── OFFLINE FALLBACK: record the attempt locally ──
      setBackendOnline(false);
      addLog('SYS', 'Backend unreachable — switching to local mode.', 'err');
      addLog('SYS', 'Image loaded. AI inference requires the backend service.', 'err');
      addLog('SYS', 'Recording scan attempt locally (no defect detection).', 'err');

      // Save a "no-result" record to local history
      const localRecord = {
        _id: `local_${Date.now()}`,
        filename: selectedFile.name,
        timestamp: new Date().toISOString(),
        defectsDetected: 0,
        inferenceTimeMs: 0,
        defects: [],
        offlineScan: true
      };
      const updatedLogs = [localRecord, ...getLocalLogs()].slice(0, 100);
      saveLocalLogs(updatedLogs);
      setHistoryLogs(updatedLogs);
      setStats(computeLocalStats(updatedLogs));

      // Show the raw image as the "result" (no annotation)
      setResultImage(previewUrl);
      setDefects([]);
      setDefectCount(0);
      setLatencies({ inference_ms: 0, total_ms: 0 });

      addLog('SYS', 'Scan logged locally. Start the backend to run AI inference.', 'sys');
    } finally {
      setLoading(false);
    }
  };

  // Delete a single scan log entry
  const deleteLog = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this inspection record?")) return;
    
    if (backendOnline && !id.startsWith('local_')) {
      try {
        const res = await fetch(`http://localhost:5000/api/logs/${id}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
          addLog('DB', `Deleted record ${id}.`, 'db');
          fetchHistory();
          fetchStats();
          return;
        }
      } catch (err) {
        // Fall through to local delete
      }
    }
    // Local fallback delete
    const localLogs = getLocalLogs().filter(l => l._id !== id);
    saveLocalLogs(localLogs);
    setHistoryLogs(backendOnline ? historyLogs.filter(l => l._id !== id) : localLogs);
    setStats(computeLocalStats(localLogs));
    addLog('DB', `Deleted record locally.`, 'db');
  };

  // Clear all scan logs
  const clearAllLogs = async () => {
    if (!window.confirm("Delete all inspection history? This cannot be undone.")) return;
    
    if (backendOnline) {
      try {
        const res = await fetch('http://localhost:5000/api/logs', {
          method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
          addLog('DB', 'All history cleared.', 'db');
        }
      } catch (err) {
        addLog('SYS', 'Failed to clear remote history.', 'err');
      }
    }
    // Always clear local too
    saveLocalLogs([]);
    setHistoryLogs([]);
    setStats(computeLocalStats([]));
    addLog('DB', 'All history cleared.', 'db');
  };

  // Clean class labels for front-end rendering
  const formatClassName = (name) => {
    return name.replace('_', ' ');
  };

  return (
    <>
      {/* Header */}
      <header className="dashboard-header">
        <div className="brand-section">
          <div className={`brand-logo-glow ${loading ? 'scanning' : defectCount > 0 ? 'error' : ''}`}></div>
          <div>
            <h1 className="brand-title">Precision<span>PCB</span></h1>
            <p className="brand-subtitle">Automated Quality Inspection</p>
          </div>
        </div>

        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          {mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
        </button>

        <div className="system-status">
          <div className="status-item">
            <span className={`status-dot ${backendOnline ? 'active' : 'inactive'}`}></span>
            <span>{backendOnline === null ? 'API: Checking...' : backendOnline ? 'API: Online' : 'API: Offline'}</span>
          </div>
          <div className="status-item">
            <span className={`status-dot ${backendOnline ? 'active' : 'inactive'}`}></span>
            <span>{backendOnline ? 'Model: Ready' : 'Mode: Local'}</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'inspection' ? 'active' : ''}`}
          onClick={() => setActiveTab('inspection')}
        >
          <Icons.Scan /> Inspect
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <Icons.Analytics /> Analytics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Icons.History /> History
        </button>
      </nav>

      {/* Main Viewport Grid */}
      <main className="dashboard-content">
        
        {/* Tab 1: Inspection Station */}
        {activeTab === 'inspection' && (
          <div className="grid-main">
            {/* Left: Input Viewport */}
            <div className="panel-card" style={{ minHeight: '600px' }}>
              {loading && <div className="scanning-line-animation"></div>}
              
              <div className="panel-header">
                <h3 className="panel-title">
                  Image Viewport
                </h3>
                {latencies && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent)' }}>
                    AI Latency: {latencies.inference_ms}ms
                  </span>
                )}
              </div>

              {!previewUrl ? (
                <div 
                  className={`dropzone ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  <input 
                    type="file" 
                    id="file-upload-input"
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={(e) => handleFileChange(e.target.files[0])}
                  />
                  <label htmlFor="file-upload-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Icons.Upload />
                    <p className="dropzone-text">Drag PCB image here or <span>browse files</span></p>
                    <p className="dropzone-subtext">Supports PNG, JPG, JPEG — recommended 640×640</p>
                  </label>
                </div>
              ) : (
                <div>
                  <div className="viewport-wrapper">
                    {/* Render the image. If scanned, render the annotated; else, show the raw preview */}
                    <img 
                      className="viewport-image"
                      src={resultImage ? resultImage : previewUrl} 
                      alt="Inspection View" 
                    />
                    
                    {/* Draw SVG interactive overlays on top using natural dimension mapping */}
                    {defects.length > 0 && (
                      <svg 
                        className="svg-overlay"
                        viewBox={`0 0 ${naturalSize.width} ${naturalSize.height}`}
                        preserveAspectRatio="none"
                      >
                        {defects.map((def, idx) => {
                          const [x1, y1, x2, y2] = def.box;
                          const width = x2 - x1;
                          const height = y2 - y1;
                          
                          return (
                            <rect 
                              key={idx}
                              x={x1}
                              y={y1}
                              width={width}
                              height={height}
                              className={`defect-rect ${def.class_name} ${selectedDefectIdx === idx ? 'selected' : ''}`}
                              onClick={() => setSelectedDefectIdx(idx)}
                            />
                          );
                        })}
                      </svg>
                    )}
                  </div>

                  <div className="action-row">
                    <button 
                      className="btn btn-primary"
                      onClick={handleScanSequence}
                      disabled={loading}
                    >
                      {loading ? "Analyzing..." : "Run Inspection"}
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setResultImage(null);
                        setDefects([]);
                        setDefectCount(0);
                        setLatencies(null);
                        setSelectedDefectIdx(null);
                        addLog('SYS', 'Image cleared.');
                      }}
                      disabled={loading}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Diagnostic Terminal */}
              <div className="diagnostic-console">
                <div className="console-title">
                  <Icons.Cpu /> System Log
                </div>
                {consoleLogs.map((log, i) => (
                  <div key={i} className="console-line">
                    <span className="console-time">[{log.time}s]</span>
                    <span className={`console-tag ${log.type}`}>[{log.tag}]</span>
                    <span>{log.message}</span>
                  </div>
                ))}
                <div ref={consoleEndRef} />
              </div>
            </div>

            {/* Right: Detection Results */}
            <div className="panel-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="panel-header">
                <h3 className="panel-title">
                  Detection Results
                </h3>
              </div>

              {!resultImage && !loading && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-muted)', minHeight: '300px' }}>
                  <Icons.Zap />
                  <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Upload an image to begin</p>
                </div>
              )}

              {loading && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', minHeight: '300px' }}>
                  <div className="brand-logo-glow scanning" style={{ width: '30px', height: '30px', marginBottom: '1.5rem' }}></div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>Processing image...</p>
                </div>
              )}

              {resultImage && !loading && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  
                  {/* Status Box */}
                  <div className={`result-status-box ${defectCount > 0 ? 'fail' : 'pass'}`}>
                    <div className="status-label">
                      {defectCount > 0 ? "Defects Detected" : "No Defects Found"}
                    </div>
                    <p className="status-detail">
                      {defectCount > 0 
                        ? `Found ${defectCount} defect(s) on this board.`
                        : "Board passed all quality checks."}
                    </p>
                  </div>

                  {/* Defect Cards List */}
                  {defectCount > 0 && (
                    <>
                      <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                        Detected Defects
                      </h4>
                      <div className="defect-list-container">
                        {defects.map((def, idx) => (
                          <div 
                            key={idx}
                            className={`defect-item ${def.class_name} ${selectedDefectIdx === idx ? 'selected' : ''}`}
                            onClick={() => setSelectedDefectIdx(idx)}
                          >
                            <div>
                              <div className="defect-name">{formatClassName(def.class_name)}</div>
                              <div className="defect-meta">
                                Coordinate Box: [{def.box.join(', ')}]
                              </div>
                            </div>
                            <div className="defect-conf-badge">
                              {(def.confidence * 100).toFixed(1)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Clean State */}
                  {defectCount === 0 && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--color-success)' }}>
                      <Icons.CheckCircle />
                      <h4 style={{ marginTop: '1rem', fontWeight: '600' }}>Board Passed</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', maxWidth: '280px', marginTop: '0.25rem' }}>
                        All regions passed inspection. No defects found.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Analytics */}
        {activeTab === 'analytics' && (
          <div>
            {/* KPI Metrics */}
            <div className="kpi-row">
              <div className="kpi-card system">
                <div>
                  <span className="kpi-lbl">Total Scanned</span>
                  <div className="kpi-val">{stats.totalScans}</div>
                </div>
                <div className="kpi-icon-well">
                  <Icons.History />
                </div>
              </div>
              <div className="kpi-card defects">
                <div>
                  <span className="kpi-lbl">Defective Boards</span>
                  <div className="kpi-val">{stats.defectiveScans}</div>
                </div>
                <div className="kpi-icon-well">
                  <Icons.AlertTriangle />
                </div>
              </div>
              <div className="kpi-card yield">
                <div>
                  <span className="kpi-lbl">Yield Rate</span>
                  <div className="kpi-val">{stats.yieldRate}%</div>
                </div>
                <div className="kpi-icon-well">
                  <Icons.CheckCircle />
                </div>
              </div>
              <div className="kpi-card latency">
                <div>
                  <span className="kpi-lbl">Avg Latency</span>
                  <div className="kpi-val">{stats.avgLatencyMs}ms</div>
                </div>
                <div className="kpi-icon-well">
                  <Icons.Zap />
                </div>
              </div>
            </div>

            {/* Custom Responsive SVG Charts */}
            <div className="chart-container">
              
              {/* Chart 1: Defect Frequency Bar Chart */}
              <div className="chart-card">
                <h3 className="chart-title">
                  Defect Distribution by Category
                </h3>
                <div className="chart-svg-wrapper">
                  {stats.totalScans === 0 ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-muted)', fontSize: '0.85rem' }}>
                      No data available yet.
                    </div>
                  ) : (
                    <ResponsiveBarChart data={stats.defectDistribution} />
                  )}
                </div>
              </div>

              {/* Chart 2: Defect History Timeline Area Chart */}
              <div className="chart-card">
                <h3 className="chart-title">
                  Inspection Activity &amp; Latency Timeline
                </h3>
                <div className="chart-svg-wrapper">
                  {historyLogs.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-muted)', fontSize: '0.85rem' }}>
                      No inspection history yet. Run an inspection to see data here.
                    </div>
                  ) : (
                    <ResponsiveAreaChart logs={historyLogs} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: History */}
        {activeTab === 'history' && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">
                Inspection History
              </h3>
              {historyLogs.length > 0 && (
                <button 
                  className="btn btn-danger" 
                  style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                  onClick={clearAllLogs}
                >
                  <Icons.Trash size={14} /> Clear All
                </button>
              )}
            </div>

            {historyLogs.length === 0 ? (
              <div className="empty-state">
                <Icons.History />
                <p className="empty-state-text">No inspection history yet.</p>
                <button className="btn btn-primary" style={{ display: 'inline-flex', width: 'auto', marginTop: '0.5rem' }} onClick={() => setActiveTab('inspection')}>
                  Go to Inspect
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Filename</th>
                      <th>Latency</th>
                      <th>Defect Count</th>
                      <th>Verdict</th>
                      <th style={{ width: '50px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyLogs.map((log) => (
                      <HistoryTableRow 
                        key={log._id} 
                        log={log} 
                        onDelete={(e) => deleteLog(log._id, e)} 
                        formatClassName={formatClassName}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}

// Sub-component: Expandable History Table Row
function HistoryTableRow({ log, onDelete, formatClassName }) {
  const [expanded, setExpanded] = useState(false);
  const formattedDate = new Date(log.timestamp).toLocaleString();

  return (
    <>
      <tr className="expandable-row" onClick={() => setExpanded(!expanded)}>
        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{formattedDate}</td>
        <td style={{ fontWeight: '500' }}>{log.filename}</td>
        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{log.inferenceTimeMs}ms</td>
        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{log.defectsDetected}</td>
        <td>
          <span className={`history-badge ${log.defectsDetected === 0 ? 'clean' : 'defective'}`}>
            {log.defectsDetected === 0 ? 'PASS' : 'FAIL'}
          </span>
        </td>
        <td>
          <button className="history-delete-btn" onClick={onDelete} title="Delete Record">
            <Icons.Trash />
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="detail-row">
          <td colSpan="6">
            <div className="detail-content">
              <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>
                Defect Details
              </h5>
              {log.defects && log.defects.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {log.defects.map((def, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        background: 'var(--bg-surface)', 
                        boxShadow: '3px 3px 6px rgb(163,177,198,0.5), -3px -3px 6px rgba(255,255,255,0.4)', 
                        padding: '0.4rem 0.8rem', 
                        borderRadius: '8px',
                        fontSize: '0.75rem'
                      }}
                    >
                      <strong style={{ textTransform: 'capitalize', color: 'var(--accent)' }}>
                        {formatClassName(def.className)}
                      </strong> 
                      <span style={{ color: 'var(--fg-muted)', marginLeft: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                        (Conf: {(def.confidence * 100).toFixed(0)}%)
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>
                  ✓ No defects recorded.
                </p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// Sub-component: Responsive SVG Bar Chart
function ResponsiveBarChart({ data }) {
  const categories = Object.keys(data);
  const values = Object.values(data);
  const maxVal = Math.max(...values, 1);
  
  // Chart dimensions in viewBox space
  const width = 500;
  const height = 240;
  const paddingLeft = 120;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 30;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  
  // Custom class color maps
  const colorMap = {
    missing_hole: '#b45309',
    mouse_bite: '#92400e',
    open_circuit: '#dc2626',
    short: '#b91c1c',
    spur: '#7c3aed',
    spurious_copper: '#2563eb'
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
        const xPos = paddingLeft + (chartWidth * ratio);
        const gridVal = Math.round(maxVal * ratio);
        return (
          <g key={idx}>
            <line 
              x1={xPos} 
              y1={paddingTop} 
              x2={xPos} 
              y2={height - paddingBottom} 
              stroke="rgba(163,177,198,0.3)" 
              strokeDasharray="2,2"
            />
            <text 
              x={xPos} 
              y={height - paddingBottom + 15} 
              fill="var(--fg-muted)" 
              fontSize="9" 
              fontFamily="var(--font-mono)"
              textAnchor="middle"
            >
              {gridVal}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {categories.map((cat, idx) => {
        const barHeight = 18;
        const gap = 12;
        const yPos = paddingTop + idx * (barHeight + gap) + 4;
        const count = data[cat] || 0;
        const barWidth = count > 0 ? (count / maxVal) * chartWidth : 2;
        const barColor = colorMap[cat] || 'var(--fg-muted)';
        
        return (
          <g key={idx}>
            {/* Category text label */}
            <text 
              x={paddingLeft - 10} 
              y={yPos + 12} 
              fill="var(--fg-primary)" 
              fontSize="9" 
              fontFamily="var(--font-mono)"
              textAnchor="end"
              style={{ textTransform: 'capitalize' }}
            >
              {cat.replace('_', ' ')}
            </text>
            
            {/* Background bar slot */}
            <rect 
              x={paddingLeft} 
              y={yPos} 
              width={chartWidth} 
              height={barHeight} 
              fill="rgba(163,177,198,0.25)"
              rx="2"
            />
            
            {/* Value Bar */}
            <rect 
              x={paddingLeft} 
              y={yPos} 
              width={barWidth} 
              height={barHeight} 
              fill={barColor}
              opacity="0.85"
              rx="2"
              style={{ transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />

            {/* Value Text indicator */}
            {count > 0 && (
              <text 
                x={paddingLeft + barWidth + 6} 
                y={yPos + 12} 
                fill="var(--fg-primary)" 
                fontSize="9" 
                fontFamily="var(--font-mono)"
                fontWeight="bold"
              >
                {count}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// Sub-component: Responsive SVG Area Chart
function ResponsiveAreaChart({ logs }) {
  // Take last 12 scans and reverse to chronological order
  const displayLogs = [...logs].slice(0, 12).reverse();
  const maxDefects = Math.max(...displayLogs.map(l => l.defectsDetected), 3);
  
  // Dimensions
  const width = 500;
  const height = 240;
  const paddingLeft = 35;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  
  const points = displayLogs.map((log, idx) => {
    const x = paddingLeft + (idx / (displayLogs.length - 1 || 1)) * chartWidth;
    const y = height - paddingBottom - (log.defectsDetected / maxDefects) * chartHeight;
    return { x, y, val: log.defectsDetected, time: log.inferenceTimeMs };
  });

  // Assemble path nodes for SVG curves
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
    : '';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0"/>
        </linearGradient>
      </defs>

      {/* Grid Lines Y-axis */}
      {[0, 0.5, 1].map((ratio, idx) => {
        const yPos = height - paddingBottom - (chartHeight * ratio);
        const yVal = Math.round(maxDefects * ratio);
        return (
          <g key={idx}>
            <line 
              x1={paddingLeft} 
              y1={yPos} 
              x2={width - paddingRight} 
              y2={yPos} 
              stroke="rgba(163,177,198,0.3)" 
              strokeWidth="1"
            />
            <text 
              x={paddingLeft - 8} 
              y={yPos + 3} 
              fill="var(--fg-muted)" 
              fontSize="8" 
              fontFamily="var(--font-mono)"
              textAnchor="end"
            >
              {yVal}
            </text>
          </g>
        );
      })}

      {/* Area filled curve */}
      {areaPath && (
        <path d={areaPath} fill="url(#areaGradient)" style={{ transition: 'd 0.5s ease' }} />
      )}

      {/* Line path stroke */}
      {linePath && (
        <path 
          d={linePath} 
          fill="none" 
          stroke="var(--accent)" 
          strokeWidth="2"
          style={{ transition: 'd 0.5s ease' }}
        />
      )}

      {/* Interactive Node Dots */}
      {points.map((p, idx) => (
        <g key={idx}>
          <circle 
            cx={p.x} 
            cy={p.y} 
            r="4" 
            fill="var(--bg-surface)" 
            stroke={p.val > 0 ? "var(--color-danger)" : "var(--color-success)"}
            strokeWidth="2.5"
          />
          {/* Label under point */}
          <text 
            x={p.x} 
            y={height - paddingBottom + 14} 
            fill="var(--fg-muted)" 
            fontSize="8" 
            fontFamily="var(--font-mono)"
            textAnchor="middle"
            transform={`rotate(-35, ${p.x}, ${height - paddingBottom + 12})`}
          >
            {idx + 1}
          </text>
        </g>
      ))}

      {/* Horizontal Axis title */}
      <text 
        x={paddingLeft + chartWidth / 2} 
        y={height - 5} 
        fill="var(--fg-muted)" 
        fontSize="9" 
        fontFamily="var(--font-body)"
        textAnchor="middle"
      >
        Sequence of Last {displayLogs.length} Inspections (Chronological)
      </text>
    </svg>
  );
}

export default App;