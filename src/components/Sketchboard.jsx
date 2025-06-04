"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Plus, Palette, Eraser, RotateCcw } from "lucide-react";
import DrawingBoard from "./DrawingBoard";
import Image from "next/image";
const Sketchboard = () => {
  const [sketches, setSketches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState(null);
  const [userName, setUserName] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#3b82f6");
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState("brush");

  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  useEffect(() => {
    async function fetchSketches() {
      try {
        const res = await fetch("/api/sketches");
        const data = await res.json();
        setSketches(Array.isArray(data) ? data : []);
      } catch (err) {
        setSketches([]);
      }
    }
    fetchSketches();
  }, []);

  // Initialize canvas only when modal opens
  useEffect(() => {
    if (isModalOpen && canvasRef.current) {
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
  }, [isModalOpen]); // Only depend on isModalOpen

  // Update brush settings without clearing canvas
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = brushColor;
      contextRef.current.lineWidth = brushSize;
      contextRef.current.lineCap = "round";
    }
  }, [brushColor, brushSize]);

  // Get coordinates for both mouse and touch events
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    if (e.touches) {
      // Touch event
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      // Mouse event
      return {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      };
    }
  };

  const startDrawing = (e) => {
    e.preventDefault(); // Prevent scrolling on mobile
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
    e.preventDefault(); // Prevent scrolling on mobile

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

  const handleSaveSketch = (sketch) => {
    setSketches((prev) => [sketch, ...prev]);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFEDCF] to-[#FFEDCF] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-5 ">
          <div className="flex items-center justify-center gap-2">
            <Image
              src="/logo.webp"
              alt="Logo"
              width={100}
              height={100}
              className="mb-2"
            />
            <h1 className="text-4xl font-bold text-[#51252C] mb-4">
              Creative Sketchboard
            </h1>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className=" bg-[#F16437] hover:bg-[#E55B5C] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:rounded-2xl  hover:scale-105   text-lg shadow-lg hover:shadow-xl transform  flex items-center gap-2 mx-auto cursor-pointer"
          >
            <Plus size={24} />
            Add Your Sketch
          </button>
          <p className="text-xl text-[#51252C] mt-4">
            Leave your mark! Draw something
          </p>
        </div>

        {/* Sketches Board - Random Positioning */}
        <div className="relative min-h-[800px] bg-white/30 rounded-2xl backdrop-blur-sm border-10 border-[#51252C]/30 p-8 shadow-xl ">
          {Array.isArray(sketches) && sketches.length > 0 ? (
            sketches.map((sketch, index) => {
              // Generate consistent random values based on sketch ID
              const seed1 = Math.abs(Math.sin(sketch.id * 12345) * 10000);
              const seed2 = Math.abs(Math.sin(sketch.id * 67890) * 10000);
              const seed3 = Math.abs(Math.sin(sketch.id * 54321) * 10000);

              const x = (seed1 % 60) + 5; // 5% to 65% from left
              const y = (seed2 % 50) + 5; // 5% to 55% from top
              const rotation = (seed3 % 30) - 15; // -15° to +15°
              const scale = 0.9 + ((seed1 * 7) % 20) / 100; // 0.9 to 1.1 scale

              return (
                <div
                  key={sketch.id}
                  className="absolute bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-4 border-2 border-gray-100 cursor-pointer"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: `rotate(${rotation}deg) scale(${scale})`,
                    transformOrigin: "center center",
                    width: "140px",
                    zIndex: 10 + index,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = `rotate(0deg) scale(1.1)`;
                    e.currentTarget.style.zIndex = "100";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = `rotate(${rotation}deg) scale(${scale})`;
                    e.currentTarget.style.zIndex = 10 + index;
                  }}
                >
                  <div className="aspect-square bg-gray-50 rounded-lg mb-2 flex items-center justify-center border-2 border-dashed border-gray-200">
                    {sketch.drawing ? (
                      <Image
                        src={sketch.drawing}
                        alt={`Sketch by ${sketch.name}`}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : null}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-700 truncate">
                      {sketch.name}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-400">No sketches yet.</div>
          )}
        </div>

        {/* Modal */}
        <DrawingBoard
          isOpen={isModalOpen}
          onSave={handleSaveSketch}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default Sketchboard;
