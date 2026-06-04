import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, MoveLeft, QrCode, X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import Navbar from "@/components/ui/NavBar";
import { socket, connectSocket } from "@/services/socket";
import { useAppSelector } from "@/hooks/dispatch";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function JoinRoom() {
  usePageTitle("Join Room");

  const navigate = useNavigate();
  const { code } = useParams<{ code?: string }>();
  const { user } = useAppSelector((state) => state.auth);

  const [inputCode, setInputCode] = useState(code ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const hasAutoJoined = useRef(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = "qr-scanner-container";

  const handleJoin = async (codeToJoin: string) => {
    const trimmed = codeToJoin.trim().toUpperCase();
    if (!trimmed) return;

    setError(null);
    setLoading(true);

    const connected = await connectSocket();
    if (!connected) {
      setError("Failed to connect. Please try again.");
      setLoading(false);
      return;
    }

    socket.emit("joinRoom", { roomCode: trimmed });
  };

  const startScanner = useCallback(async () => {
    try {
      const html5QrCode = new Html5Qrcode(scannerDivId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          // Extract code from URL or use raw text
          const match = decodedText.match(/\/play\/friend\/join\/([A-Z0-9]+)/);
          const extracted = match ? match[1] : decodedText.trim().toUpperCase();
          setInputCode(extracted);
          setScanning(false);
          handleJoin(extracted);
        },
        () => {}, // ignore frame errors
      );
    } catch (err) {
      console.error("Scanner error:", err);
      if (err?.name === "AbortError") return;
      setError("Could not access camera. Please allow camera permissions.");
      setScanning(false);
      setError("Could not access camera. Please allow camera permissions.");
      setScanning(false);
    }
  }, []);

  const stopScanner = async () => {
    if (!scannerRef.current) return;
    try {
      const state = scannerRef.current.getState();
      // 2 = SCANNING, 3 = PAUSED
      if (state === 2 || state === 3) {
        await scannerRef.current.stop();
      }
    } catch {
      // ignore
    } finally {
      scannerRef.current = null;
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    socket.on("roomError", ({ message }) => {
      setError(message);
      setLoading(false);
    });

    if (code && !hasAutoJoined.current) {
      hasAutoJoined.current = true;
      handleJoin(code);
    }

    return () => {
      socket.off("roomError");
      stopScanner();
    };
  }, [user, code, navigate]);

  useEffect(() => {
    if (scanning) {
      startScanner();
    } else {
      stopScanner();
    }
  }, [scanning, startScanner]);

  return (
    <div className="relative flex min-h-screen justify-center overflow-hidden pt-20 sm:items-center sm:pt-0">
      <Navbar />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-6"
        >
          {/* Header */}
          <div className="flex flex-col gap-2 text-center">
            <h1 className="font-display text-3xl font-bold text-foreground">
              Join Game
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter the invite code or scan your friend's QR code
            </p>
          </div>

          <div className="glass-card flex flex-col gap-4">
            {/* Input */}
            <input
              type="text"
              value={inputCode}
              onChange={(e) =>
                setInputCode(e.target.value.toUpperCase().slice(0, 8))
              }
              onKeyDown={(e) => e.key === "Enter" && handleJoin(inputCode)}
              placeholder="ENTER CODE"
              maxLength={8}
              className="w-full rounded-sm px-4 py-3 text-center font-mono text-xl font-bold tracking-[0.3em] transition-all outline-none placeholder:text-muted-foreground/40"
              style={{
                background: "var(--bg-elevated)",
                border: `1px solid ${error ? "var(--danger)" : "var(--border-gold)"}`,
                color: "var(--gold)",
                caretColor: "var(--gold)",
              }}
            />

            {error && (
              <p
                className="text-center text-xs"
                style={{ color: "var(--danger)" }}
              >
                {error}
              </p>
            )}

            {/* QR Scanner */}
            <AnimatePresence>
              {scanning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className="relative overflow-hidden rounded-sm"
                    style={{ border: "1px solid var(--border-gold)" }}
                  >
                    {/* Scanner mounts here */}
                    <div id={scannerDivId} className="w-full" />

                    {/* Gold corner overlays */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div
                        className="h-48 w-48 rounded-sm"
                        style={{
                          boxShadow: "0 0 0 9999px rgba(10,9,8,0.6)",
                          border: "2px solid var(--gold)",
                        }}
                      />
                    </div>

                    <button
                      onClick={() => setScanning(false)}
                      className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                      style={{
                        background: "rgba(10,9,8,0.8)",
                        border: "1px solid var(--border-default)",
                        color: "var(--text-muted)",
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setScanning((prev) => !prev)}
                className="flex items-center justify-center gap-2 rounded-sm px-4 py-3 text-sm font-semibold transition-all"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-muted)",
                }}
              >
                <QrCode className="h-4 w-4" />
                {scanning ? "Cancel" : "Scan QR"}
              </button>

              <button
                onClick={() => handleJoin(inputCode)}
                disabled={loading || inputCode.trim().length === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-sm px-4 py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background:
                    "linear-gradient(135deg, var(--gold-light), var(--gold))",
                  color: "var(--bg-base)",
                }}
              >
                {loading ? (
                  <span className="animate-pulse">Joining...</span>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Join Game
                  </>
                )}
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate("/play/friend")}
            className="flex cursor-pointer items-center justify-center gap-2 text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <MoveLeft size={16} />
            Back
          </button>
        </motion.div>
      </div>
    </div>
  );
}
