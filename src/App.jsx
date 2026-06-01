import { useState, useEffect } from "react";
import "./App.css";
import { tarotCards } from "./tarotCards";
import { GoogleGenerativeAI } from "@google/generative-ai";

function App() {
  const [question, setQuestion] = useState("");
  const [screen, setScreen] = useState("question"); // question, shuffle, spread, result
  const [selectedCard, setSelectedCard] = useState(null);
  const [isReversed, setIsReversed] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [aiReading, setAiReading] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (screen === "shuffle") {
      const timer = setTimeout(() => {
        setScreen("spread");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  const handleSelectCard = () => {
    const randomIndex = Math.floor(Math.random() * tarotCards.length);
    const card = tarotCards[randomIndex];
    const reversed = Math.random() < 0.5;

    setSelectedCard(card);
    setIsReversed(reversed);
    setScreen("result");
    setIsFlipped(false);
    setAiReading(""); 
  };

  // 🔥 HÀM GỌI AI THẬT XỊN SÒ - ĐÃ FIX MÃ VÀ MODEL CHO BÀ
  const handleGetAiReading = async (card, reversed) => {
    setIsFlipped(true); 
    setIsLoading(true); 

    try {
      // Tui đã bọc cái mã AQ xịn của bà vô dấu nháy kép chuẩn chỉnh rồi nè!
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      const genAI = new GoogleGenerativeAI(apiKey);
      // Dùng đúng model gemini-1.5-flash cho khớp cổng kết nối mới
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      const prompt = `
        Bạn là một người bạn thân thiết chuyên xem bài Tarot, tính cách thẳng thắn, thực tế, nói chuyện sắc sảo nhưng rất thương người xem.
        Hãy giải bài Tarot dựa trên thông tin sau:
        - Câu hỏi của người xem: "${question}"
        - Lá bài bốc trúng: "${card.nameVi} (${card.name})"
        - Chiều của lá bài: ${reversed ? "Chiều Ngược (Reversed)" : "Chiều Xuôi (Upright)"}

        QUY TẮC BẮT BUỘC:
        1. Phải gọi người xem là "bà" và xưng là "tui". Văn phong tự nhiên, như bạn thân đang ngồi nói thẳng vào vấn đề, không vòng vo.
        2. Phải trả lời TRỰC TIẾP và THẲNG THẮN vào câu hỏi (Ví dụ hỏi "ảnh có yêu không" mà ra bài xấu thì phải bảo là "tui nói thẳng là không nhen, tỉnh táo lại đi bà ơi", ra bài tốt thì chúc mừng và phân tích lý do).
        3. Tuyệt đối không dùng gạch đầu dòng, không chia phần kiểu sách vở. Viết thành các đoạn văn tâm sự liền mạch.
        4. Đưa ra lời khuyên thực tế, tỉnh táo để người xem không bị lụy hoặc ảo tưởng.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      setAiReading(text); 
    } catch (error) {
      console.error("Lỗi rồi bà ơi:", error);
      setAiReading("Ủa bà ơi, hình như khóa API có vấn đề hoặc nghẽn mạng rồi, kiểm tra lại giúp tui dứiiiii! 😥");
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="container">
      <h1>🔮 Tarot của tui</h1>

      {screen === "question" && (
        <>
          <p className="subtitle">Bà đang muốn hỏi điều gì?</p>
          <textarea
            placeholder="Nhập câu hỏi của bà ở đây..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button onClick={() => setScreen("shuffle")}>Bắt đầu trải bài</button>
        </>
      )}

      {screen === "shuffle" && (
        <div className="shuffle-screen">
          <h2>✨ Đang xào bài...</h2>
        </div>
      )}

      {screen === "spread" && (
        <>
          <h2>Chọn lá bài mà bà cảm thấy bị thu hút nhất</h2>
          <div className="spread">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="card-back" onClick={handleSelectCard} style={{ cursor: "pointer" }}>✦</div>
            ))}
          </div>
        </>
      )}

      {screen === "result" && selectedCard && (
        <div className="result-screen">
          <h2>Kết quả trải bài của bà</h2>
          <p className="user-question"><strong>Câu hỏi của bà:</strong> {question}</p>

          <div className="card-display-zone">
            <div 
              className={`tarot-card ${isFlipped ? "flipped" : ""}`} 
              onClick={() => !isFlipped && handleGetAiReading(selectedCard, isReversed)}
              style={{
                border: "2px dashed #9b5de5",
                padding: "20px",
                margin: "20px auto",
                width: "200px",
                borderRadius: "10px",
                cursor: isFlipped ? "default" : "pointer",
                transform: isReversed && isFlipped ? "rotate(180deg)" : "none",
                transition: "transform 0.3s ease"
              }}
            >
              {isFlipped ? (
                <div>
                  <h3>{selectedCard.nameVi}</h3>
                  <p>({selectedCard.name})</p>
                  <p>{isReversed ? "🏷️ Chiều ngược" : "☀️ Chiều xuôi"}</p>
                </div>
              ) : (
                <div style={{ fontSize: "24px" }}>🔮 Bấm để lật bài</div>
              )}
            </div>
          </div>

          {isFlipped && (
            <div className="reading-text" style={{ textAlign: "left", marginTop: "20px" }}>
              {isLoading ? (
                <p style={{ textAlign: "center", fontStyle: "italic" }}>✨ AI đang đọc năng lượng và chuẩn bị vả thực tế, đợi tui xíu...</p>
              ) : (
                <>
                  <p style={{ whiteSpace: "pre-line", fontStyle: "italic", lineHeight: "1.6" }}>{aiReading}</p>
                  <button 
                    onClick={() => {
                      setScreen("question");
                      setQuestion("");
                      setSelectedCard(null);
                      setAiReading("");
                    }}
                    style={{ marginTop: "30px", display: "block", width: "100%" }}
                  >
                    Hỏi câu khác nha 🔮
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;