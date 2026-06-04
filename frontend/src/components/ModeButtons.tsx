import { Swords, Users, Bot, ChevronRight } from "lucide-react";

interface ModeButtonsProps {
  onPlay: (mode: "ranked" | "friend" | "bot") => void;
  // openAuthModal: () => void;
}

export default function ModeButtons({ onPlay }: ModeButtonsProps) {
  const handleClick = (mode: "ranked" | "friend" | "bot") => {
    // if (mode !== "ranked") return;
    onPlay(mode);
  };

  return (
    <div className="flex w-full flex-col-reverse justify-center gap-4 sm:flex-row">
      <ModeButton
        icon={<Bot size={26} />}
        title="You vs Bot"
        onClick={() => handleClick("bot")}
      />
      <ModeButton
        icon={<Users size={26} />}
        title="You vs Friend"
        onClick={() => handleClick("friend")}
      />
      <ModeButton
        icon={<Swords size={26} />}
        title="You vs Random"
        onClick={() => handleClick("ranked")}
      />
    </div>
  );
}

interface ModeButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}

function ModeButton({ icon, title, onClick }: ModeButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group hover:bg-gold-subtle/20 flex h-14 w-full cursor-pointer items-center justify-start gap-3 rounded-xl border border-(--border-gold) bg-white/5 px-5 backdrop-blur-sm transition-all duration-200 hover:shadow-[0_0_15px_rgba(201,168,76,0.2)] active:translate-y-0"
    >
      <span className="text-primary">{icon}</span>
      <span className="text-sm font-medium tracking-wide text-primary">
        {title}
      </span>
      <ChevronRight
        size={24}
        className="ml-auto text-primary transition-transform duration-150 ease-in group-hover:translate-x-2"
      />
    </button>
  );
}
