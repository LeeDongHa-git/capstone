from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import cv2
import numpy as np
from ultralytics import YOLO
import base64
from typing import List, Dict
import io
from PIL import Image

app = FastAPI(title="Parking Lot Detection API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# YOLOv8 모델 로드
model = YOLO('yolov8n.pt')  # nano 버전 사용

# 차량 클래스 ID (COCO 데이터셋 기준)
VEHICLE_CLASSES = [2, 3, 5, 7]  # car, motorcycle, bus, truck


def process_image(image_bytes: bytes) -> Dict:
    """이미지에서 차량을 감지하고 주차 공간을 분석"""
    # 이미지 디코딩
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Invalid image format")
    
    # YOLOv8으로 차량 감지
    results = model(img, conf=0.3)
    
    # 감지된 차량 정보 추출
    vehicles = []
    for result in results:
        boxes = result.boxes
        for box in boxes:
            cls = int(box.cls[0])
            if cls in VEHICLE_CLASSES:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = float(box.conf[0])
                vehicles.append({
                    'bbox': [int(x1), int(y1), int(x2), int(y2)],
                    'confidence': round(conf, 2),
                    'class': cls
                })
    
    # 이미지에 bounding box 그리기
    for vehicle in vehicles:
        x1, y1, x2, y2 = vehicle['bbox']
        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
        label = f"Vehicle {vehicle['confidence']}"
        cv2.putText(img, label, (x1, y1 - 10),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    
    # 이미지를 base64로 인코딩
    _, buffer = cv2.imencode('.jpg', img)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    
    # 간단한 주차면 추정 (이미지 크기 기반)
    # 실제로는 주차장마다 다르지만, MVP에서는 단순 추정
    img_height, img_width = img.shape[:2]
    # 평균 주차 공간 크기로 전체 주차면 수 추정
    estimated_total_spots = max(10, len(vehicles) + 3)  # 최소 10개
    
    vehicle_count = len(vehicles)
    vacant_spots = estimated_total_spots - vehicle_count
    
    return {
        'total_spots': estimated_total_spots,
        'occupied_spots': vehicle_count,
        'vacant_spots': max(0, vacant_spots),
        'vehicles': vehicles,
        'processed_image': img_base64
    }


@app.get("/")
async def root():
    return {"message": "Parking Lot Detection API", "status": "running"}


@app.post("/analyze")
async def analyze_parking(file: UploadFile = File(...)):
    """주차장 이미지 분석 엔드포인트"""
    try:
        # 파일 형식 검증
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Invalid file format. Please upload an image.")
        
        # 이미지 읽기
        image_bytes = await file.read()
        
        # 이미지 처리
        result = process_image(image_bytes)
        
        return JSONResponse(content={
            'success': True,
            'data': result
        })
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
