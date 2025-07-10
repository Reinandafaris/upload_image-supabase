import { useState, useEffect } from "react";
import axios from "axios";
import Card from "./components/Card";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  const uploadApiUrl =
    import.meta.env.VITE_UPLOAD_API_URL ||
    "http://localhost:5000/api/upload";
  const imagesApiUrl =
    import.meta.env.VITE_IMAGES_API_URL ||
    "http://localhost:5000/api/images";

  const fetchImages = async () => {
    try {
      const response = await axios.get(imagesApiUrl);
      setImages(response.data);
    } catch (error) {
      console.error("Gagal mengambil gambar:", error);
      setMessage("Gagal memuat galeri gambar.");
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Pilih file terlebih dahulu!");
      return;
    }

    setLoading(true);
    setMessage("Mengupload...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(uploadApiUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage(response.data.message);
      fetchImages();
    } catch (error) {
      const errorMessage = error.response
        ? error.response.data.error
        : error.message;
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
      setFile(null);
      e.target.reset();
    }
  };

  return (
    <div className="container">
      <h1>🚀 Galeri Gambar</h1>
      <p>Upload gambar baru dan lihat semua koleksi di bawah.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload Gambar"}
        </button>
      </form>

      {message && <p className="message">{message}</p>}

      <div className="gallery-section">
        <h2>Koleksi Gambar</h2>
        <div className="image-grid">
          {images.length > 0 ? (
            images.map((image) => (
              <Card key={image.name} imageUrl={image.url} />
            ))
          ) : (
            <p>Belum ada gambar yang diupload.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
