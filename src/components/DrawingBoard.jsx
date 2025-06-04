import React, { useRef, useState, useEffect } from "react";
import { X, Palette, Eraser, RotateCcw } from "lucide-react";

const colors = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];

const DrawingBoard = ({ isOpen, onSave, onCancel }) => {
  const [userName, setUserName] = useState("");
  const [brushColor, setBrushColor] = useState("#3b82f6");
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState("brush");
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 300;
      canvas.height = 300;
      const context = canvas.getContext("2d");
      context.scale(1, 1);
      context.lineCap = "round";
      context.strokeStyle = brushColor;
      context.lineWidth = brushSize;
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
      contextRef.current = context;
    }
  }, [isOpen]);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = brushColor;
      contextRef.current.lineWidth = brushSize;
      contextRef.current.lineCap = "round";
    }
  }, [brushColor, brushSize]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      };
    }
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const finishDrawing = (e) => {
    if (e) e.preventDefault();
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    if (tool === "brush") {
      contextRef.current.globalCompositeOperation = "source-over";
      contextRef.current.strokeStyle = brushColor;
      contextRef.current.lineWidth = brushSize;
    } else if (tool === "eraser") {
      contextRef.current.globalCompositeOperation = "destination-out";
      contextRef.current.lineWidth = brushSize * 2;
    }
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = async () => {
    if (!userName.trim()) {
      alert("Please enter your name!");
      return;
    }
    setLoading(true);
    try {
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL();
      const res = await fetch("/api/sketches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          drawing: dataURL,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onSave(data);
        setUserName("");
      } else {
        alert(data.error || "Failed to save sketch");
      }
    } catch (err) {
      alert("Failed to save sketch");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm  bg-opacity-10 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Create Your Sketch
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>
        {/* Drawing Tools */}
        <div className="mb-4">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setTool("brush")}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                tool === "brush"
                  ? "bg-[#F16437] text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              <Palette size={20} className="cursor-pointer" />
            </button>
            <button
              onClick={() => setTool("eraser")}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                tool === "eraser"
                  ? "bg-[#F16437] text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              <Eraser size={20} className="cursor-pointer" />
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              <RotateCcw size={20} className="cursor-pointer" />
            </button>
          </div>
          {/* Color Palette */}
          <div className="flex gap-2 mb-3">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setBrushColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                  brushColor === color
                    ? "border-gray-800 scale-110"
                    : "border-gray-300"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          {/* Brush Size */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brush Size: {brushSize}px
            </label>
            <input
              type="range"
              min="1"
              max="25"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-full cursor-pointer "
            />
          </div>
        </div>
        {/* Canvas */}
        <div className="border-2 border-gray-300 rounded-lg mb-4 bg-white">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={finishDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={finishDrawing}
            onTouchMove={draw}
            className="w-full h-full cursor-crosshair rounded-lg touch-none"
            style={{ maxWidth: "300px", maxHeight: "300px" }}
          />
        </div>
        {/* Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E55B5C] focus:border-transparent outline-none text-gray-700"
          />
        </div>
        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-gradient-to-r bg-[#F16437] hover:bg-[#E55B5C] text-white font-medium  rounded-lg transition-all duration-300 hover:rounded-2xl  hover:scale-105   text-lg shadow-lg hover:shadow-xl transform  flex items-center gap-2 mx-auto cursor-pointer justify-center"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Sketch"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawingBoard;
