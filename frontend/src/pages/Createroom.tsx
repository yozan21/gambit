import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  Link,
  Hash,
  QrCode,
  ChevronLeft,
  MoveLeft,
} from "lucide-react";
import Navbar from "@/components/ui/NavBar";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { socket, connectSocket } from "@/services/socket";
import { useAppSelector } from "@/hooks/dispatch";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function CreateRoom() {
  usePageTitle("Create Game");

  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteLink = roomCode
    ? `${window.location.origin}/play/friend/join/${roomCode}`
    : null;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for non-secure contexts
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  };

  const copyCode = async () => {
    if (!roomCode) return;
    await copyToClipboard(roomCode);
    toast.success("Code copied on clipboard");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLink = async () => {
    if (!inviteLink) return;
    await copyToClipboard(inviteLink);
    toast.success("Link copied on clipboard");

    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    let cancelled = false;

    const init = async () => {
      const connected = await connectSocket();
      if (!connected || cancelled) return;

      socket.emit("createRoom");
    };

    socket.on("roomCreated", ({ roomCode }) => {
      if (!cancelled) setRoomCode(roomCode);
    });

    socket.on("roomError", ({ message }) => {
      if (!cancelled) setError(message);
    });

    // When opponent joins, game starts — handled in registerSocketListeners via gameJoined
    init();

    return () => {
      cancelled = true;
      socket.off("roomCreated");
      socket.off("roomError");
      socket.emit("cancelRoom");
    };
  }, [user, navigate]);

  if (!roomCode && !error) return <LoadingScreen />;

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
          className="flex flex-col justify-center gap-2 sm:items-center sm:gap-6"
        >
          {/* Header */}
          <div className="relative flex flex-col gap-1 text-center sm:gap-2">
            <button
              onClick={() => navigate("/play/friend")}
              className="absolute -left-2 flex cursor-pointer items-center justify-center text-center text-sm text-muted-foreground transition-colors hover:text-foreground sm:hidden"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Game Created
            </h1>
            <p className="text-sm text-muted-foreground">
              Share the code or link with your friend. Waiting for them to
              join...
            </p>
          </div>

          {error && (
            <div
              className="rounded-sm px-4 py-3 text-sm"
              style={{
                background: "rgba(224,82,82,0.1)",
                border: "1px solid rgba(224,82,82,0.3)",
                color: "var(--danger)",
              }}
            >
              {error}
            </div>
          )}

          {roomCode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-card flex flex-col gap-5 sm:w-fit sm:flex-row sm:items-center"
            >
              <div className="flex flex-col gap-5">
                {/* Room Code */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    <Hash className="h-3 w-3" />
                    Invite Code
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex-1 rounded-sm px-4 py-3 text-center font-mono text-2xl font-bold tracking-[0.3em]"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-gold)",
                        color: "var(--gold)",
                      }}
                    >
                      {roomCode}
                    </div>
                    <button
                      onClick={copyCode}
                      className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-sm transition-all"
                      style={{
                        background: copiedCode
                          ? "rgba(76,175,130,0.15)"
                          : "var(--bg-elevated)",
                        border: `1px solid ${copiedCode ? "rgba(76,175,130,0.4)" : "var(--border-default)"}`,
                        color: copiedCode
                          ? "var(--success)"
                          : "var(--text-muted)",
                      }}
                    >
                      {copiedCode ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="divider" />

                {/* Invite Link */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    <Link className="h-3 w-3" />
                    Invite Link
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex-1 truncate rounded-sm px-3 py-2 text-xs text-muted-foreground"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-default)",
                      }}
                    >
                      {inviteLink}
                    </div>
                    <button
                      onClick={copyLink}
                      className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-sm transition-all"
                      style={{
                        background: copiedLink
                          ? "rgba(76,175,130,0.15)"
                          : "var(--bg-elevated)",
                        border: `1px solid ${copiedLink ? "rgba(76,175,130,0.4)" : "var(--border-default)"}`,
                        color: copiedLink
                          ? "var(--success)"
                          : "var(--text-muted)",
                      }}
                    >
                      {copiedLink ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="divider sm:hidden" />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  <QrCode className="h-3 w-3" />
                  QR Code
                </div>
                <div
                  className="flex justify-center rounded-sm p-3"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-default)",
                  }}
                >
                  <QRCodeSVG
                    className="hidden sm:block"
                    value={inviteLink!}
                    size={180}
                    bgColor="transparent"
                    fgColor="var(--gold)"
                  />
                  <QRCodeSVG
                    className="sm:hidden"
                    value={inviteLink!}
                    size={180}
                    bgColor="transparent"
                    fgColor="var(--foreground)"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Waiting indicator */}
          {roomCode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
            >
              <span
                className="h-2 w-2 animate-pulse rounded-full"
                style={{ background: "var(--gold)" }}
              />
              Waiting for opponent...
            </motion.div>
          )}

          <button
            onClick={() => navigate("/play/friend")}
            className="hidden cursor-pointer items-center justify-center gap-2 text-center text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            <MoveLeft size={16} />
            Back
          </button>
        </motion.div>
      </div>
    </div>
  );
}
