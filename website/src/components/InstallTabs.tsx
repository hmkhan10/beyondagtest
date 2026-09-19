"use client";

import { useState } from "react";

type Tab = {
  id: string;
  label: string;
  command: string;
};

const tabs: Tab[] = [
  { id: "npm", label: "npm", command: "npm install -g beyondagtest\nbeyondagtest onboard" },
  { id: "curl", label: "curl", command: "curl -fsSL https://beyondagtest.dev/install.sh | bash" },
  { id: "deb", label: ".deb", command: "sudo dpkg -i beyondagtest-latest.deb" },
  { id: "appimage", label: ".AppImage", command: "chmod +x BeyondAgtest-*.AppImage && ./BeyondAgtest-*.AppImage" },
  { id: "exe", label: ".exe", command: "# Download from https://beyondagtest.dev/releases" },
  { id: "dmg", label: ".dmg", command: "# Download from https://beyondagtest.dev/releases" },
];

export default function InstallTabs() {
  const [active, setActive] = useState("npm");
  const [copied, setCopied] = useState(false);

  const activeTab = tabs.find((t) => t.id === active)!;

  const handleCopy = async () => {
    const text = activeTab.command.replace(/^#.*\n?/gm, "").trim();
    if (text) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#0A0A0A] overflow-hidden">
      <div className="flex border-b border-white/10 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-5 py-3 text-sm font-mono whitespace-nowrap transition-colors ${
              active === tab.id
                ? "text-red-400 border-b-2 border-red-500 bg-red-500/5"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="relative p-5">
        <pre className="text-sm text-zinc-300 m-0 border-0 bg-transparent p-0">
          <code>{activeTab.command}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-4 right-4 px-3 py-1.5 text-xs rounded-md bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
