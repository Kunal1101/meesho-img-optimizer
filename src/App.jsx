import { useState } from "react";

export default function App() {
  const [previews, setPreviews] = useState([]);
  const [processing, setProcessing] = useState(false);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => generateSingleImage(img);
    img.src = URL.createObjectURL(file);
  };

  const generateSingleImage = async (sourceImage) => {
    setProcessing(true);

    const canvas = document.createElement("canvas");
    canvas.width = 2000;
    canvas.height = 2000;
    const ctx = canvas.getContext("2d");

    // Pure white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Meesho-friendly scale (product looks smaller)
    const scale = 0.75; // ~65–70% occupancy
    const drawWidth = sourceImage.width * scale;
    const drawHeight = sourceImage.height * scale;

    const x = (canvas.width - drawWidth) / 2;
    const y = (canvas.height - drawHeight) / 2;

    ctx.drawImage(sourceImage, x, y, drawWidth, drawHeight);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85)
    );

    setPreviews([
      {
        url: URL.createObjectURL(blob),
        blob,
        name: "meesho_optimized.jpg",
      },
    ]);

    setProcessing(false);
  };

  const downloadImage = () => {
    if (!previews.length) return;

    const link = document.createElement("a");
    link.href = previews[0].url;
    link.download = previews[0].name;
    link.click();

    // Refresh app after download
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          Meesho Product Image Optimizer
        </h1>
        <p className="text-gray-600 mb-6">
          Upload an image to instantly get a Meesho-ready product image
        </p>

        <div className="bg-white p-6 rounded-2xl shadow">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="mb-4 cursor-pointer"
          />

          {processing && (
            <p className="text-sm text-gray-500">Processing image…</p>
          )}
        </div>

        {previews.length > 0 && (
          <>
            <div className="mt-8 flex justify-center">
              <img
                src={previews[0].url}
                alt="Optimized Preview"
                className="rounded-xl border max-w-md"
              />
            </div>

            <div className="flex justify-center">
              <button
                onClick={downloadImage}
                className="mt-6 bg-green-600 text-white px-8 py-3 rounded-xl cursor-pointer"
              >
                Download Image
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
