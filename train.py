from ultralytics import YOLO

if __name__ == '__main__':
    print("Waking up the RTX 4060 core...")
    
    # 1. Load the pre-trained base model
    model = YOLO("yolov8n.pt")

    # 2. Train directly on your clean PKU dataset
    model.train(
        data=r"C:\Users\Roshan S Joe\OneDrive\Desktop\Project\pcb.yaml", 
        epochs=50, 
        imgsz=640,
        device=0,      # Locks execution onto your RTX 4060 GPU
        workers=0,     # Bypasses Windows multiprocessing/shared event crashes
        batch=16       # Optimized batch sizing for stable laptop VRAM
    )