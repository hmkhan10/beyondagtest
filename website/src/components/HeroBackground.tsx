export default function HeroBackground() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(220,38,38,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {[200, 340, 480, 620, 760].map((size, i) => (
        <div
          key={size}
          className="absolute rounded-full border border-red-500/[0.12]"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            animation: `pulseRing ${4 + i * 0.3}s ease-in-out infinite ${i * 0.4}s`,
          }}
        />
      ))}

      <div
        className="absolute top-0 h-full w-[2px]"
        style={{
          background: "linear-gradient(180deg, transparent, #dc2626, transparent)",
          boxShadow: "0 0 20px 4px rgba(220,38,38,0.4)",
          animation: "scanLine 4s ease-in-out infinite",
        }}
      />

      <div
        className="absolute rounded-full"
        style={{
          width: "300px",
          height: "300px",
          background: "#dc2626",
          filter: "blur(100px)",
          top: "20%",
          left: "30%",
          animation: "glowPulse 3s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: "200px",
          height: "200px",
          background: "#991b1b",
          filter: "blur(80px)",
          bottom: "20%",
          right: "25%",
          animation: "glowPulse 3s ease-in-out infinite 1.5s",
        }}
      />

      <div
        className="absolute"
        style={{
          top: "50%",
          left: "50%",
          width: "140px",
          height: "140px",
          transform: "translate(-50%, -50%)",
          animation: "rotateCross 20s linear infinite",
        }}
      >
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-red-500/10 -translate-x-1/2" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-red-500/10 -translate-y-1/2" />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-red-500/30"
        />
      </div>

      <div
        className="absolute rounded-full border border-dashed border-red-500/10"
        style={{
          width: "100px",
          height: "100px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          animation: "rotateCross 15s linear infinite reverse",
        }}
      />
    </div>
  );
}
