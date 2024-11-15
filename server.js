const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors")
const app = express();
const PORT = process.env.PORT || 4001;


app.use(cors({
  origin: ['http://localhost:3000',"https://wmit-f.vercel.app"] // 특정 도메인만 허용
}))

const apiUrl = "https://lovely-slug-asaa12-08e720ae.koyeb.app"


// 파일 저장 위치 및 파일 이름 설정
const storage = multer.diskStorage({
    // 파일 저장 디렉토리 설정
    destination: (req, file, cb) => {
      cb(null, "uploads/"); // uploads 폴더에 저장
    },
    // 파일 이름 설정 (현재 시간을 기준으로 고유한 이름 생성)
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // 예: 1632907923000.jpg
    }
  })


  const upload = multer({ storage: storage })

  app.post("/upload", upload.single("image"), (req,res) => {
    if (!req.file){
        return res.statusCode(400).json({ error: "파일이 업로드 되지않음" })
    }
    
    console.log("이미지 파일 업로드  성공 api")

    const imageUrl = `${apiUrl}/uploads/${req.file.filename}`;
    return res.json({ message: "파일 업로드 성공", imageUrl: imageUrl });

  })

    // 최신 이미지 반환 API
  app.get("/home_image", (req, res) => {
    const uploadsDir = path.join(__dirname, "uploads");

    // 업로드 폴더의 파일 목록 가져오기
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            console.log("최신파일 업로드 실패")
            return res.status(500).json({ error: "이미지 파일을 불러오는 데 실패했습니다." });
        }

        // 파일 목록이 없다면
        if (files.length === 0) {
            console.log("최신파일 없음")
            return res.status(404).json({ error: "업로드된 이미지가 없습니다." });
        }

        // 파일 목록을 시간순으로 정렬 (최신 파일이 첫 번째로 오게)
        const latestFile = files.sort((a, b) => {
            return fs.statSync(path.join(uploadsDir, b)).mtime.getTime() - fs.statSync(path.join(uploadsDir, a)).mtime.getTime();
        })[0];

        // 최신 이미지 파일 경로
        const latestFilePath = path.join(uploadsDir, latestFile);
        
       /* // 최신 이미지 정보 반환
        const imageUrl = `${apiUrl}/uploads/${latestFile}`;
        console.log("가장 마지막 파일 보냄")
        return res.json({ image_name: latestFile, image_url: imageUrl, timestamp: fs.statSync(path.join(uploadsDir, latestFile)).mtime.toISOString() });
     });
    });
    */
        // 최신 이미지를 파일로 보내기
        console.log("가장 마지막 파일 보내기:", latestFile);
         res.sendFile(latestFilePath, (err) => {
         if (err) {
            console.error("파일 전송 중 오류 발생:", err);
             return res.status(500).send("파일 전송에 실패했습니다.");
          }
        }) 

    })
  })    






  app.use("/uploads", express.static("uploads"))






app.listen(PORT, () => {
    console.log(`${PORT}에서 실행 중입니다.`);
  })