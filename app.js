// the best solution

const express = require("express");
const ffmpeg = require("fluent-ffmpeg");
const multer = require("multer");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.sendFile("./index.html", { root: "." });
});

app.use(express.static("."));

app.post("/upload", upload.array("mp3-files"), (req, res) => {
  const mp3Files = req.files;
  const concatFileName = `concatenated_${Date.now()}.mp3`;

  let concatCommand = ffmpeg();

  mp3Files.forEach((file) => {
    concatCommand = concatCommand.input(file.path);
  });

  concatCommand
    .on("start", (commandLine) => {
      console.log("FFmpeg process started:", commandLine);
    })
    .on("error", (err, stdout, stderr) => {
      console.error("FFmpeg process error:", err);
      console.error("FFmpeg stdout:", stdout);
      console.error("FFmpeg stderr:", stderr);
    })
    .on("end", (stdout, stderr) => {
      console.log("FFmpeg process completed");
      console.log("FFmpeg stdout:", stdout);
      console.log("FFmpeg stderr:", stderr);

      const filePath = path.join(__dirname, concatFileName);
      const fileUrl = `http://localhost:3000/${concatFileName}`;

      res.send(
        `Download the concatenated MP3 file: <a href="${fileUrl}">${fileUrl}</a>`
      );
    })
    .mergeToFile(concatFileName, "./");
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
