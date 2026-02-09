import { useState } from "react";

/**
 * Resize image BEFORE background removal
 */
const resizeImage = (file, maxSize = 1024) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
    };
  });
};

/**
 * remove.bg API
 */
const removeBackground = async (file) => {
  const formData = new FormData();
  formData.append("image_file", file);
  formData.append("size", "auto");

  const res = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": import.meta.env.VITE_REMOVEBG_API_KEY,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Background removal failed");
  return await res.blob();
};

const App = () => {
  const [fileName, setFileName] = useState("");

  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    setFileName(file.name.replace(/\.[^/.]+$/, ""));
    if (!file) return;

    try {
      setProcessing(true);

      // 1️⃣ Resize image
      const resized = await resizeImage(file);

      // 2️⃣ Remove background
      const transparentBlob = await removeBackground(resized);

      // 3️⃣ Create final image
      const img = new Image();
      img.src = URL.createObjectURL(transparentBlob);

      img.onload = () => {
        const canvas = document.createElement("canvas");

        // ✅ FINAL IMAGE SIZE
        canvas.width = 747;
        canvas.height = 695;

        const ctx = canvas.getContext("2d");

        // White background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 🔥 BIG PRODUCT (85% of canvas)
        const scale = Math.min(
          (canvas.width * 0.9) / img.width,
          (canvas.height * 0.9) / img.height
        );

        const w = img.width * scale;
        const h = img.height * scale;

        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;

        ctx.drawImage(img, x, y, w, h);

        // 🟣 PURPLE BORDER
        ctx.strokeStyle = "#7e22ce";
        ctx.lineWidth = 30;
        ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);

        canvas.toBlob(
          (blob) => {
            setResult(URL.createObjectURL(blob));
            setProcessing(false);
          },
          "image/jpeg",
          0.9
        );
      };
    } catch (err) {
      alert("Error processing image");
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    const a = document.createElement("a");
    a.href = result;
    a.download = `${fileName}_747x695.jpg`;
    a.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Image Optimizer</h1>

        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="mb-4 block w-full text-sm text-gray-600
             file:mr-4 file:py-2 file:px-4
             file:rounded-xl file:border-0
             file:text-sm file:font-semibold
             file:bg-black file:text-white
             hover:file:bg-gray-800 cursor-pointer"
        />

        {processing && (
          <p className="text-sm text-gray-600">Processing image…</p>
        )}

        {result && (
          <>
            <img src={result} alt="Result" className="mt-6 rounded-xl border" />
            <div className="flex justify-center mt-4 gap-3">
              <button
                onClick={downloadImage}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300"
              >
                Download
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-green-600 text-white px-8 py-2 rounded-xl hover:bg-green-700"
              >
                Retry
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
