import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function App() {
  const [image, setImage] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [processing, setProcessing] = useState(false);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => setImage(img);
    img.src = URL.createObjectURL(file);
  };

  const generateImages = async () => {
    if (!image) return;

    setProcessing(true);

    const canvas = document.createElement("canvas");
    canvas.width = 2000;
    canvas.height = 2000;
    const ctx = canvas.getContext("2d");

    // Pure white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Fixed scale (20% reduction → perfectly within 18–22%)
    const scale = 0.8;

    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;

    // Perfect center
    const x = (canvas.width - drawWidth) / 2;
    const y = (canvas.height - drawHeight) / 2;

    ctx.drawImage(image, x, y, drawWidth, drawHeight);

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
  };
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          Meesho Product Image Optimizer
        </h1>
        <p className="text-gray-600 mb-6">
          Upload one product image and generate 10–20 Meesho-compliant images
        </p>

        <div className="bg-white p-6 rounded-2xl shadow">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="mb-4 cursor-pointer"
          />

          <button
            onClick={generateImages}
            disabled={!image || processing}
            className="bg-black text-white px-6 py-2 rounded-xl disabled:opacity-50 cursor-pointer"
          >
            {processing ? "Processing..." : "Generate Images"}
          </button>
        </div>

        {previews.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {previews.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt="preview"
                  className="rounded-xl border"
                />
              ))}
            </div>

            <button
              onClick={downloadImage}
              className="mt-6 bg-green-600 text-white px-8 py-3 rounded-xl"
            >
              Download Image
            </button>
          </>
        )}
      </div>
    </div>
  );
}
