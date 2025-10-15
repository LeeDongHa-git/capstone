import React, { useState } from 'react';
import { Upload, Car, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('이미지를 먼저 선택해주세요.');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post(`${API_URL}/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data.data);
    } catch (err) {
      setError(err.response?.data?.detail || '분석 중 오류가 발생했습니다.');
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-blue-600 flex items-center gap-2">
            🅿️ 주차장 빈자리 인식 시스템
          </h1>
          <p className="text-gray-600 mt-2">AI가 주차장 이미지를 분석하여 빈자리를 찾아드립니다</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Upload Section */}
        {!result && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-full max-w-2xl">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition"
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-16 h-16 text-blue-500 mb-4" />
                      <p className="mb-2 text-lg text-gray-700">
                        <span className="font-semibold">클릭하여 업로드</span> 또는 드래그 앤 드롭
                      </p>
                      <p className="text-sm text-gray-500">JPG, PNG 형식 지원</p>
                    </div>
                  )}
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </label>

                {selectedFile && (
                  <div className="mt-6 flex gap-4 justify-center">
                    <button
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-semibold transition"
                    >
                      {analyzing ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          분석 중...
                        </>
                      ) : (
                        <>
                          <Car className="w-5 h-5" />
                          분석하기
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition"
                    >
                      초기화
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Result Section */}
        {result && (
          <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-blue-600 font-semibold text-lg mb-2">전체 주차면</div>
                <div className="text-4xl font-bold text-gray-800">{result.total_spots}</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-red-600 font-semibold text-lg mb-2">주차 중</div>
                <div className="text-4xl font-bold text-gray-800">{result.occupied_spots}</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-green-600 font-semibold text-lg mb-2">빈자리</div>
                <div className="text-4xl font-bold text-green-600">{result.vacant_spots}</div>
              </div>
            </div>

            {/* Processed Image */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                분석 결과
              </h3>
              <img
                src={`data:image/jpeg;base64,${result.processed_image}`}
                alt="Analyzed"
                className="w-full rounded-lg"
              />
              <p className="text-gray-600 mt-4 text-center">
                감지된 차량: {result.vehicles.length}대
              </p>
            </div>

            {/* Vehicle Details */}
            {result.vehicles.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  차량 상세 정보
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.vehicles.map((vehicle, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Car className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold">차량 {index + 1}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        신뢰도: {(vehicle.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
              >
                다른 이미지 분석하기
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>© 2024 주차장 빈자리 인식 시스템 | Powered by YOLOv8 & React</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
