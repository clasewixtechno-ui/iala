import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are CodeMind, an elite programming AI assistant built for developers. You are the best coding assistant that exists.

## Your Core Identity
- You are an expert in ALL programming languages, frameworks, tools, and paradigms
- You write clean, efficient, production-ready code
- You explain with clarity and precision
- You proactively warn about bugs, edge cases, security vulnerabilities, and performance issues

## How You Respond
1. **Code First**: Always provide working, complete code — never pseudocode unless explicitly asked
2. **Best Practices**: Apply SOLID, DRY, KISS principles; use idiomatic patterns for each language
3. **Context Aware**: Adapt your style — brief for quick questions, thorough for architectural decisions
4. **Error Analysis**: When debugging, explain the root cause and fix, not just the symptom
5. **Modern Stack**: Default to modern syntax and current best practices (ES2024+, Python 3.12+, etc.)

## Code Quality Standards
- Add concise inline comments for non-obvious logic
- Handle edge cases and errors properly
- Use meaningful variable/function names
- Optimize for readability first, performance second (unless asked)
- Include type annotations when relevant

## Output Format
- Use markdown code blocks with the correct language tag
- For multi-file solutions, clearly label each file
- Always follow code with a brief explanation of key decisions
- If multiple approaches exist, briefly mention tradeoffs

## Specialties
- Algorithms & Data Structures
- System Design & Architecture
- Debugging & Code Review
- Performance Optimization
- Security Best Practices
- Testing & TDD
- DevOps & CI/CD
- All major languages: Python, JavaScript/TypeScript, Rust, Go, Java, C/C++, C#, Swift, Kotlin, Ruby, PHP, and more

Be direct, technical, and precise. The developer's time is valuable.`;

const LANG_COLORS = {
  javascript: "#F7DF1E", typescript: "#3178C6", python: "#3776AB",
  rust: "#CE422B", go: "#00ADD8", java: "#ED8B00", cpp: "#00599C",
  c: "#A8B9CC", csharp: "#239120", swift: "#F05138", kotlin: "#7F52FF",
  ruby: "#CC342D", php: "#777BB4", html: "#E34F26", css: "#1572B6",
  sql: "#336791", bash: "#4EAA25", default: "#A8FF78"
};

function detectLang(code, tag) {
  if (tag) return tag.toLowerCase();
  if (code.includes("def ") && code.includes(":")) return "python";
  if (code.includes("fn ") && code.includes("->")) return "rust";
  if (code.includes("func ") && code.includes(":=")) return "go";
  if (code.includes("console.log") || code.includes("const ") || code.includes("=>")) return "javascript";
  return "code";
}

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);
  const language = detectLang(code, lang);
  const color = LANG_COLORS[language] || LANG_COLORS.default;

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      margin: "12px 0",
      borderRadius: "10px",
      overflow: "hidden",
      border: `1px solid rgba(255,255,255,0.08)`,
      boxShadow: `0 0 20px rgba(0,0,0,0.4)`
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 14px",
        background: "rgba(255,255,255,0.05)",
        borderBottom: `1px solid rgba(255,255,255,0.06)`
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}` }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: color, letterSpacing: "0.05em" }}>
            {language}
          </span>
        </div>
        <button onClick={copy} style={{
          background: copied ? "rgba(168,255,120,0.15)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${copied ? "rgba(168,255,120,0.4)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: "6px", padding: "4px 10px", cursor: "pointer",
          color: copied ? "#A8FF78" : "#888", fontSize: "11px", fontFamily: "monospace",
          transition: "all 0.2s"
        }}>
          {copied ? "✓ copied" : "copy"}
        </button>
      </div>
      <pre style={{
        margin: 0, padding: "16px", overflowX: "auto",
        background: "rgba(0,0,0,0.6)",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: "13px", lineHeight: "1.7", color: "#E8E8E8",
        whiteSpace: "pre-wrap", wordBreak: "break-word"
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function parseMessage(text) {
  const parts = [];
  const regex = /```(\w+)?\n?([\s\S]*?)```/g;
  let last = 0, match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ type: "text", content: text.slice(last, match.index) });
    parts.push({ type: "code", lang: match[1] || "", content: match[2] });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: "text", content: text.slice(last) });
  return parts;
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const parts = isUser ? null : parseMessage(msg.content);

  return (
    <div style={{
      display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: "20px", gap: "10px", alignItems: "flex-start"
    }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: "10px", flexShrink: 0,
          background: "linear-gradient(135deg, #A8FF78, #78FFD6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px", fontWeight: "bold", color: "#0a0a0a",
          boxShadow: "0 0 15px rgba(168,255,120,0.3)"
        }}>⌘</div>
      )}
      <div style={{
        maxWidth: "85%",
        background: isUser
          ? "linear-gradient(135deg, rgba(120,180,255,0.15), rgba(168,120,255,0.15))"
          : "rgba(255,255,255,0.04)",
        border: isUser
          ? "1px solid rgba(120,180,255,0.25)"
          : "1px solid rgba(255,255,255,0.06)",
        borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
        padding: "14px 18px"
      }}>
        {isUser ? (
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#D0D8F0", lineHeight: 1.6 }}>
            {msg.content}
          </span>
        ) : (
          <div>
            {parts.map((p, i) =>
              p.type === "code"
                ? <CodeBlock key={i} code={p.content} lang={p.lang} />
                : <span key={i} style={{
                    fontFamily: "'Inter', sans-serif", fontSize: "14px",
                    color: "#C8D0E0", lineHeight: 1.75, whiteSpace: "pre-wrap",
                    display: "block"
                  }}>{p.content}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  "Implementa un árbol binario de búsqueda en Python",
  "Explica la diferencia entre async/await y Promises",
  "Crea una API REST con Express.js y autenticación JWT",
  "Optimiza este algoritmo de ordenamiento",
  "¿Cómo implemento el patrón Observer en TypeScript?",
  "Escribe tests unitarios con Jest para una función de validación",
];

export default function CodeMind() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model] = useState("claude-sonnet-4-20250514");
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!loading) return;
    const iv = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 400);
    return () => clearInterval(iv);
  }, [loading]);

  const adjustTextarea = () => {
    const t = textareaRef.current;
    if (t) { t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 150) + "px"; }
  };

  const send = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || "").join("") || "Error al obtener respuesta.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages([...newMessages, { role: "assistant", content: "❌ Error de conexión. Intenta de nuevo." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#080C10",
      fontFamily: "'Inter', sans-serif",
      display: "flex", flexDirection: "column",
      backgroundImage: `
        radial-gradient(ellipse at 20% 20%, rgba(168,255,120,0.04) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, rgba(120,180,255,0.04) 0%, transparent 50%)
      `
    }}>
      {/* Header */}
      <div style={{
        padding: "0 24px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
        backdropFilter: "blur(10px)",
        position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: 34, height: 34, borderRadius: "10px",
            background: "linear-gradient(135deg, #A8FF78, #78FFD6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px", fontWeight: "900", color: "#0a0a0a",
            boxShadow: "0 0 20px rgba(168,255,120,0.4)"
          }}>⌘</div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#F0F4FF", letterSpacing: "-0.02em" }}>
              CodeMind
            </div>
            <div style={{ fontSize: "11px", color: "#4A8", letterSpacing: "0.08em" }}>
              AI PROGRAMMING ASSISTANT
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {["JS", "PY", "RS", "GO", "TS"].map(l => (
            <span key={l} style={{
              padding: "3px 8px", borderRadius: "5px", fontSize: "11px",
              fontFamily: "monospace", color: "#666",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.02)"
            }}>{l}</span>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px", maxWidth: 860, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        {messages.length === 0 ? (
          <div style={{ paddingTop: "60px", textAlign: "center" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "20px", margin: "0 auto 24px",
              background: "linear-gradient(135deg, #A8FF78, #78FFD6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "32px", fontWeight: "900", color: "#0a0a0a",
              boxShadow: "0 0 40px rgba(168,255,120,0.3)"
            }}>⌘</div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#F0F4FF", margin: "0 0 10px", letterSpacing: "-0.03em" }}>
              CodeMind
            </h1>
            <p style={{ fontSize: "15px", color: "#556", margin: "0 0 40px" }}>
              Tu asistente de programación de élite — pregunta cualquier cosa sobre código
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", maxWidth: 600, margin: "0 auto", textAlign: "left" }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s)} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px", padding: "12px 14px",
                  color: "#8A9BB0", fontSize: "13px", cursor: "pointer",
                  textAlign: "left", lineHeight: 1.5, transition: "all 0.2s",
                  fontFamily: "inherit"
                }}
                  onMouseEnter={e => { e.target.style.background = "rgba(168,255,120,0.06)"; e.target.style.borderColor = "rgba(168,255,120,0.2)"; e.target.style.color = "#A8FF78"; }}
                  onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.03)"; e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.color = "#8A9BB0"; }}
                >{s}</button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
            {loading && (
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "20px" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "10px", flexShrink: 0,
                  background: "linear-gradient(135deg, #A8FF78, #78FFD6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", fontWeight: "bold", color: "#0a0a0a",
                  boxShadow: "0 0 15px rgba(168,255,120,0.3)"
                }}>⌘</div>
                <div style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "4px 18px 18px 18px",
                  padding: "14px 18px",
                  fontFamily: "monospace", color: "#A8FF78", fontSize: "14px"
                }}>
                  <span style={{ opacity: 0.7 }}>Analizando</span>{dots}
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "16px 24px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(20px)"
      }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} style={{
              background: "none", border: "none", color: "#334", cursor: "pointer",
              fontSize: "12px", fontFamily: "monospace", marginBottom: "8px",
              padding: 0, transition: "color 0.2s"
            }}
              onMouseEnter={e => e.target.style.color = "#A8FF78"}
              onMouseLeave={e => e.target.style.color = "#334"}
            >// nueva sesión</button>
          )}
          <div style={{
            display: "flex", gap: "10px", alignItems: "flex-end",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "14px", padding: "10px 14px",
            boxShadow: "0 0 30px rgba(0,0,0,0.3)",
            transition: "border-color 0.2s"
          }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); adjustTextarea(); }}
              onKeyDown={handleKey}
              placeholder="Pregunta sobre código, pide una función, debug... (Enter para enviar, Shift+Enter para nueva línea)"
              rows={1}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "#D0D8F0", fontSize: "14px", lineHeight: 1.6, resize: "none",
                fontFamily: "'Inter', sans-serif", padding: 0,
                caretColor: "#A8FF78"
              }}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{
                width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
                background: loading || !input.trim()
                  ? "rgba(255,255,255,0.05)"
                  : "linear-gradient(135deg, #A8FF78, #78FFD6)",
                border: "none", cursor: loading || !input.trim() ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px", color: loading || !input.trim() ? "#333" : "#0a0a0a",
                transition: "all 0.2s",
                boxShadow: loading || !input.trim() ? "none" : "0 0 20px rgba(168,255,120,0.4)"
              }}
            >↑</button>
          </div>
          <div style={{ textAlign: "center", marginTop: "8px", fontSize: "11px", color: "#2A3040", fontFamily: "monospace" }}>
            CodeMind · Powered by Claude · Especializado en código
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        ::placeholder { color: #2A3A4A !important; }
      `}</style>
    </div>
  );
}
