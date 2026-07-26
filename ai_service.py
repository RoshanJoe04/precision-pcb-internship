import io
import time
import base64
import torch
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image

app = Flask(__name__)
CORS(app)

# Auto-detect CUDA availability
device = 0 if torch.cuda.is_available() else 'cpu'
print(f"[startup] Device: {'cuda:0' if device == 0 else 'cpu'}", flush=True)

import os
MODEL_PATH = os.environ.get("MODEL_PATH", "runs/detect/train-4/weights/best.pt")
if not os.path.exists(MODEL_PATH):
    # Fallback to local Windows workspace path if relative path isn't found
    MODEL_PATH = r"C:\Users\Roshan S Joe\OneDrive\Desktop\Project\runs\detect\train-4\weights\best.pt"

print(f"[startup] Loading model: {MODEL_PATH}", flush=True)
model = YOLO(MODEL_PATH)
print("[startup] Model loaded. Service ready.", flush=True)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'device': 'cuda:0' if device == 0 else 'cpu',
        'model_loaded': model is not None,
        'model_path': MODEL_PATH
    }), 200

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'success': False, 'error': 'No image file provided'}), 400
        
    start_total_time = time.time()
    try:
        # Read image from request
        file = request.files['image']
        img = Image.open(file).convert("RGB")
        width, height = img.size
        
        # Run inference
        results = model.predict(source=img, conf=0.15, line_width=2, device=device)
        
        # Move tensors to CPU
        local_boxes = results[0].boxes.cpu()
        names = results[0].names
        
        # Extract defect details
        defects = []
        for box in local_boxes:
            cls_id = int(box.cls[0].item())
            conf = float(box.conf[0].item())
            xyxy = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
            
            defects.append({
                'class_id': cls_id,
                'class_name': names.get(cls_id, f"unknown_defect_{cls_id}"),
                'confidence': round(conf, 4),
                'box': [round(coord, 2) for coord in xyxy]
            })
            
        # Extract latency metrics
        speed = results[0].speed  # preprocess, inference, postprocess
        latency_preprocess = speed.get('preprocess', 0.0)
        latency_inference = speed.get('inference', 0.0)
        latency_postprocess = speed.get('postprocess', 0.0)
        
        # Log results
        print(f"[predict] {width}x{height} | {len(defects)} defect(s) | {latency_inference:.1f}ms inference", flush=True)
        
        # Render annotated image
        annotated_matrix = results[0].plot()
        
        # Encode as JPEG
        output_buffer = io.BytesIO()
        pil_img = Image.fromarray(annotated_matrix)
        pil_img.save(output_buffer, format="JPEG")
        
        # Base64 encode for JSON response
        base64_encoded = base64.b64encode(output_buffer.getvalue()).decode('utf-8')
        
        total_time_ms = (time.time() - start_total_time) * 1000
        
        return jsonify({
            'success': True,
            'annotated_image': base64_encoded,
            'defect_count': len(defects),
            'defects': defects,
            'image_size': {
                'width': width,
                'height': height
            },
            'latencies': {
                'preprocess_ms': round(latency_preprocess, 2),
                'inference_ms': round(latency_inference, 2),
                'postprocess_ms': round(latency_postprocess, 2),
                'total_ms': round(total_time_ms, 2)
            }
        })
        
    except Exception as e:
        print(f"[error] {str(e)}", flush=True)
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    # debug=False prevents double model loading on Windows
    app.run(host='0.0.0.0', port=8000, debug=False)