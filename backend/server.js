require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = process.env.PORT || 5000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "Tidak ada file yang diupload." });
    }

    const file = req.file;
    const fileName = `${Date.now()}-${file.originalname}`;
    const bucketName = "images";

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: "3600",
      });

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    if (!publicUrlData) {
      return res
        .status(500)
        .json({ error: "Gagal mendapatkan URL publik." });
    }

    res.status(200).json({
      message: "File berhasil diupload!",
      url: publicUrlData.publicUrl,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api", (req, res) => {
  res.send("Backend server is running!");
});

app.get("/api/images", async (req, res) => {
  const bucketName = "images";

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list("", {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      throw error;
    }

    const imageUrls = data.map((file) => {
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(file.name);
      return {
        name: file.name,
        url: publicUrlData.publicUrl,
      };
    });

    res.status(200).json(imageUrls);
  } catch (error) {
    console.error("Error listing files:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
