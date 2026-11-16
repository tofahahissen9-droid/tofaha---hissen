import React from 'react';
import { WuduStepId } from '../../types/game';

interface WuduStepIllustrationProps {
  stepId: WuduStepId;
  className?: string;
}

export const WuduStepIllustration: React.FC<WuduStepIllustrationProps> = ({
  stepId,
  className = 'w-full h-56',
}) => {
  const highlight = (active: boolean) =>
    active ? '#38BDF8' : 'transparent';

  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-b from-sky-50 via-cyan-50/60 to-emerald-50/50 border border-sky-200 overflow-hidden p-3 ${className}`}
    >
      <svg
        viewBox="0 0 260 220"
        className="w-full h-full max-w-[260px]"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="waterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="thobeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FAF7EE" />
            <stop offset="100%" stopColor="#E7E0CC" />
          </linearGradient>
          <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5C9A6" />
            <stop offset="100%" stopColor="#E6AE84" />
          </linearGradient>
        </defs>

        {/* Oasis tile ground */}
        <ellipse cx="130" cy="204" rx="88" ry="12" fill="#BAE6FD" opacity="0.6" />

        {/* Stylized Adam figure for clear limb highlighting */}
        {/* Kufi cap */}
        <path
          d="M104 42 C104 25, 156 25, 156 42 Z"
          fill="#FFFFFF"
          stroke="#CBD5E1"
          strokeWidth="1.5"
        />
        {/* Head */}
        <circle cx="130" cy="56" r="26" fill="url(#skinGrad)" />
        {/* Hair fringe */}
        <path
          d="M106 46 Q130 37 154 46"
          fill="none"
          stroke="#292524"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Eyes */}
        <circle cx="121" cy="55" r="2.6" fill="#1E293B" />
        <circle cx="139" cy="55" r="2.6" fill="#1E293B" />
        {/* Gentle smile */}
        <path
          d="M122 67 Q130 73 138 67"
          fill="none"
          stroke="#9A3412"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Ears */}
        <circle cx="102" cy="57" r="5" fill="url(#skinGrad)" />
        <circle cx="158" cy="57" r="5" fill="url(#skinGrad)" />

        {/* Torso (Modest cream & emerald thobe) */}
        <path
          d="M98 85 Q130 79 162 85 L170 164 Q130 170 90 164 Z"
          fill="url(#thobeGrad)"
          stroke="#059669"
          strokeWidth="2"
        />
        {/* Emerald collar embroidery */}
        <path
          d="M118 83 L130 105 L142 83"
          fill="none"
          stroke="#059669"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right arm (viewer's left) */}
        <path
          d="M98 88 L74 128 L86 135 L104 103"
          fill="url(#skinGrad)"
          stroke="#D97706"
          strokeOpacity="0.25"
        />
        {/* Left arm (viewer's right) */}
        <path
          d="M162 88 L186 128 L174 135 L156 103"
          fill="url(#skinGrad)"
          stroke="#D97706"
          strokeOpacity="0.25"
        />

        {/* Hands */}
        <circle cx="78" cy="133" r="8" fill="url(#skinGrad)" />
        <circle cx="182" cy="133" r="8" fill="url(#skinGrad)" />

        {/* Feet */}
        <ellipse cx="113" cy="192" rx="14" ry="8" fill="url(#skinGrad)" />
        <ellipse cx="147" cy="192" rx="14" ry="8" fill="url(#skinGrad)" />
        {/* Ankles */}
        <rect x="106" y="165" width="12" height="24" rx="4" fill="url(#skinGrad)" />
        <rect x="142" y="165" width="12" height="24" rx="4" fill="url(#skinGrad)" />

        {/* ACTIVE HIGHLIGHT OVERLAYS */}
        {stepId === 'niyyah' && (
          <g>
            <circle cx="130" cy="116" r="24" fill="url(#waterGlow)" />
            <path
              d="M130 127 C118 118 114 107 121 101 C125 98 129 101 130 104 C131 101 135 98 139 101 C146 107 142 118 130 127 Z"
              fill="#F59E0B"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          </g>
        )}

        {stepId === 'hands' && (
          <g>
            <circle cx="78" cy="133" r="20" fill="url(#waterGlow)" />
            <circle cx="182" cy="133" r="20" fill="url(#waterGlow)" />
            <circle
              cx="78"
              cy="133"
              r="11"
              fill={highlight(true)}
              fillOpacity="0.45"
              stroke="#0284C7"
              strokeWidth="2.5"
            />
            <circle
              cx="182"
              cy="133"
              r="11"
              fill={highlight(true)}
              fillOpacity="0.45"
              stroke="#0284C7"
              strokeWidth="2.5"
            />
          </g>
        )}

        {stepId === 'mouth' && (
          <g>
            <circle cx="130" cy="68" r="18" fill="url(#waterGlow)" />
            <ellipse
              cx="130"
              cy="68"
              rx="11"
              ry="7"
              fill="#38BDF8"
              fillOpacity="0.55"
              stroke="#0284C7"
              strokeWidth="2.5"
            />
          </g>
        )}

        {stepId === 'nose' && (
          <g>
            <circle cx="130" cy="59" r="16" fill="url(#waterGlow)" />
            <circle
              cx="130"
              cy="59"
              r="8"
              fill="#38BDF8"
              fillOpacity="0.55"
              stroke="#0284C7"
              strokeWidth="2.5"
            />
          </g>
        )}

        {stepId === 'face' && (
          <g>
            <circle cx="130" cy="56" r="36" fill="url(#waterGlow)" />
            <circle
              cx="130"
              cy="56"
              r="27"
              fill="#38BDF8"
              fillOpacity="0.35"
              stroke="#0284C7"
              strokeWidth="3"
              strokeDasharray="5 3"
            />
          </g>
        )}

        {stepId === 'right_arm' && (
          <g>
            <circle cx="88" cy="112" r="28" fill="url(#waterGlow)" />
            <path
              d="M98 88 L74 128 L86 135 L104 103 Z"
              fill="#38BDF8"
              fillOpacity="0.5"
              stroke="#0284C7"
              strokeWidth="3"
            />
          </g>
        )}

        {stepId === 'left_arm' && (
          <g>
            <circle cx="172" cy="112" r="28" fill="url(#waterGlow)" />
            <path
              d="M162 88 L186 128 L174 135 L156 103 Z"
              fill="#38BDF8"
              fillOpacity="0.5"
              stroke="#0284C7"
              strokeWidth="3"
            />
          </g>
        )}

        {stepId === 'head' && (
          <g>
            <circle cx="130" cy="36" r="32" fill="url(#waterGlow)" />
            <path
              d="M100 44 C100 22, 160 22, 160 44"
              fill="none"
              stroke="#0284C7"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M115 24 L145 24"
              stroke="#38BDF8"
              strokeWidth="3"
              strokeDasharray="4 3"
            />
          </g>
        )}

        {stepId === 'ears' && (
          <g>
            <circle cx="101" cy="57" r="14" fill="url(#waterGlow)" />
            <circle cx="159" cy="57" r="14" fill="url(#waterGlow)" />
            <circle
              cx="101"
              cy="57"
              r="7"
              fill="#38BDF8"
              fillOpacity="0.55"
              stroke="#0284C7"
              strokeWidth="2.5"
            />
            <circle
              cx="159"
              cy="57"
              r="7"
              fill="#38BDF8"
              fillOpacity="0.55"
              stroke="#0284C7"
              strokeWidth="2.5"
            />
          </g>
        )}

        {stepId === 'right_foot' && (
          <g>
            <circle cx="112" cy="184" r="26" fill="url(#waterGlow)" />
            <ellipse
              cx="113"
              cy="190"
              rx="18"
              ry="12"
              fill="#38BDF8"
              fillOpacity="0.5"
              stroke="#0284C7"
              strokeWidth="2.5"
            />
          </g>
        )}

        {stepId === 'left_foot' && (
          <g>
            <circle cx="148" cy="184" r="26" fill="url(#waterGlow)" />
            <ellipse
              cx="147"
              cy="190"
              rx="18"
              ry="12"
              fill="#38BDF8"
              fillOpacity="0.5"
              stroke="#0284C7"
              strokeWidth="2.5"
            />
          </g>
        )}

        {/* Water droplets */}
        {stepId !== 'niyyah' && (
          <g fill="#0EA5E9" opacity="0.85">
            <path d="M50 40 C46 47 46 53 50 53 C54 53 54 47 50 40 Z" />
            <path d="M210 56 C206 63 206 69 210 69 C214 69 214 63 210 56 Z" />
            <path d="M204 150 C200 156 200 161 204 161 C208 161 208 156 204 150 Z" />
          </g>
        )}
      </svg>
    </div>
  );
};
