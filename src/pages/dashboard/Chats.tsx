import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EyeOff, Send, Eye } from "lucide-react";
import { toast } from "sonner";

const conversations = [
  { id: "1", name: "Aanya", last: "Haha okay that's actually a great Sunday.", unread: 2 },
  { id: "2", name: "Rohan", last: "Filter coffee or cappuccino — pick a side.", unread: 0 },
  { id: "3", name: "Meher", last: "Voice memo (0:18)", unread: 0 },
];

const initialMessages = [
  { from: "them", text: "Hey! I loved your Sunday prompt. Mine looks pretty similar — but with way more chai." },
  { from: "me", text: "Chai > coffee is a controversial position to lead with on day one." },
  { from: "them", text: "I'm an honest woman." },
  { from: "me", text: "Respect. So what are you reading right now?" },
];

const Chats = () => {
  const [active, setActive] = useState(conversations[0]);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((m) => [...m, { from: "me", text: input }]);
    setInput("");
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] md:h-screen grid md:grid-cols-[320px_1fr]">
      {/* List */}
      <aside className="border-r border-border/60 bg-gradient-soft overflow-y-auto">
        <div className="p-5 border-b border-border/60">
          <h1 className="font-display text-2xl">Chats</h1>
        </div>
        <ul>
          {conversations.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setActive(c)}
                className={`w-full flex items-center gap-3 p-4 border-b border-border/40 text-left transition-colors ${
                  active.id === c.id ? "bg-card" : "hover:bg-card/50"
                }`}
              >
                <div className="h-11 w-11 rounded-full bg-gradient-romance flex items-center justify-center shrink-0">
                  <EyeOff className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <div className="font-medium">{c.name}</div>
                    {c.unread > 0 && (
                      <span className="h-5 w-5 text-[10px] rounded-full bg-accent text-accent-foreground flex items-center justify-center">{c.unread}</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{c.last}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Thread */}
      <section className="hidden md:flex flex-col bg-background">
        <header className="flex items-center justify-between p-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-romance flex items-center justify-center">
              <EyeOff className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="font-medium">{active.name}</div>
              <div className="text-xs text-muted-foreground">Photos hidden · Online</div>
            </div>
          </div>
          <Button
            variant="soft"
            size="sm"
            className="rounded-full"
            onClick={() => toast.success(`Reveal request sent to ${active.name}.`)}
          >
            <Eye className="h-4 w-4" /> Request reveal
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.from === "me"
                    ? "bg-gradient-romance text-primary-foreground rounded-br-md"
                    : "bg-secondary text-foreground rounded-bl-md"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div className="flex justify-start">
            <div className="px-4 py-2.5 rounded-2xl bg-secondary text-muted-foreground text-xs">
              {active.name} is typing…
            </div>
          </div>
        </div>

        <form onSubmit={send} className="p-4 border-t border-border/60 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write something thoughtful…"
            className="h-12 rounded-full px-5"
          />
          <Button type="submit" variant="hero" size="icon" className="h-12 w-12 rounded-full">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </section>
    </div>
  );
};

export default Chats;
