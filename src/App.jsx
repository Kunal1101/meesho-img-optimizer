import { useState } from "react";

export default function App() {
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);

  // 1️⃣ Upload handler
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProcessing(true);

    // Remove background using API
    const transparentImage = await removeBackground(file);

    // Create Meesho image
    await generateMeeshoImage(transparentImage);

    setProcessing(false);
  };

  // 2️⃣ Background removal (REAL METHOD)
  const removeBackground = async (file) => {
    const formData = new FormData();
    formData.append("image_file", file);
    formData.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": "MkVAByRznH1xbY7yccC34SSD", // ⬅️ add your key
      },
      body: formData,
    });

    const blob = await response.blob();
    const img = new Image();
    img.src = URL.createObjectURL(blob);

    await new Promise((resolve) => (img.onload = resolve));
    return img;
  };

  // 3️⃣ Create Meesho-compliant image
  const generateMeeshoImage = async (productImage) => {
    const canvas = document.createElement("canvas");
    canvas.width = 2000;
    canvas.height = 2000;
    const ctx = canvas.getContext("2d");

    // White background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Meesho-friendly size (product smaller)
    const scale = 0.72; // ~65–70% occupancy
    const drawWidth = productImage.width * scale;
    const drawHeight = productImage.height * scale;

    const x = (canvas.width - drawWidth) / 2;
    const y = (canvas.height - drawHeight) / 2;

    ctx.drawImage(productImage, x, y, drawWidth, drawHeight);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85)
    );

    setPreview({
      url: URL.createObjectURL(blob),
      name: "meesho_optimized.jpg",
    });
  };

  // 4️⃣ Download + refresh
  const downloadImage = () => {
    if (!preview) return;

    const link = document.createElement("a");
    link.href = preview.url;
    link.download = preview.name;
    link.click();

    setTimeout(() => window.location.reload(), 300);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          Meesho Product Image Optimizer
        </h1>
        <p className="text-gray-600 mb-6">
          Upload an image to get a Meesho-ready product image
        </p>

        <div className="bg-white p-6 rounded-2xl shadow">
          <input type="file" accept="image/*" onChange={handleUpload} />

          {processing && (
            <p className="text-sm text-gray-500 mt-2">Processing image…</p>
          )}
        </div>

        {preview && (
          <>
            <div className="mt-8 flex justify-center">
              <img
                src={preview.url}
                alt="Meesho Preview"
                className="rounded-xl border max-w-md"
              />
            </div>

            <div className="flex justify-center">
              <button
                onClick={downloadImage}
                className="mt-6 bg-green-600 text-white px-8 py-3 rounded-xl"
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
