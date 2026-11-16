import React from 'react';
import { PrayerPoseId } from '../../types/game';

interface PrayerPostureIllustrationProps {
  poseId: PrayerPoseId;
  className?: string;
}

export const PrayerPostureIllustration: React.FC<
  PrayerPostureIllustrationProps
> = ({ poseId, className = 'w-full h-56' }) => {
  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-b from-amber-50/80 via-emerald-50/40 to-emerald-100/60 border border-emerald-200 overflow-hidden p-3 ${className}`}
    >
      <svg
        viewBox="0 0 280 220"
        className="w-full h-full max-w-[280px]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="rugGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="robeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDFBF5" />
            <stop offset="100%" stopColor="#E6DFC8" />
          </linearGradient>
          <linearGradient id="poseSkin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5C9A6" />
            <stop offset="100%" stopColor="#E3A97E" />
          </linearGradient>
        </defs>

        {/* Prayer rug (Sajjadah) */}
        <polygon
          points="36,196 244,196 224,174 56,174"
          fill="url(#rugGrad)"
          stroke="#F59E0B"
          strokeWidth="2"
        />
        <polygon
          points="56,192 224,192 210,178 70,178"
          fill="none"
          stroke="#FDE68A"
          strokeWidth="1.2"
          strokeDasharray="4 3"
        />

        {/* TAKBEER */}
        {poseId === 'takbeer' && (
          <g>
            {/* Legs */}
            <rect x="122" y="136" width="12" height="46" rx="4" fill="#CBD5E1" />
            <rect x="146" y="136" width="12" height="46" rx="4" fill="#CBD5E1" />
            {/* Body */}
            <path d="M114 78 Q140 72 166 78 L172 146 L108 146 Z" fill="url(#robeGrad)" stroke="#059669" strokeWidth="2" />
            {/* Raised arms beside shoulders */}
            <path d="M114 82 L88 76 L88 54" fill="none" stroke="url(#robeGrad)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M166 82 L192 76 L192 54" fill="none" stroke="url(#robeGrad)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="88" cy="50" r="8" fill="url(#poseSkin)" />
            <circle cx="192" cy="50" r="8" fill="url(#poseSkin)" />
            {/* Head & Kufi */}
            <circle cx="140" cy="52" r="20" fill="url(#poseSkin)" />
            <path d="M120 42 C120 26 160 26 160 42 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            <circle cx="133" cy="52" r="2.2" fill="#1E293B" />
            <circle cx="147" cy="52" r="2.2" fill="#1E293B" />
            {/* Golden glow aura */}
            <circle cx="88" cy="50" r="14" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx="192" cy="50" r="14" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 3" />
          </g>
        )}

        {/* QIYAM / ITIDAL */}
        {(poseId === 'qiyam' || poseId === 'itidal') && (
          <g>
            <rect x="122" y="136" width="12" height="46" rx="4" fill="#CBD5E1" />
            <rect x="146" y="136" width="12" height="46" rx="4" fill="#CBD5E1" />
            <path d="M114 78 Q140 72 166 78 L172 146 L108 146 Z" fill="url(#robeGrad)" stroke="#059669" strokeWidth="2" />
            {poseId === 'qiyam' ? (
              <g>
                {/* Hands folded on chest */}
                <path d="M114 84 L126 106 L154 104 L166 84" fill="none" stroke="url(#robeGrad)" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
                <ellipse cx="140" cy="105" rx="14" ry="7" fill="url(#poseSkin)" />
              </g>
            ) : (
              <g>
                {/* Arms straight by sides */}
                <path d="M112 82 L100 132" stroke="url(#robeGrad)" strokeWidth="13" strokeLinecap="round" />
                <path d="M168 82 L180 132" stroke="url(#robeGrad)" strokeWidth="13" strokeLinecap="round" />
                <circle cx="99" cy="136" r="7" fill="url(#poseSkin)" />
                <circle cx="181" cy="136" r="7" fill="url(#poseSkin)" />
              </g>
            )}
            <circle cx="140" cy="52" r="20" fill="url(#poseSkin)" />
            <path d="M120 42 C120 26 160 26 160 42 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            <circle cx="133" cy="52" r="2.2" fill="#1E293B" />
            <circle cx="147" cy="52" r="2.2" fill="#1E293B" />
          </g>
        )}

        {/* RUKU (90-degree bow, facing left towards Qiblah side) */}
        {poseId === 'ruku' && (
          <g>
            {/* Legs straight */}
            <rect x="174" y="106" width="16" height="78" rx="6" fill="url(#robeGrad)" stroke="#059669" strokeWidth="2" />
            {/* Flat horizontal back */}
            <rect x="104" y="88" width="84" height="32" rx="14" fill="url(#robeGrad)" stroke="#059669" strokeWidth="2" />
            {/* Arm holding knee */}
            <path d="M122 108 L158 140 L176 140" fill="none" stroke="url(#robeGrad)" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="176" cy="140" r="7" fill="url(#poseSkin)" />
            {/* Head aligned with back */}
            <circle cx="88" cy="100" r="18" fill="url(#poseSkin)" />
            <path d="M70 96 C70 80 100 80 100 96 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            <circle cx="82" cy="102" r="2.2" fill="#1E293B" />
            {/* Straight-back alignment guide line */}
            <line x1="86" y1="74" x2="188" y2="74" stroke="#F59E0B" strokeWidth="2" strokeDasharray="5 4" />
          </g>
        )}

        {/* SUJOOD (Forehead, nose, hands, knees, toes on rug) */}
        {poseId === 'sujood' && (
          <g>
            {/* Feet & toes tucked behind */}
            <ellipse cx="212" cy="180" rx="10" ry="6" fill="url(#poseSkin)" />
            {/* Lower legs on rug */}
            <path d="M168 178 L210 180" stroke="url(#robeGrad)" strokeWidth="18" strokeLinecap="round" />
            {/* Back curved down to head */}
            <path d="M170 176 Q178 134 148 128 Q112 126 96 164 L118 178 Z" fill="url(#robeGrad)" stroke="#059669" strokeWidth="2" />
            {/* Arm & palm on rug */}
            <path d="M114 146 L94 176" stroke="url(#robeGrad)" strokeWidth="12" strokeLinecap="round" />
            <ellipse cx="88" cy="181" rx="11" ry="5" fill="url(#poseSkin)" />
            {/* Forehead touching rug */}
            <circle cx="76" cy="166" r="17" fill="url(#poseSkin)" />
            <path d="M62 158 C68 144 92 146 92 162 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            {/* Contact glow on forehead */}
            <circle cx="67" cy="180" r="8" fill="#F59E0B" fillOpacity="0.4" />
          </g>
        )}

        {/* JULOOS / TASHAHHUD */}
        {(poseId === 'juloos' || poseId === 'tashahhud') && (
          <g>
            {/* Folded legs seated */}
            <path d="M132 178 L194 178" stroke="url(#robeGrad)" strokeWidth="20" strokeLinecap="round" />
            {/* Upright torso */}
            <path d="M126 84 Q146 80 166 86 L176 172 L120 172 Z" fill="url(#robeGrad)" stroke="#059669" strokeWidth="2" />
            {/* Arm resting on thigh */}
            <path d="M132 96 L118 138 L92 146" fill="none" stroke="url(#robeGrad)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            {poseId === 'tashahhud' ? (
              <g>
                <circle cx="90" cy="146" r="7" fill="url(#poseSkin)" />
                {/* Index finger raised gently */}
                <line x1="88" y1="144" x2="72" y2="136" stroke="url(#poseSkin)" strokeWidth="4.5" strokeLinecap="round" />
                <circle cx="72" cy="136" r="7" fill="none" stroke="#F59E0B" strokeWidth="2" />
              </g>
            ) : (
              <circle cx="90" cy="146" r="7" fill="url(#poseSkin)" />
            )}
            {/* Head */}
            <circle cx="146" cy="58" r="19" fill="url(#poseSkin)" />
            <path d="M127 48 C127 32 165 32 165 48 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            <circle cx="136" cy="58" r="2.2" fill="#1E293B" />
          </g>
        )}

        {/* TASLEEM */}
        {poseId === 'tasleem' && (
          <g>
            <path d="M110 176 L170 176" stroke="url(#robeGrad)" strokeWidth="20" strokeLinecap="round" />
            <path d="M114 86 Q140 80 166 86 L174 172 L106 172 Z" fill="url(#robeGrad)" stroke="#059669" strokeWidth="2" />
            {/* Hands on knees */}
            <path d="M114 90 L102 140" stroke="url(#robeGrad)" strokeWidth="12" strokeLinecap="round" />
            <path d="M166 90 L178 140" stroke="url(#robeGrad)" strokeWidth="12" strokeLinecap="round" />
            <circle cx="102" cy="144" r="7" fill="url(#poseSkin)" />
            <circle cx="178" cy="144" r="7" fill="url(#poseSkin)" />
            {/* Head */}
            <circle cx="140" cy="58" r="20" fill="url(#poseSkin)" />
            <path d="M120 48 C120 32 160 32 160 48 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            <circle cx="133" cy="58" r="2.2" fill="#1E293B" />
            <circle cx="147" cy="58" r="2.2" fill="#1E293B" />
            {/* Left & Right turn arrows */}
            <path d="M96 58 L74 58 M80 52 L72 58 L80 64" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M184 58 L206 58 M200 52 L208 58 L200 64" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </svg>
    </div>
  );
};
