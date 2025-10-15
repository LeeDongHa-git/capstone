# 🅿️ 주차장 빈자리 인식 웹사이트 (MVP)

AI 기반 주차장 이미지 분석 시스템입니다. YOLOv8을 사용하여 주차장 이미지에서 차량을 감지하고 빈자리를 계산합니다.

## 📋 기능

- 이미지 업로드 (JPG, PNG)
- AI 기반 차량 감지 (YOLOv8)
- 주차 통계 표시 (전체/주차중/빈자리)
- 시각적 결과 표시 (Bounding Box)

## 🛠 기술 스택

### Backend
- **FastAPI** - Python 웹 프레임워크
- **YOLOv8** - 차량 감지 AI 모델
- **OpenCV** - 이미지 처리
- **Uvicorn** - ASGI 서버

### Frontend
- **React** - UI 프레임워크
- **TailwindCSS** - 스타일링
- **Lucide React** - 아이콘
- **Axios** - HTTP 클라이언트

## 🚀 설치 및 실행

### 1. Backend 설정

```bash
# backend 디렉토리로 이동
cd backend

# 가상환경 생성 (선택사항)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# 의존성 설치
pip install -r requirements.txt

# 서버 실행
python main.py
```

Backend는 `http://localhost:8000`에서 실행됩니다.

### 2. Frontend 설정

```bash
# frontend 디렉토리로 이동
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

Frontend는 `http://localhost:3000`에서 실행됩니다.

## 📖 사용 방법

1. 웹 브라우저에서 `http://localhost:3000` 접속
2. "클릭하여 업로드" 버튼으로 주차장 이미지 선택
3. "분석하기" 버튼 클릭
4. AI가 이미지를 분석하여 결과 표시:
   - 전체 주차면 수
   - 주차 중인 차량 수
   - 빈자리 수
   - 감지된 차량 위치 (Bounding Box)

## 🔧 API 엔드포인트

### POST /analyze
주차장 이미지를 분석합니다.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (이미지 파일)

**Response:**
```json
{
  "success": true,
  "data": {
    "total_spots": 10,
    "occupied_spots": 7,
    "vacant_spots": 3,
    "vehicles": [...],
    "processed_image": "base64_encoded_image"
  }
}
```

### GET /health
서버 상태를 확인합니다.

## 📝 주의사항

- 첫 실행 시 YOLOv8 모델이 자동으로 다운로드됩니다 (~6MB)
- 분석 속도는 이미지 크기와 차량 수에 따라 달라집니다 (약 2-5초)
- 주차면 수는 현재 단순 추정 방식을 사용합니다 (향후 개선 예정)

## 🔮 향후 개선 계획

- [ ] 실시간 CCTV 스트리밍 분석
- [ ] 자동 주차면 영역 인식
- [ ] 주차장별 설정 저장
- [ ] 관리자 대시보드
- [ ] 히스토리 데이터 저장 및 통계

## 📄 라이선스

MIT License

## 👥 개발자

Capstone Project Team
