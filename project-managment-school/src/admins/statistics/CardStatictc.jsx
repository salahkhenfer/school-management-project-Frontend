import React from "react";

// A modern gradient stat card with an icon
function CardStatictc({ text, value, icon, gradient = "bg-gradient-to-br from-indigo-500 to-indigo-700" }) {
  return (
    <div
      dir="rtl"
      className={`rounded-2xl p-5 text-white shadow-lg ${gradient} flex items-center justify-between transition-transform hover:scale-[1.02]`}
    >
      <div>
        <div className="text-sm font-medium opacity-90 font-['Cairo']">
          {text}
        </div>
        <div className="text-3xl font-bold mt-1 leading-9">{value}</div>
      </div>
      {icon && <div className="text-4xl opacity-80">{icon}</div>}
    </div>
  );
}

export default CardStatictc;
