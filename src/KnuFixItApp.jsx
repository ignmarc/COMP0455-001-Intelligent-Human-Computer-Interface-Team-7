import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  FlaskConical,
  MapPin,
  Camera,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ThumbsUp,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
  Navigation,
  Sparkles,
  ClipboardList,
  PlusCircle,
  Timer,
  Play,
  Square,
  Trash2,
  Image as ImageIcon,
  Check,
  Building2,
  ArrowLeft,
  Maximize2,
  Layers,
  LocateFixed,
  Wrench,
  ShieldAlert,
  Users
} from 'lucide-react';

// ============================================================================
// 1. CONSTANTS & PRE-SEEDED KNU DAEGU CAMPUS DATA
// ============================================================================

const STORAGE_KEYS = {
  REPORTS: 'knu_fixit_reports_v1',
  TRIALS: 'knu_fixit_wsd_trials_v1',
  VERSION: 'knu_fixit_condition_v1'
};

/**
 * 10 Real Kyungpook National University (KNU) Daegu Campus Buildings
 * Coordinates represent approximate WGS84 campus building centroids.
 */
const KNU_BUILDINGS = [
  {
    id: 'it5',
    nameEn: 'IT Convergence Bldg (IT-5)',
    shortName: 'IT-5',
    nameKo: 'IT융복합관',
    lat: 35.8881,
    lng: 128.6113,
    zone: 'Engineering'
  },
  {
    id: 'it4',
    nameEn: 'IT Building 4 (IT-4)',
    shortName: 'IT-4',
    nameKo: '공대 10호관',
    lat: 35.8880,
    lng: 128.6108,
    zone: 'Engineering'
  },
  {
    id: 'eng9',
    nameEn: 'Engineering Bldg 9',
    shortName: 'Eng 9',
    nameKo: '공대 9호관',
    lat: 35.8869,
    lng: 128.6085,
    zone: 'Engineering'
  },
  {
    id: 'gp',
    nameEn: 'Global Plaza',
    shortName: 'Global Plaza',
    nameKo: '글로벌플라자',
    lat: 35.8920,
    lng: 128.6112,
    zone: 'North Gate'
  },
  {
    id: 'lib',
    nameEn: 'Central Library',
    shortName: 'Library',
    nameKo: '중앙도서관',
    lat: 35.8915,
    lng: 128.6121,
    zone: 'Central'
  },
  {
    id: 'hum',
    nameEn: 'Humanities Hall',
    shortName: 'Humanities',
    nameKo: '인문대학',
    lat: 35.8902,
    lng: 128.6140,
    zone: 'East'
  },
  {
    id: 'nat',
    nameEn: 'Natural Sciences Bldg',
    shortName: 'Nat. Sci.',
    nameKo: '자연과학대학',
    lat: 35.8891,
    lng: 128.6098,
    zone: 'West'
  },
  {
    id: 'soc',
    nameEn: 'College of Social Sciences',
    shortName: 'Social Sci.',
    nameKo: '사회과학대학',
    lat: 35.8885,
    lng: 128.6148,
    zone: 'East'
  },
  {
    id: 'main',
    nameEn: 'Main Administration Bldg',
    shortName: 'Main Admin',
    nameKo: '본관',
    lat: 35.8905,
    lng: 128.6121,
    zone: 'Central'
  },
  {
    id: 'wel',
    nameEn: 'Student Welfare Center',
    shortName: 'Welfare Ctr',
    nameKo: '복지관',
    lat: 35.8896,
    lng: 128.6132,
    zone: 'Central'
  }
];

/**
 * Simulated GPS presets for smooth indoor / off-campus HCI pilot & WSD testing
 */
const SIMULATED_LOCATIONS = [
  {
    id: 'sim_it5',
    label: 'Near IT-5',
    sublabel: 'IT Convergence Bldg',
    lat: 35.88818,
    lng: 128.61142
  },
  {
    id: 'sim_gp',
    label: 'Near Global Plaza',
    sublabel: 'North Gate Area',
    lat: 35.89208,
    lng: 128.61108
  },
  {
    id: 'sim_lib',
    label: 'Near Library',
    sublabel: 'Central Campus',
    lat: 35.89142,
    lng: 128.61224
  },
  {
    id: 'sim_eng9',
    label: 'Near Eng 9',
    sublabel: 'Engineering Quad',
    lat: 35.88702,
    lng: 128.60862
  }
];

/**
 * 6 Issue Categories designed for Recognition over Recall (Zero text entry in Step 1)
 */
const CATEGORIES = [
  {
    id: 'water_dispenser',
    labelEn: 'Water Dispenser',
    labelKo: '정수기',
    accentBg: 'bg-sky-50',
    accentBorder: 'border-sky-200',
    accentText: 'text-sky-700',
    sampleRoom: '1F Lobby',
    sampleNote: 'Hot water tap not dispensing, indicator blinking red'
  },
  {
    id: 'projector',
    labelEn: 'Projector',
    labelKo: '프로젝터',
    accentBg: 'bg-indigo-50',
    accentBorder: 'border-indigo-200',
    accentText: 'text-indigo-700',
    sampleRoom: 'Room 204',
    sampleNote: 'HDMI signal flickers and projector lens dims intermittently'
  },
  {
    id: 'chair',
    labelEn: 'Chair',
    labelKo: '의자',
    accentBg: 'bg-amber-50',
    accentBorder: 'border-amber-200',
    accentText: 'text-amber-700',
    sampleRoom: '3F Reading Room',
    sampleNote: 'Loose backrest bolt makes chair unstable'
  },
  {
    id: 'desk',
    labelEn: 'Desk',
    labelKo: '책상',
    accentBg: 'bg-orange-50',
    accentBorder: 'border-orange-200',
    accentText: 'text-orange-700',
    sampleRoom: 'Room 108',
    sampleNote: 'Front desk leg is bent and wobbles while writing'
  },
  {
    id: 'restroom',
    labelEn: 'Restroom',
    labelKo: '화장실',
    accentBg: 'bg-teal-50',
    accentBorder: 'border-teal-200',
    accentText: 'text-teal-700',
    sampleRoom: "2F Men's Restroom",
    sampleNote: 'Sink faucet leaking water continuously'
  },
  {
    id: 'elevator',
    labelEn: 'Elevator',
    labelKo: '엘리베이터',
    accentBg: 'bg-rose-50',
    accentBorder: 'border-rose-200',
    accentText: 'text-rose-700',
    sampleRoom: 'Main Elevator',
    sampleNote: 'Call button unresponsive and door sensor delayed'
  }
];

// ============================================================================
// 2. INLINE SVG MOCK PHOTO GENERATOR (ZERO EXTERNAL BROKEN IMAGE URLS)
// ============================================================================

/**
 * Generates realistic, stylized SVG data-URI photo thumbnails representing
 * campus facility issues so pre-seeded tickets and desktop sample uploads
 * work seamlessly offline without external image dependencies.
 */
function generateSamplePhotoSvg(categoryId, caption = 'KNU Campus Photo') {
  const safeCaption = String(caption).replace(/[<>&'"]/g, '');
  let sceneMarkup = '';
  let bgTop = '#1E293B';
  let bgBot = '#334155';

  switch (categoryId) {
    case 'projector':
      bgTop = '#0F172A';
      bgBot = '#1E293B';
      sceneMarkup = `
        <rect x="0" y="0" width="320" height="58" fill="#E2E8F0" opacity="0.14"/>
        <rect x="148" y="0" width="24" height="58" fill="#64748B"/>
        <rect x="84" y="54" width="152" height="54" rx="10" fill="#F8FAFC" stroke="#94A3B8" stroke-width="2"/>
        <circle cx="122" cy="81" r="18" fill="#0F172A" stroke="#475569" stroke-width="4"/>
        <circle cx="122" cy="81" r="8" fill="#38BDF8" opacity="0.8"/>
        <circle cx="212" cy="72" r="5" fill="#EF4444"/>
        <circle cx="212" cy="72" r="10" fill="#EF4444" opacity="0.28"/>
        <rect x="155" y="76" width="40" height="4" rx="2" fill="#CBD5E1"/>
        <rect x="155" y="84" width="40" height="4" rx="2" fill="#CBD5E1"/>
        <path d="M104 99 L38 195 L186 195 L140 99 Z" fill="#38BDF8" opacity="0.14"/>
        <line x1="66" y1="150" x2="156" y2="150" stroke="#F87171" stroke-width="2" stroke-dasharray="6 4"/>
        <text x="111" y="144" text-anchor="middle" fill="#FCA5A5" font-family="sans-serif" font-size="11" font-weight="700">NO HDMI SIGNAL</text>
      `;
      break;
    case 'water_dispenser':
      bgTop = '#E2E8F0';
      bgBot = '#CBD5E1';
      sceneMarkup = `
        <rect x="102" y="18" width="116" height="172" rx="10" fill="#F8FAFC" stroke="#94A3B8" stroke-width="2"/>
        <rect x="116" y="34" width="88" height="24" rx="4" fill="#1E293B"/>
        <circle cx="136" cy="46" r="4" fill="#38BDF8"/>
        <circle cx="154" cy="46" r="4" fill="#EF4444"/>
        <circle cx="154" cy="46" r="9" fill="#EF4444" opacity="0.28"/>
        <text x="180" y="50" text-anchor="middle" fill="#F87171" font-family="monospace" font-size="10" font-weight="700">ERR</text>
        <rect x="116" y="70" width="88" height="72" rx="6" fill="#0F172A" opacity="0.08"/>
        <rect x="136" y="74" width="12" height="18" rx="2" fill="#3B82F6"/>
        <rect x="172" y="74" width="12" height="18" rx="2" fill="#DC2626"/>
        <path d="M178 96 Q183 108 178 113 Q173 108 178 96 Z" fill="#EF4444"/>
        <rect x="122" y="132" width="76" height="8" rx="2" fill="#64748B"/>
        <rect x="116" y="152" width="88" height="28" rx="4" fill="#E2E8F0"/>
      `;
      break;
    case 'chair':
      bgTop = '#F1F5F9';
      bgBot = '#CBD5E1';
      sceneMarkup = `
        <rect x="110" y="34" width="96" height="58" rx="10" fill="#334155" transform="rotate(-7 158 63)"/>
        <rect x="104" y="102" width="106" height="18" rx="6" fill="#1E293B"/>
        <line x1="120" y1="120" x2="112" y2="180" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
        <line x1="194" y1="120" x2="202" y2="180" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
        <line x1="128" y1="90" x2="128" y2="104" stroke="#64748B" stroke-width="5"/>
        <line x1="186" y1="88" x2="188" y2="104" stroke="#DC2626" stroke-width="4" stroke-dasharray="3 3"/>
        <circle cx="187" cy="96" r="14" fill="none" stroke="#DA2127" stroke-width="2.5" stroke-dasharray="4 3"/>
        <circle cx="164" cy="176" r="4" fill="#64748B"/>
      `;
      break;
    case 'desk':
      bgTop = '#F8FAFC';
      bgBot = '#E2E8F0';
      sceneMarkup = `
        <rect x="52" y="72" width="216" height="18" rx="4" fill="#D97706" transform="rotate(3 160 81)"/>
        <rect x="52" y="72" width="216" height="7" rx="2" fill="#F59E0B" transform="rotate(3 160 81)"/>
        <line x1="78" y1="88" x2="78" y2="178" stroke="#475569" stroke-width="8" stroke-linecap="round"/>
        <line x1="238" y1="96" x2="254" y2="176" stroke="#DC2626" stroke-width="8" stroke-linecap="round"/>
        <circle cx="246" cy="138" r="18" fill="none" stroke="#DA2127" stroke-width="2.5" stroke-dasharray="5 3"/>
        <text x="160" y="168" text-anchor="middle" fill="#64748B" font-family="sans-serif" font-size="11" font-weight="600">Unstable Front Leg</text>
      `;
      break;
    case 'restroom':
      bgTop = '#E0F2FE';
      bgBot = '#BAE6FD';
      sceneMarkup = `
        <rect x="64" y="114" width="192" height="58" rx="18" fill="#FFFFFF" stroke="#94A3B8" stroke-width="2"/>
        <ellipse cx="160" cy="126" rx="68" ry="18" fill="#E2E8F0"/>
        <path d="M160 118 L160 66 Q160 48 142 48 L134 48" fill="none" stroke="#64748B" stroke-width="10" stroke-linecap="round"/>
        <circle cx="160" cy="112" r="8" fill="#94A3B8"/>
        <path d="M134 58 Q140 74 134 80 Q128 74 134 58 Z" fill="#0284C7"/>
        <path d="M134 88 Q139 102 134 108 Q129 102 134 88 Z" fill="#38BDF8"/>
        <ellipse cx="134" cy="124" rx="18" ry="5" fill="#0284C7" opacity="0.35"/>
      `;
      break;
    case 'elevator':
    default:
      bgTop = '#CBD5E1';
      bgBot = '#94A3B8';
      sceneMarkup = `
        <rect x="44" y="18" width="154" height="172" fill="#475569" stroke="#334155" stroke-width="3"/>
        <rect x="50" y="24" width="69" height="160" fill="#CBD5E1"/>
        <rect x="123" y="24" width="69" height="160" fill="#CBD5E1"/>
        <rect x="94" y="4" width="54" height="18" rx="3" fill="#0F172A"/>
        <text x="121" y="17" text-anchor="middle" fill="#22C55E" font-family="monospace" font-size="11" font-weight="700">3F ▲</text>
        <rect x="218" y="64" width="54" height="86" rx="6" fill="#E2E8F0" stroke="#64748B" stroke-width="2"/>
        <circle cx="245" cy="92" r="12" fill="#FEF3C7" stroke="#DA2127" stroke-width="2.5"/>
        <text x="245" y="96" text-anchor="middle" fill="#B91C1C" font-family="sans-serif" font-size="11" font-weight="800">3</text>
        <circle cx="245" cy="126" r="12" fill="#FFFFFF" stroke="#94A3B8" stroke-width="2"/>
        <text x="245" y="130" text-anchor="middle" fill="#475569" font-family="sans-serif" font-size="11" font-weight="700">2</text>
      `;
      break;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${bgTop}"/>
          <stop offset="100%" stop-color="${bgBot}"/>
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="url(#bg)"/>
      ${sceneMarkup}
      <rect x="0" y="174" width="320" height="26" fill="#0F172A" opacity="0.72"/>
      <text x="12" y="191" fill="#F8FAFC" font-family="sans-serif" font-size="10.5" font-weight="600">📷 ${safeCaption}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Generates the 6 realistic pre-seeded KNU campus reports
 */
function createInitialReports() {
  const now = Date.now();
  const min = 60 * 1000;
  const hr = 60 * min;
  const day = 24 * hr;

  return [
    {
      id: 'rep-knu-101',
      category: 'projector',
      buildingId: 'it5',
      room: 'Room 204',
      description: 'HDMI cable port loose and image flickers during lectures',
      status: 'In Progress',
      createdAt: now - 2 * hr,
      confirmations: 3,
      confirmedByMe: false,
      createdByMe: false,
      photoUrl: generateSamplePhotoSvg('projector', 'IT-5 · Room 204 Projector')
    },
    {
      id: 'rep-knu-102',
      category: 'water_dispenser',
      buildingId: 'gp',
      room: '1F Lobby',
      description: 'Hot water tap not dispensing, error light blinking',
      status: 'Reported',
      createdAt: now - 45 * min,
      confirmations: 2,
      confirmedByMe: false,
      createdByMe: false,
      photoUrl: generateSamplePhotoSvg('water_dispenser', 'Global Plaza · 1F Lobby')
    },
    {
      id: 'rep-knu-103',
      category: 'chair',
      buildingId: 'lib',
      room: '3F Reading Room',
      description: 'Broken backrest bolt on seat #42',
      status: 'In Progress',
      createdAt: now - 5 * hr,
      confirmations: 1,
      confirmedByMe: false,
      createdByMe: false,
      photoUrl: generateSamplePhotoSvg('chair', 'Central Library · Seat #42')
    },
    {
      id: 'rep-knu-104',
      category: 'restroom',
      buildingId: 'eng9',
      room: "2F Men's Restroom",
      description: 'Middle sink faucet leaking continuously',
      status: 'Reported',
      createdAt: now - 1 * hr,
      confirmations: 4,
      confirmedByMe: false,
      createdByMe: false,
      photoUrl: generateSamplePhotoSvg('restroom', 'Eng 9 · 2F Restroom')
    },
    {
      id: 'rep-knu-105',
      category: 'elevator',
      buildingId: 'it4',
      room: 'Main Elevator',
      description: '3rd floor call button stuck',
      status: 'Fixed',
      createdAt: now - 1 * day,
      confirmations: 5,
      confirmedByMe: false,
      createdByMe: false,
      photoUrl: generateSamplePhotoSvg('elevator', 'IT-4 · Main Elevator (Fixed)')
    },
    {
      id: 'rep-knu-106',
      category: 'desk',
      buildingId: 'hum',
      room: 'Room 108',
      description: 'Wobbly desk leg in back row',
      status: 'Reported',
      createdAt: now - 3 * hr,
      confirmations: 1,
      confirmedByMe: false,
      createdByMe: false,
      photoUrl: generateSamplePhotoSvg('desk', 'Humanities · Room 108')
    }
  ];
}

// ============================================================================
// 3. GEOSPATIAL, NAVER MAPS ADAPTER & MATCHING UTILITIES
// ============================================================================

/**
 * Computes great-circle distance in meters between two WGS84 coordinates
 * using the Haversine formula.
 */
function haversineDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Naver Maps Cloud Platform Reverse Geocoding API Adapter Abstraction.
 *
 * In production with a backend proxy (Flask/FastAPI), this function calls:
 *   GET https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc
 *       ?coords=${lng},${lat}&orders=roadaddr,admcode&output=json
 *   Headers:
 *     X-NCP-APIGW-API-KEY-ID: <NAVER_CLIENT_ID>
 *     X-NCP-APIGW-API-KEY: <NAVER_CLIENT_SECRET>
 *
 * For our serverless PWA prototype & offline campus evaluation, this adapter
 * resolves the nearest KNU Daegu campus buildings via Haversine matching and
 * returns a normalized Naver-compatible payload.
 */
async function fetchNaverReverseGeocode(lat, lng) {
  // Rank all 10 KNU buildings by geodesic distance
  const rankedBuildings = KNU_BUILDINGS.map((b) => ({
    ...b,
    distanceMeters: haversineDistanceMeters(lat, lng, b.lat, b.lng)
  })).sort((a, b) => a.distanceMeters - b.distanceMeters);

  const nearest = rankedBuildings[0];
  const isOnKnuCampus = nearest.distanceMeters <= 1200;

  return {
    provider: 'Naver Maps API (KNU Campus Adapter)',
    status: 'OK',
    coords: { lat, lng },
    isOnKnuCampus,
    roadAddressKo: `대구광역시 북구 대학로 80 경북대학교 ${nearest.nameKo}`,
    roadAddressEn: `80 Daehak-ro, Buk-gu, Daegu · ${nearest.nameEn}`,
    nearestBuildings: rankedBuildings.slice(0, 3),
    allRanked: rankedBuildings
  };
}

/**
 * Formats distance nicely for campus walking scales
 */
function formatDistance(meters) {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Normalizes room strings for fuzzy duplicate detection:
 * e.g., "Room 204", "rm 204", "204", "#204" -> "204"
 * e.g., "1F Lobby", "1f-lobby" -> "1flobby"
 */
function normalizeRoomString(input) {
  if (!input) return '';
  return input
    .toLowerCase()
    .trim()
    .replace(/\b(room|rm|no|num|hall|호|호실)\b/g, '')
    .replace(/[^a-z0-9가-힣]/g, '');
}

/**
 * Checks whether two room labels likely refer to the same physical location
 */
function isRoomMatch(inputRoom, existingRoom) {
  const normInput = normalizeRoomString(inputRoom);
  const normExisting = normalizeRoomString(existingRoom);
  if (!normInput || !normExisting) return false;
  if (normInput === normExisting) return true;
  // Allow substring match for meaningful inputs (e.g., "lobby" -> "1flobby", "reading" -> "3freadingroom")
  if (normInput.length >= 3 && (normExisting.includes(normInput) || normInput.includes(normExisting))) {
    return true;
  }
  return false;
}

/**
 * Formats relative timestamps ("Just now", "45m ago", "2h ago", "1d ago")
 */
function formatRelativeTime(timestamp) {
  const diffSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSec < 45) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

// ============================================================================
// 4. BESPOKE CATEGORY ICONS (CRISP INLINE SVGs FOR RECOGNITION OVER RECALL)
// ============================================================================

function CategoryIcon({ categoryId, className = 'w-8 h-8' }) {
  switch (categoryId) {
    case 'water_dispenser':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <rect x="8" y="4" width="20" height="28" rx="3.5" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.2" />
          <rect x="11.5" y="8" width="13" height="4.5" rx="1.5" fill="#0284C7" />
          <rect x="11.5" y="15.5" width="13" height="10" rx="2" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="1.5" />
          <path d="M18 17.5 C18 17.5 21 20.8 21 22.4 C21 24 19.6 25 18 25 C16.4 25 15 24 15 22.4 C15 20.8 18 17.5 18 17.5 Z" fill="#0EA5E9" />
          <line x1="12" y1="28.5" x2="24" y2="28.5" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'projector':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <line x1="18" y1="4" x2="18" y2="11" stroke="#4338CA" strokeWidth="2.4" strokeLinecap="round" />
          <rect x="5" y="11" width="26" height="13" rx="3.5" fill="#E0E7FF" stroke="#4338CA" strokeWidth="2.2" />
          <circle cx="13.5" cy="17.5" r="4.2" fill="#FFFFFF" stroke="#4338CA" strokeWidth="2" />
          <circle cx="13.5" cy="17.5" r="1.7" fill="#6366F1" />
          <line x1="21" y1="15.5" x2="27" y2="15.5" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
          <line x1="21" y1="19.5" x2="27" y2="19.5" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
          <path d="M10 24 L6.5 31 M17 24 L20.5 31" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="2 2.5" />
        </svg>
      );
    case 'chair':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <rect x="10" y="6" width="16" height="11" rx="3" fill="#FEF3C7" stroke="#B45309" strokeWidth="2.2" />
          <rect x="8.5" y="19" width="19" height="4.5" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
          <line x1="12" y1="17" x2="12" y2="19" stroke="#B45309" strokeWidth="2.2" />
          <line x1="24" y1="17" x2="24" y2="19" stroke="#B45309" strokeWidth="2.2" />
          <line x1="11.5" y1="23.5" x2="10" y2="31" stroke="#B45309" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="24.5" y1="23.5" x2="26" y2="31" stroke="#B45309" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'desk':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <rect x="4.5" y="11" width="27" height="5" rx="2" fill="#FFEDD5" stroke="#C2410C" strokeWidth="2.2" />
          <rect x="7.5" y="16" width="21" height="4.5" rx="1" fill="#FDBA74" stroke="#C2410C" strokeWidth="1.8" />
          <line x1="8" y1="16" x2="8" y2="30" stroke="#C2410C" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="28" y1="16" x2="28" y2="30" stroke="#C2410C" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'restroom':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <rect x="5" y="6" width="26" height="24" rx="5" fill="#CCFBF1" stroke="#0F766E" strokeWidth="2.2" />
          <circle cx="13" cy="12.5" r="2.2" fill="#0F766E" />
          <path d="M10.5 24 V17.5 C10.5 16.4 11.4 15.8 13 15.8 C14.6 15.8 15.5 16.4 15.5 17.5 V24" stroke="#0F766E" strokeWidth="2" strokeLinecap="round" />
          <line x1="18" y1="10" x2="18" y2="26" stroke="#14B8A6" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="23" cy="12.5" r="2.2" fill="#0F766E" />
          <path d="M20.5 23.5 L22 16.2 H24 L25.5 23.5 Z" fill="#0F766E" />
        </svg>
      );
    case 'elevator':
    default:
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <rect x="6" y="7" width="18" height="23" rx="2.5" fill="#FFE4E6" stroke="#BE123C" strokeWidth="2.2" />
          <line x1="15" y1="7" x2="15" y2="30" stroke="#BE123C" strokeWidth="1.8" />
          <path d="M28.5 12.5 L31.5 16.5 H25.5 Z" fill="#BE123C" />
          <path d="M28.5 25 L31.5 21 H25.5 Z" fill="#FB7185" />
          <rect x="11" y="3.5" width="8" height="2.5" rx="1.2" fill="#BE123C" />
        </svg>
      );
  }
}

// ============================================================================
// 5. REUSABLE UI COMPONENTS
// ============================================================================

/**
 * Academic HCI Principle Tag (Visible only when HCI Overlay is toggled ON)
 */
function HciBadge({ label, visible, className = '' }) {
  if (!visible) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight bg-purple-100 text-purple-800 border border-purple-300 shadow-sm ${className}`}
    >
      <Sparkles className="w-2.5 h-2.5 text-purple-600 shrink-0" />
      {label}
    </span>
  );
}

/**
 * Accessible Semantic Status Badge
 */
function StatusBadge({ status }) {
  const styles = {
    Reported: 'bg-[#FEF3C7] text-[#B45309] border-amber-200/80',
    'In Progress': 'bg-[#DBEAFE] text-[#1D4ED8] border-blue-200/80',
    Fixed: 'bg-[#DCFCE7] text-[#15803D] border-emerald-200/80'
  };

  const dotColors = {
    Reported: 'bg-[#D97706]',
    'In Progress': 'bg-[#2563EB]',
    Fixed: 'bg-[#16A34A]'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${
        styles[status] || styles.Reported
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status] || dotColors.Reported}`} />
      {status}
    </span>
  );
}

/**
 * Interactive Naver-Style Mini-Map of KNU Daegu Campus
 * Projects actual WGS84 coordinates onto a clean SVG map viewport.
 */
function NaverKnuMiniMap({
  userCoords,
  selectedBuildingId,
  nearestIds,
  onSelectBuilding,
  locationSourceLabel
}) {
  // Bounding box around KNU Daegu Campus
  const MIN_LAT = 35.8861;
  const MAX_LAT = 35.8929;
  const MIN_LNG = 128.6075;
  const MAX_LNG = 128.6158;
  const WIDTH = 360;
  const HEIGHT = 172;

  const project = useCallback((lat, lng) => {
    const xRatio = (lng - MIN_LNG) / (MAX_LNG - MIN_LNG);
    const yRatio = 1 - (lat - MIN_LAT) / (MAX_LAT - MIN_LAT);
    return {
      x: Math.max(14, Math.min(WIDTH - 14, xRatio * WIDTH)),
      y: Math.max(16, Math.min(HEIGHT - 16, yRatio * HEIGHT))
    };
  }, []);

  const userPoint = project(userCoords.lat, userCoords.lng);

  return (
    <div className="relative rounded-xl overflow-hidden border border-emerald-200/90 bg-[#EDF4EC] shadow-inner">
      {/* Naver Maps style compact top-left badge */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-slate-200/80">
        <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-[#03C75A] text-white text-[10px] font-black leading-none">
          N
        </span>
        <span className="text-[10px] font-bold text-slate-800 tracking-tight">
          NAVER Maps · KNU Daegu
        </span>
      </div>

      {/* Active GPS mode indicator */}
      <div className="absolute top-2 right-2 z-10 bg-slate-900/75 text-white px-2 py-0.5 rounded-md text-[10px] font-medium backdrop-blur-sm">
        {locationSourceLabel}
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-[156px] block select-none"
        role="img"
        aria-label="Naver Maps KNU Campus Map"
      >
        {/* Campus Base Green Spaces (Ilcheongdam / Central Lawn / North Gate Park) */}
        <rect width={WIDTH} height={HEIGHT} fill="#F2F4F0" />
        <ellipse cx="188" cy="78" rx="68" ry="38" fill="#DCEFD8" />
        <ellipse cx="95" cy="126" rx="46" ry="26" fill="#E1F1DD" />
        <ellipse cx="290" cy="112" rx="44" ry="30" fill="#E1F1DD" />
        {/* Ilcheongdam Pond */}
        <ellipse cx="176" cy="54" rx="16" ry="7" fill="#BAE6FD" stroke="#7DD3FC" strokeWidth="1" />

        {/* Campus Roads & Walkways */}
        <path
          d="M0 24 Q140 16 360 32"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M0 24 Q140 16 360 32"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <path
          d="M42 170 Q130 120 185 88 T332 130"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="6.5"
          strokeLinecap="round"
        />
        <path
          d="M164 20 L168 172"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="6"
        />
        <path
          d="M95 82 L270 76"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="5"
        />

        {/* Road Label */}
        <text x="274" y="21" fill="#64748B" fontSize="8" fontWeight="600" fontFamily="sans-serif">
          대학로 (Daehak-ro)
        </text>

        {/* Campus Buildings */}
        {KNU_BUILDINGS.map((b) => {
          const pt = project(b.lat, b.lng);
          const isSelected = b.id === selectedBuildingId;
          const isSuggested = nearestIds.includes(b.id);

          return (
            <g
              key={b.id}
              onClick={() => onSelectBuilding(b.id, 'GPS Auto-Suggest')}
              className="cursor-pointer"
            >
              {/* Building Footprint */}
              <rect
                x={pt.x - 10}
                y={pt.y - 6}
                width="20"
                height="12"
                rx="3"
                fill={isSelected ? '#DA2127' : isSuggested ? '#03C75A' : '#CBD5E1'}
                stroke={isSelected ? '#7F1D1D' : isSuggested ? '#047857' : '#94A3B8'}
                strokeWidth={isSelected ? '1.8' : '1.1'}
              />

              {/* Highlight Ring for Selected Building */}
              {isSelected && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="14"
                  fill="#DA2127"
                  opacity="0.16"
                />
              )}

              {/* Compact Label */}
              <text
                x={pt.x}
                y={pt.y + 15}
                textAnchor="middle"
                fill={isSelected ? '#991B1B' : isSuggested ? '#065F46' : '#475569'}
                fontSize={isSelected ? '8.5' : '7.5'}
                fontWeight={isSelected || isSuggested ? '700' : '600'}
                fontFamily="sans-serif"
                paintOrder="stroke"
                stroke="#FFFFFF"
                strokeWidth="2.5"
              >
                {b.shortName}
              </text>
            </g>
          );
        })}

        {/* Pulsing Blue User GPS Dot */}
        <g>
          <circle cx={userPoint.x} cy={userPoint.y} r="13" fill="#2563EB" opacity="0.18">
            <animate attributeName="r" values="8;16;8" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.32;0.05;0.32" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <circle
            cx={userPoint.x}
            cy={userPoint.y}
            r="5.2"
            fill="#2563EB"
            stroke="#FFFFFF"
            strokeWidth="2.2"
          />
        </g>
      </svg>

      {/* Mini Legend Footer */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-white/90 border-t border-slate-200/80 text-[10px] text-slate-600">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> You
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-[#03C75A] inline-block" /> Nearest
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-[#DA2127] inline-block" /> Selected
          </span>
        </div>
        <span className="text-slate-400 font-medium">Tap building pin</span>
      </div>
    </div>
  );
}

/**
 * Lightbox Modal for viewing full issue photo thumbnails
 */
function PhotoLightboxModal({ photo, title, subtitle, onClose }) {
  if (!photo) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-[390px] bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 truncate">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            aria-label="Close photo preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-slate-900 flex items-center justify-center p-2">
          <img
            src={photo}
            alt={title}
            className="w-full max-h-[340px] object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 6. COLLAPSIBLE HCI STUDY CONTROLS DRAWER (TEAM 7 PILOT & WSD TOOLKIT)
// ============================================================================

function HciStudyDrawer({
  isOpen,
  onClose,
  version,
  onChangeVersion,
  timerRunning,
  elapsedMs,
  onStartTrial,
  onStopResetTimer,
  trials,
  onClearTrials,
  simLocationId,
  usingLiveGps,
  gpsError,
  onSelectSimLocation,
  onRequestLiveGps,
  showHciTags,
  onToggleHciTags,
  onResetDemoData
}) {
  if (!isOpen) return null;

  // Compute summary stats per condition for quick researcher inspection
  const v1Trials = trials.filter((t) => t.condition === 'v1');
  const v2Trials = trials.filter((t) => t.condition === 'v2');
  const avgSec = (arr) =>
    arr.length ? (arr.reduce((sum, x) => sum + x.timeSec, 0) / arr.length).toFixed(1) : '—';

  return (
    <div
      className="absolute inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] flex flex-col justify-start animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-h-[88%] bg-white rounded-b-3xl shadow-2xl border-b border-slate-200 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="sticky top-0 z-10 bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-purple-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">HCI Study Controls</h2>
              <p className="text-[11px] text-slate-300">
                COMP0455-001 · Team 7 Pilot &amp; WSD Suite
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close HCI Study Controls"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-slate-800">
          {/* 1. Prototype Condition Switcher */}
          <section className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Prototype Condition
              </h3>
              <span className="text-[11px] font-semibold text-[#DA2127]">
                Active: {version === 'v1' ? 'v1 MVP' : 'v2 Enhanced'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChangeVersion('v1')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  version === 'v1'
                    ? 'bg-white border-[#DA2127] ring-2 ring-[#DA2127]/15 shadow-sm'
                    : 'bg-white/60 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">v1 (Pre-Pilot MVP)</div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                  Manual building dropdown, no duplicate check
                </div>
              </button>
              <button
                type="button"
                onClick={() => onChangeVersion('v2')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  version === 'v2'
                    ? 'bg-white border-[#DA2127] ring-2 ring-[#DA2127]/15 shadow-sm'
                    : 'bg-white/60 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">v2 (Post-Pilot)</div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                  Naver GPS auto-suggest + Duplicate "+1"
                </div>
              </button>
            </div>
          </section>

          {/* 2. WSD Task Completion Timer & Telemetry */}
          <section className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-slate-500" />
                2. Task Completion Timer (WSD)
              </h3>
              <span
                className={`font-mono text-sm font-bold px-2.5 py-0.5 rounded-lg ${
                  timerRunning
                    ? 'bg-red-100 text-[#B91C1C] animate-pulse'
                    : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {(elapsedMs / 1000).toFixed(1)}s
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onStartTrial}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#DA2127] hover:bg-[#B91C1C] text-white text-xs font-bold shadow-sm transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {timerRunning ? 'Restart Timed Trial' : 'Start Timed Trial'}
              </button>
              <button
                type="button"
                onClick={onStopResetTimer}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Starts on Step 1 and stops automatically upon report submission or tapping{' '}
              <span className="font-semibold text-slate-700">Confirm / +1 Issue</span>.
            </p>

            {/* Quick Mean Comparison */}
            {trials.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-white rounded-xl p-2 border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500 font-medium">v1 Mean Time (n={v1Trials.length})</div>
                  <div className="text-sm font-bold text-slate-900 font-mono">{avgSec(v1Trials)}s</div>
                </div>
                <div className="bg-white rounded-xl p-2 border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500 font-medium">v2 Mean Time (n={v2Trials.length})</div>
                  <div className="text-sm font-bold text-emerald-700 font-mono">{avgSec(v2Trials)}s</div>
                </div>
              </div>
            )}

            {/* Logged Trials Mini Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-100/80 border-b border-slate-200">
                <span className="text-[11px] font-bold text-slate-700">
                  Trial Log ({trials.length})
                </span>
                {trials.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearTrials}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 hover:text-rose-700"
                  >
                    <Trash2 className="w-3 h-3" /> Clear Log
                  </button>
                )}
              </div>
              {trials.length === 0 ? (
                <div className="p-3 text-center text-[11px] text-slate-400">
                  No timed trials logged yet. Tap &ldquo;Start Timed Trial&rdquo; above.
                </div>
              ) : (
                <div className="max-h-36 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-[10.5px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                        <th className="py-1.5 px-2.5">Cond.</th>
                        <th className="py-1.5 px-2">Time</th>
                        <th className="py-1.5 px-2">Outcome</th>
                        <th className="py-1.5 px-2">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {trials.map((tr) => (
                        <tr key={tr.id} className="hover:bg-slate-50">
                          <td className="py-1.5 px-2.5 font-bold">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] ${
                                tr.condition === 'v2'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {tr.condition}
                            </span>
                          </td>
                          <td className="py-1.5 px-2 font-mono font-semibold text-slate-800">
                            {tr.timeSec.toFixed(1)}s
                          </td>
                          <td className="py-1.5 px-2 text-slate-700">
                            {tr.outcome === '+1 Duplicate Prevented' ? (
                              <span className="text-amber-700 font-semibold">+1 Dup Saved</span>
                            ) : (
                              'New Ticket'
                            )}
                          </td>
                          <td className="py-1.5 px-2 text-slate-500">{tr.locationMethod}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* 3. GPS Location Simulator (v2 Testing) */}
          <section className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-slate-500" />
                3. GPS Simulator (v2 Campus Test)
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SIMULATED_LOCATIONS.map((loc) => {
                const active = !usingLiveGps && simLocationId === loc.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => onSelectSimLocation(loc.id)}
                    className={`px-2.5 py-2 rounded-xl border text-left transition-all ${
                      active
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold leading-tight">{loc.label}</div>
                    <div className="text-[10px] opacity-75 truncate">{loc.sublabel}</div>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={onRequestLiveGps}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all ${
                usingLiveGps
                  ? 'bg-blue-50 border-blue-500 text-blue-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <LocateFixed className="w-3.5 h-3.5" />
              {usingLiveGps ? 'Using Live Browser GPS' : 'Use Real Browser GPS'}
            </button>
            {gpsError && (
              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                {gpsError}
              </p>
            )}
          </section>

          {/* 4. HCI Principle Tags Overlay & 5. Reset Demo Data */}
          <section className="grid grid-cols-1 gap-2.5">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80">
              <div className="pr-3">
                <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  HCI Principle Tags Overlay
                </div>
                <p className="text-[10.5px] text-purple-800/80 mt-0.5">
                  Annotate UI elements with academic HCI concepts for presentations.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showHciTags}
                onClick={onToggleHciTags}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  showHciTags ? 'bg-purple-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                    showHciTags ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={onResetDemoData}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Pre-Seeded KNU Demo Reports (6 items)
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 7. MAIN APPLICATION COMPONENT
// ============================================================================

export default function App() {
  // --- Core Navigation & Condition State ---
  const [activeTab, setActiveTab] = useState('report'); // 'report' | 'dashboard'
  const [reportStep, setReportStep] = useState(1); // 1: Category | 2: Details
  const [version, setVersion] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VERSION);
      return saved === 'v1' || saved === 'v2' ? saved : 'v2';
    } catch {
      return 'v2';
    }
  });

  // --- Persistent Reports State ---
  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to initial seed data
    }
    return createInitialReports();
  });

  // --- Step 1 & Step 2 Form State ---
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [locationMethodUsed, setLocationMethodUsed] = useState('Manual Dropdown');
  const [showManualFallbackInV2, setShowManualFallbackInV2] = useState(false);
  const [roomInput, setRoomInput] = useState('');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [bypassDuplicate, setBypassDuplicate] = useState(false);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef(null);

  // --- v2 Naver Maps GPS State ---
  const [simLocationId, setSimLocationId] = useState('sim_it5');
  const [usingLiveGps, setUsingLiveGps] = useState(false);
  const [liveCoords, setLiveCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [naverGeocodeResult, setNaverGeocodeResult] = useState(null);

  // --- Dashboard State ---
  const [dashboardTab, setDashboardTab] = useState('all'); // 'all' | 'mine'
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Reported' | 'In Progress' | 'Fixed'
  const [recentSubmissionBanner, setRecentSubmissionBanner] = useState(null);
  const [lightboxData, setLightboxData] = useState(null);

  // --- HCI Study Controls Drawer, Overlay & WSD Timer State ---
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showHciTags, setShowHciTags] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [trialStartTime, setTrialStartTime] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [trials, setTrials] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRIALS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // --- Toast Feedback State ---
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, tone = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, tone });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3400);
  }, []);

  // --- Persist Reports, Version & Trials in localStorage ---
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    } catch {
      // Ignore quota errors on large uploaded photos
    }
  }, [reports]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VERSION, version);
    } catch {
      // Ignore
    }
  }, [version]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRIALS, JSON.stringify(trials));
    } catch {
      // Ignore
    }
  }, [trials]);

  // --- Live Stopwatch Effect for WSD Telemetry ---
  useEffect(() => {
    if (!timerRunning || !trialStartTime) return;
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - trialStartTime);
    }, 100);
    return () => clearInterval(interval);
  }, [timerRunning, trialStartTime]);

  // --- Active Coordinates (Live GPS or Campus Preset) ---
  const activeCoords = useMemo(() => {
    if (usingLiveGps && liveCoords) return liveCoords;
    const preset = SIMULATED_LOCATIONS.find((l) => l.id === simLocationId) || SIMULATED_LOCATIONS[0];
    return { lat: preset.lat, lng: preset.lng };
  }, [usingLiveGps, liveCoords, simLocationId]);

  const activeLocationSourceLabel = useMemo(() => {
    if (usingLiveGps && liveCoords) return 'Live GPS';
    const preset = SIMULATED_LOCATIONS.find((l) => l.id === simLocationId) || SIMULATED_LOCATIONS[0];
    return `Sim: ${preset.label}`;
  }, [usingLiveGps, liveCoords, simLocationId]);

  // --- Run Naver Reverse Geocoding Adapter whenever coordinates change ---
  useEffect(() => {
    let cancelled = false;
    fetchNaverReverseGeocode(activeCoords.lat, activeCoords.lng).then((res) => {
      if (!cancelled) {
        setNaverGeocodeResult(res);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeCoords]);

  // --- Auto-suggest nearest KNU building when entering Step 2 in v2 ---
  useEffect(() => {
    if (version === 'v2' && reportStep === 2 && naverGeocodeResult?.nearestBuildings?.[0]) {
      // If no building chosen yet, auto-select nearest building for Cognitive Offloading
      if (!selectedBuildingId) {
        setSelectedBuildingId(naverGeocodeResult.nearestBuildings[0].id);
        setLocationMethodUsed('GPS Auto-Suggest');
      }
    }
    if (version === 'v1') {
      setLocationMethodUsed('Manual Dropdown');
    }
  }, [version, reportStep, naverGeocodeResult, selectedBuildingId]);

  // Reset bypass duplicate flag whenever key identifiers change
  useEffect(() => {
    setBypassDuplicate(false);
  }, [selectedCategory, selectedBuildingId, roomInput, version]);

  // --- Alphabetical Building List for v1 Manual Dropdown & v2 Fallback ---
  const alphabeticalBuildings = useMemo(
    () => [...KNU_BUILDINGS].sort((a, b) => a.nameEn.localeCompare(b.nameEn)),
    []
  );

  // --- Lookup Helpers ---
  const getBuildingById = useCallback(
    (id) => KNU_BUILDINGS.find((b) => b.id === id) || KNU_BUILDINGS[0],
    []
  );
  const getCategoryById = useCallback(
    (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0],
    []
  );

  // --- Active Issues in Selected Building + Category (for v2 Shared Awareness Hints) ---
  const activeBuildingCategoryReports = useMemo(() => {
    if (version !== 'v2' || !selectedCategory || !selectedBuildingId) return [];
    return reports.filter(
      (r) =>
        r.category === selectedCategory &&
        r.buildingId === selectedBuildingId &&
        (r.status === 'Reported' || r.status === 'In Progress')
    );
  }, [version, selectedCategory, selectedBuildingId, reports]);

  // --- Real-Time Duplicate Detector (v2 Feature 2) ---
  const detectedDuplicate = useMemo(() => {
    if (version !== 'v2' || !selectedCategory || !selectedBuildingId || !roomInput.trim()) {
      return null;
    }
    return (
      reports.find(
        (r) =>
          r.category === selectedCategory &&
          r.buildingId === selectedBuildingId &&
          (r.status === 'Reported' || r.status === 'In Progress') &&
          isRoomMatch(roomInput, r.room)
      ) || null
    );
  }, [version, selectedCategory, selectedBuildingId, roomInput, reports]);

  // --- Complete & Log Timed Trial Helper ---
  const completeTimedTrialIfActive = useCallback(
    (outcomeLabel, locMethod) => {
      if (!timerRunning || !trialStartTime) return null;
      const finalMs = Date.now() - trialStartTime;
      const timeSec = Math.max(0.1, Number((finalMs / 1000).toFixed(2)));
      const newTrial = {
        id: `tr-${Date.now()}`,
        condition: version,
        timeSec,
        outcome: outcomeLabel,
        locationMethod: locMethod,
        timestamp: Date.now()
      };
      setTrials((prev) => [newTrial, ...prev]);
      setTimerRunning(false);
      setTrialStartTime(null);
      setElapsedMs(finalMs);
      return timeSec;
    },
    [timerRunning, trialStartTime, version]
  );

  // --- Handlers: Condition Switching ---
  const handleSwitchVersion = (newVer) => {
    setVersion(newVer);
    setFormError('');
    setBypassDuplicate(false);
    setShowManualFallbackInV2(false);
    if (newVer === 'v1') {
      // Clear auto-selected building so v1 genuinely tests manual building selection
      if (reportStep === 2) {
        setSelectedBuildingId('');
        setLocationMethodUsed('Manual Dropdown');
      }
    } else if (newVer === 'v2' && reportStep === 2 && naverGeocodeResult?.nearestBuildings?.[0]) {
      setSelectedBuildingId(naverGeocodeResult.nearestBuildings[0].id);
      setLocationMethodUsed('GPS Auto-Suggest');
    }
    showToast(
      newVer === 'v1'
        ? 'Switched to v1 (Pre-Pilot MVP · Manual Mode)'
        : 'Switched to v2 (Post-Pilot · GPS & Duplicate Detection)',
      'info'
    );
  };

  // --- Handlers: GPS Live & Simulated ---
  const handleSelectSimLocation = (simId) => {
    setUsingLiveGps(false);
    setGpsError('');
    setSimLocationId(simId);
    const preset = SIMULATED_LOCATIONS.find((l) => l.id === simId);
    if (preset) {
      fetchNaverReverseGeocode(preset.lat, preset.lng).then((res) => {
        setNaverGeocodeResult(res);
        if (version === 'v2' && res.nearestBuildings?.[0]) {
          setSelectedBuildingId(res.nearestBuildings[0].id);
          setLocationMethodUsed('GPS Auto-Suggest');
        }
      });
      showToast(`Simulated GPS moved to ${preset.label}`, 'info');
    }
  };

  const handleRequestLiveGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by this browser. Using simulated campus GPS.');
      return;
    }
    setGpsLoading(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLiveCoords(coords);
        setUsingLiveGps(true);
        setGpsLoading(false);
        fetchNaverReverseGeocode(coords.lat, coords.lng).then((res) => {
          setNaverGeocodeResult(res);
          if (version === 'v2' && res.nearestBuildings?.[0]) {
            setSelectedBuildingId(res.nearestBuildings[0].id);
            setLocationMethodUsed('GPS Auto-Suggest');
          }
          if (!res.isOnKnuCampus) {
            setGpsError(
              `Live GPS detected (${formatDistance(res.nearestBuildings[0].distanceMeters)} from KNU). You can switch back to a KNU campus preset anytime.`
            );
          } else {
            showToast('Live KNU campus GPS acquired!', 'success');
          }
        });
      },
      () => {
        setGpsLoading(false);
        setGpsError(
          'Location permission denied or unavailable indoors. Kept simulated KNU campus GPS active.'
        );
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  // --- Handlers: Report Workflow ---
  const resetReportForm = () => {
    setSelectedCategory(null);
    setSelectedBuildingId('');
    setRoomInput('');
    setDescription('');
    setPhotoPreview(null);
    setBypassDuplicate(false);
    setFormError('');
    setShowManualFallbackInV2(false);
    setReportStep(1);
  };

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    setFormError('');
    setBypassDuplicate(false);
    if (version === 'v2' && naverGeocodeResult?.nearestBuildings?.[0]) {
      setSelectedBuildingId(naverGeocodeResult.nearestBuildings[0].id);
      setLocationMethodUsed('GPS Auto-Suggest');
    } else {
      setSelectedBuildingId('');
      setLocationMethodUsed('Manual Dropdown');
    }
    setReportStep(2);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAttachSamplePhoto = () => {
    const cat = getCategoryById(selectedCategory || 'projector');
    const bldg = selectedBuildingId ? getBuildingById(selectedBuildingId) : null;
    const label = `${bldg ? bldg.shortName : 'KNU'} · ${roomInput.trim() || cat.sampleRoom}`;
    setPhotoPreview(generateSamplePhotoSvg(cat.id, label));
    showToast('Sample campus equipment photo attached', 'info');
  };

  const handleSubmitNewReport = (e) => {
    e.preventDefault();
    if (!selectedCategory) {
      setFormError('Please select an issue category.');
      return;
    }
    if (!selectedBuildingId) {
      setFormError('Please select a KNU campus building.');
      return;
    }
    if (!roomInput.trim()) {
      setFormError('Please enter a room number or floor location (e.g., 204 or 1F Lobby).');
      return;
    }

    const cat = getCategoryById(selectedCategory);
    const bldg = getBuildingById(selectedBuildingId);
    const formattedRoom = /^\d+[A-Za-z]?$/.test(roomInput.trim())
      ? `Room ${roomInput.trim()}`
      : roomInput.trim();

    const newReport = {
      id: `rep-knu-${Date.now()}`,
      category: selectedCategory,
      buildingId: selectedBuildingId,
      room: formattedRoom,
      description:
        description.trim() ||
        `${cat.labelEn} malfunction reported via photo evidence.`,
      status: 'Reported',
      createdAt: Date.now(),
      confirmations: 1,
      confirmedByMe: true,
      createdByMe: true,
      photoUrl:
        photoPreview ||
        generateSamplePhotoSvg(selectedCategory, `${bldg.shortName} · ${formattedRoom}`)
    };

    const recordedSec = completeTimedTrialIfActive('New Ticket', locationMethodUsed);

    setReports((prev) => [newReport, ...prev]);
    setRecentSubmissionBanner({
      type: 'created',
      title: 'Issue Reported Successfully',
      subtitle: `${bldg.shortName} · ${formattedRoom} (${cat.labelEn})`,
      recordedSec
    });
    resetReportForm();
    setDashboardTab('all');
    setStatusFilter('All');
    setActiveTab('dashboard');
    showToast(
      recordedSec
        ? `Report submitted in ${recordedSec.toFixed(1)}s!`
        : 'Report submitted to KNU Facilities!',
      'success'
    );
  };

  /**
   * v2 Feature 2 Action: One-tap "Confirm / +1 Issue (Me Too)" on a detected duplicate
   * Prevents redundant tickets (Constraints) while elevating priority (Distributed Cognition).
   */
  const handleConfirmDuplicateInStep2 = (dupReport) => {
    const bldg = getBuildingById(dupReport.buildingId);
    const cat = getCategoryById(dupReport.category);

    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== dupReport.id) return r;
        if (r.confirmedByMe) return r;
        return {
          ...r,
          confirmations: r.confirmations + 1,
          confirmedByMe: true
        };
      })
    );

    const recordedSec = completeTimedTrialIfActive(
      '+1 Duplicate Prevented',
      locationMethodUsed
    );

    setRecentSubmissionBanner({
      type: 'confirmed',
      title: 'Confirmed Existing Issue (+1)',
      subtitle: `Duplicate prevented · ${bldg.shortName} · ${dupReport.room} (${cat.labelEn})`,
      recordedSec
    });
    resetReportForm();
    setDashboardTab('mine');
    setStatusFilter('All');
    setActiveTab('dashboard');
    showToast(
      recordedSec
        ? `+1 Confirmed in ${recordedSec.toFixed(1)}s — duplicate avoided!`
        : '+1 Issue confirmed and added to My Reports!',
      'success'
    );
  };

  /**
   * v2 Dashboard Action: Toggle "+1 / Confirm" directly on active cards
   */
  const handleToggleDashboardUpvote = (reportId) => {
    if (version !== 'v2') return;
    let actionMsg = '';
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        if (r.createdByMe) {
          actionMsg = 'You already reported this issue';
          return r;
        }
        const nextConfirmed = !r.confirmedByMe;
        actionMsg = nextConfirmed
          ? '+1 Confirmation added · Saved to My Reports'
          : 'Confirmation removed';
        return {
          ...r,
          confirmedByMe: nextConfirmed,
          confirmations: Math.max(1, r.confirmations + (nextConfirmed ? 1 : -1))
        };
      })
    );
    if (actionMsg) showToast(actionMsg, 'info');
  };

  // --- Handlers: WSD Timer & Reset ---
  const handleStartTimedTrial = () => {
    resetReportForm();
    setRecentSubmissionBanner(null);
    setActiveTab('report');
    setReportStep(1);
    setTrialStartTime(Date.now());
    setElapsedMs(0);
    setTimerRunning(true);
    setDrawerOpen(false);
    showToast(`Timed WSD Trial started (${version.toUpperCase()})`, 'info');
  };

  const handleStopResetTimer = () => {
    setTimerRunning(false);
    setTrialStartTime(null);
    setElapsedMs(0);
  };

  const handleResetDemoData = () => {
    setReports(createInitialReports());
    setRecentSubmissionBanner(null);
    showToast('Restored 6 pre-seeded KNU campus reports', 'info');
  };

  // --- Derived Dashboard Lists ---
  const myReports = useMemo(
    () => reports.filter((r) => r.createdByMe || r.confirmedByMe),
    [reports]
  );

  const visibleReports = useMemo(() => {
    const base = dashboardTab === 'mine' ? myReports : reports;
    if (statusFilter === 'All') return base;
    return base.filter((r) => r.status === statusFilter);
  }, [dashboardTab, myReports, reports, statusFilter]);

  const currentStepNumber = activeTab === 'report' ? reportStep : 3;

  // ============================================================================
  // 8. RENDER UI (CENTERED SMARTPHONE VIEWPORT ON DESKTOP, FULL-BLEED ON MOBILE)
  // ============================================================================

  return (
    <div className="min-h-screen w-full bg-slate-200/80 sm:bg-gradient-to-br sm:from-slate-200 sm:via-slate-100 sm:to-rose-50/60 flex items-start sm:items-center justify-center sm:py-6 sm:px-4 font-sans text-[#0F172A] antialiased">
      {/* Smartphone Viewport Frame */}
      <div className="relative w-full max-w-[430px] min-h-screen sm:min-h-[820px] sm:h-[850px] bg-[#F8FAFC] sm:rounded-[34px] sm:shadow-[0_24px_70px_-15px_rgba(15,23,42,0.28)] sm:border-[6px] sm:border-slate-900/95 flex flex-col overflow-hidden">
        {/* ==================== TOP APP HEADER ==================== */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3.5 py-2.5">
          <div className="flex items-center justify-between gap-2">
            {/* Brand Logo & Title */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('report');
                setReportStep(1);
              }}
              className="flex items-center gap-2 text-left group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#DA2127] to-[#B91C1C] flex items-center justify-center shadow-sm shadow-red-600/25 shrink-0">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <div className="leading-tight">
                <div className="text-[15px] font-extrabold tracking-tight text-[#0F172A] flex items-center gap-1">
                  KNU <span className="text-[#DA2127]">FixIt</span>
                </div>
                <div className="text-[10px] font-medium text-slate-400">
                  경북대 시설신고
                </div>
              </div>
            </button>

            {/* Right Controls: Segmented v1/v2 Pill + HCI Drawer Button */}
            <div className="flex items-center gap-1.5">
              <div
                className="inline-flex items-center p-0.5 rounded-full bg-slate-100 border border-slate-200/90"
                role="group"
                aria-label="Prototype Version Toggle"
              >
                <button
                  type="button"
                  onClick={() => handleSwitchVersion('v1')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                    version === 'v1'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  v1 MVP
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchVersion('v2')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                    version === 'v2'
                      ? 'bg-[#DA2127] text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  v2 Enhanced
                </button>
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen((prev) => !prev)}
                className={`relative p-2 rounded-xl border transition-all ${
                  drawerOpen || showHciTags || timerRunning
                    ? 'bg-purple-50 border-purple-300 text-purple-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                title="Open HCI Study Controls"
                aria-label="Open HCI Study Controls"
              >
                <FlaskConical className="w-4 h-4" />
                {(timerRunning || showHciTags) && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-purple-600 border-2 border-white" />
                )}
              </button>
            </div>
          </div>

          {/* Live WSD Timer Ribbon (Only shown while a timed trial is running) */}
          {timerRunning && (
            <div className="mt-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#DA2127] animate-ping" />
                <span className="font-semibold">
                  WSD Trial ({version.toUpperCase()})
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-amber-300">
                  {(elapsedMs / 1000).toFixed(1)}s
                </span>
                <button
                  type="button"
                  onClick={handleStopResetTimer}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-white/15 hover:bg-white/25 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </header>

        {/* ==================== COLLAPSIBLE HCI STUDY DRAWER ==================== */}
        <HciStudyDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          version={version}
          onChangeVersion={handleSwitchVersion}
          timerRunning={timerRunning}
          elapsedMs={elapsedMs}
          onStartTrial={handleStartTimedTrial}
          onStopResetTimer={handleStopResetTimer}
          trials={trials}
          onClearTrials={() => {
            setTrials([]);
            showToast('WSD trial log cleared', 'info');
          }}
          simLocationId={simLocationId}
          usingLiveGps={usingLiveGps}
          gpsError={gpsError}
          onSelectSimLocation={handleSelectSimLocation}
          onRequestLiveGps={handleRequestLiveGps}
          showHciTags={showHciTags}
          onToggleHciTags={() => setShowHciTags((v) => !v)}
          onResetDemoData={handleResetDemoData}
        />

        {/* ==================== TOAST NOTIFICATION ==================== */}
        {toast && (
          <div className="absolute top-[68px] left-3 right-3 z-30 pointer-events-none flex justify-center">
            <div
              className={`px-3.5 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 max-w-full ${
                toast.tone === 'success'
                  ? 'bg-emerald-900 text-white border-emerald-700'
                  : 'bg-slate-900 text-white border-slate-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">{toast.message}</span>
            </div>
          </div>
        )}

        {/* ==================== SCROLLABLE MAIN CONTENT ==================== */}
        <main className="flex-1 overflow-y-auto px-4 pt-3.5 pb-24 space-y-4">
          {/* -------------------- REPORT ISSUE FLOW -------------------- */}
          {activeTab === 'report' && (
            <>
              {/* 3-Step Visual Progress Bar */}
              <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between">
                  {[
                    { num: 1, label: 'Category' },
                    { num: 2, label: 'Details' },
                    { num: 3, label: 'Submitted' }
                  ].map((step, idx) => {
                    const isActive = currentStepNumber === step.num;
                    const isCompleted = currentStepNumber > step.num;
                    return (
                      <React.Fragment key={step.num}>
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                              isCompleted
                                ? 'bg-emerald-600 text-white'
                                : isActive
                                ? 'bg-[#DA2127] text-white ring-4 ring-red-100'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.num}
                          </div>
                          <span
                            className={`text-xs font-bold ${
                              isActive
                                ? 'text-slate-900'
                                : isCompleted
                                ? 'text-emerald-700'
                                : 'text-slate-400'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                        {idx < 2 && (
                          <div
                            className={`flex-1 h-0.5 mx-2 rounded-full ${
                              currentStepNumber > step.num ? 'bg-emerald-500' : 'bg-slate-200'
                            }`}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* ========== STEP 1: CATEGORY SELECTION ========== */}
              {reportStep === 1 && (
                <section className="space-y-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between flex-wrap gap-1.5">
                      <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
                        What needs fixing?
                      </h1>
                      <HciBadge label="Recognition over Recall" visible={showHciTags} />
                    </div>
                    <p className="text-xs text-slate-500">
                      Tap a broken facility item below — no typing needed to start.
                    </p>
                  </div>

                  {/* 2x3 Visual Icon Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat.id)}
                        className="group bg-white hover:bg-rose-50/40 active:scale-[0.98] rounded-2xl p-4 border border-slate-200/90 hover:border-[#DA2127]/50 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2.5 min-h-[126px]"
                      >
                        <div
                          className={`w-14 h-14 rounded-2xl ${cat.accentBg} border ${cat.accentBorder} flex items-center justify-center group-hover:scale-105 transition-transform`}
                        >
                          <CategoryIcon categoryId={cat.id} className="w-9 h-9" />
                        </div>
                        <div className="leading-tight">
                          <div className="text-[13.5px] font-bold text-slate-900 group-hover:text-[#B91C1C]">
                            {cat.labelEn}
                          </div>
                          <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                            {cat.labelKo}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Subtle Context Footer Card */}
                  <div className="rounded-2xl bg-white border border-slate-200/80 p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800">
                          {version === 'v2'
                            ? 'v2 Smart Mode Active'
                            : 'v1 Baseline MVP Mode'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {version === 'v2'
                            ? 'Naver GPS auto-suggestion & duplicate checks ON'
                            : 'Standard manual building dropdown active'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('dashboard')}
                      className="text-xs font-bold text-[#DA2127] hover:underline shrink-0 inline-flex items-center"
                    >
                      Status <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </section>
              )}

              {/* ========== STEP 2: ISSUE DETAILS (v1 vs v2 ADAPTIVE) ========== */}
              {reportStep === 2 && selectedCategory && (
                <form onSubmit={handleSubmitNewReport} className="space-y-4">
                  {/* Selected Category Chip Header */}
                  <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-xl ${
                          getCategoryById(selectedCategory).accentBg
                        } border ${
                          getCategoryById(selectedCategory).accentBorder
                        } flex items-center justify-center shrink-0`}
                      >
                        <CategoryIcon categoryId={selectedCategory} className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                          Selected Category
                        </div>
                        <div className="text-sm font-extrabold text-slate-900">
                          {getCategoryById(selectedCategory).labelEn}{' '}
                          <span className="font-medium text-slate-400 text-xs">
                            ({getCategoryById(selectedCategory).labelKo})
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReportStep(1)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Change
                    </button>
                  </div>

                  {/* ---------- LOCATION SECTION: v1 MANUAL vs v2 NAVER GPS ---------- */}
                  {version === 'v1' ? (
                    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <label
                          htmlFor="v1-building-select"
                          className="text-xs font-bold text-slate-800 flex items-center gap-1.5"
                        >
                          <Building2 className="w-3.5 h-3.5 text-[#DA2127]" />
                          Campus Building <span className="text-[#DA2127]">*</span>
                        </label>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          v1 Manual List
                        </span>
                      </div>

                      <div className="relative">
                        <select
                          id="v1-building-select"
                          value={selectedBuildingId}
                          onChange={(e) => {
                            setSelectedBuildingId(e.target.value);
                            setLocationMethodUsed('Manual Dropdown');
                            setFormError('');
                          }}
                          className="w-full appearance-none rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#DA2127] focus:ring-2 focus:ring-red-100 px-3.5 py-3 pr-9 text-sm font-medium text-slate-900 outline-none transition-all"
                        >
                          <option value="">-- Select KNU Building --</option>
                          {alphabeticalBuildings.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.nameEn} ({b.nameKo})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  ) : (
                    /* v2 FEATURE 1: GPS + NAVER MAPS API BUILDING AUTO-SUGGESTION */
                    <div className="bg-white rounded-2xl p-3.5 border border-emerald-200/90 shadow-sm space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-[#03C75A]" />
                          <span className="text-xs font-extrabold text-slate-900">
                            Naver Maps · KNU Campus GPS
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <HciBadge label="Gulf of Execution ↓" visible={showHciTags} />
                          <HciBadge label="Cognitive Offloading" visible={showHciTags} />
                        </div>
                      </div>

                      {/* Interactive Naver-Style KNU Campus Mini-Map */}
                      <NaverKnuMiniMap
                        userCoords={activeCoords}
                        selectedBuildingId={selectedBuildingId}
                        nearestIds={
                          naverGeocodeResult?.nearestBuildings?.map((b) => b.id) || []
                        }
                        onSelectBuilding={(bId, method) => {
                          setSelectedBuildingId(bId);
                          setLocationMethodUsed(method);
                          setFormError('');
                        }}
                        locationSourceLabel={activeLocationSourceLabel}
                      />

                      {/* Live GPS + Quick Campus Simulator Bar */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                        <button
                          type="button"
                          onClick={handleRequestLiveGps}
                          disabled={gpsLoading}
                          className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                            usingLiveGps
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                          }`}
                        >
                          <LocateFixed className="w-3 h-3" />
                          {gpsLoading ? 'Locating...' : 'Use Live GPS'}
                        </button>
                        {SIMULATED_LOCATIONS.map((loc) => {
                          const active = !usingLiveGps && simLocationId === loc.id;
                          return (
                            <button
                              key={loc.id}
                              type="button"
                              onClick={() => handleSelectSimLocation(loc.id)}
                              className={`shrink-0 px-2 py-1.5 rounded-lg text-[10.5px] font-semibold border transition-colors ${
                                active
                                  ? 'bg-slate-900 text-white border-slate-900'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {loc.label}
                            </button>
                          );
                        })}
                      </div>

                      {gpsError && (
                        <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                          {gpsError}
                        </p>
                      )}

                      {/* Top 3 Nearest KNU Building One-Tap Suggestion Chips */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-700">
                            Suggested Nearest Buildings
                          </span>
                          {naverGeocodeResult && (
                            <span className="text-[10px] text-slate-400 truncate max-w-[175px]">
                              {naverGeocodeResult.roadAddressKo}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          {(naverGeocodeResult?.nearestBuildings || []).map((b, index) => {
                            const isSelected = selectedBuildingId === b.id;
                            return (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => {
                                  setSelectedBuildingId(b.id);
                                  setLocationMethodUsed('GPS Auto-Suggest');
                                  setFormError('');
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all ${
                                  isSelected
                                    ? 'bg-rose-50/80 border-[#DA2127] ring-2 ring-[#DA2127]/15'
                                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                      isSelected
                                        ? 'bg-[#DA2127] text-white'
                                        : index === 0
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-slate-200 text-slate-600'
                                    }`}
                                  >
                                    {isSelected ? <Check className="w-3 h-3" /> : index + 1}
                                  </span>
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-slate-900 truncate">
                                      {index === 0 ? '📍 ' : ''}
                                      {b.nameEn}
                                    </div>
                                    <div className="text-[10.5px] text-slate-500">
                                      {b.nameKo}
                                    </div>
                                  </div>
                                </div>
                                <span
                                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                                    isSelected
                                      ? 'bg-[#DA2127] text-white'
                                      : 'bg-emerald-100/80 text-emerald-800'
                                  }`}
                                >
                                  {formatDistance(b.distanceMeters)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Manual Building Fallback Accordion */}
                      <div className="pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setShowManualFallbackInV2((prev) => !prev)}
                          className="w-full flex items-center justify-between text-[11.5px] font-semibold text-slate-500 hover:text-slate-800 py-1"
                        >
                          <span>Choose another building manually</span>
                          {showManualFallbackInV2 ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {showManualFallbackInV2 && (
                          <div className="mt-1.5 relative">
                            <select
                              value={selectedBuildingId}
                              onChange={(e) => {
                                setSelectedBuildingId(e.target.value);
                                setLocationMethodUsed('Manual Dropdown');
                                setFormError('');
                              }}
                              className="w-full appearance-none rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#DA2127] px-3 py-2.5 pr-8 text-xs font-semibold text-slate-800 outline-none"
                            >
                              <option value="">-- All 10 KNU Buildings --</option>
                              {alphabeticalBuildings.map((b) => (
                                <option key={b.id} value={b.id}>
                                  {b.nameEn} ({b.nameKo})
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ---------- ROOM / LOCATION NUMBER INPUT ---------- */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="room-input"
                        className="text-xs font-bold text-slate-800"
                      >
                        Room / Floor Location <span className="text-[#DA2127]">*</span>
                      </label>
                      <span className="text-[10.5px] text-slate-400">
                        e.g., 204, 1F Lobby, 3F Reading Room
                      </span>
                    </div>

                    <input
                      id="room-input"
                      type="text"
                      value={roomInput}
                      onChange={(e) => {
                        setRoomInput(e.target.value);
                        setFormError('');
                      }}
                      placeholder={`e.g., ${getCategoryById(selectedCategory).sampleRoom}`}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#DA2127] focus:ring-2 focus:ring-red-100 px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                    />

                    {/* v2 Shared Awareness Hint Chip if active issues exist in this building */}
                    {version === 'v2' &&
                      activeBuildingCategoryReports.length > 0 &&
                      !detectedDuplicate && (
                        <div className="pt-0.5 space-y-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10.5px] font-semibold text-amber-700 inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Active {getCategoryById(selectedCategory).labelEn.toLowerCase()} report in{' '}
                              {getBuildingById(selectedBuildingId).shortName}:
                            </span>
                            {activeBuildingCategoryReports.map((rep) => (
                              <button
                                key={rep.id}
                                type="button"
                                onClick={() => setRoomInput(rep.room)}
                                className="px-2 py-0.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[10.5px] font-bold transition-colors"
                              >
                                {rep.room} ({rep.status}) · Check
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* ---------- v2 FEATURE 2: REAL-TIME DUPLICATE ALERT CARD ---------- */}
                  {version === 'v2' && detectedDuplicate && (
                    <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/70 to-rose-50 border-2 border-[#DA2127]/60 p-4 shadow-md space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-xl bg-[#DA2127] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-extrabold text-[#991B1B] leading-tight">
                              Already Reported · {formatRelativeTime(detectedDuplicate.createdAt)}
                            </div>
                            <div className="text-[11px] font-semibold text-slate-700 mt-0.5">
                              {getBuildingById(detectedDuplicate.buildingId).shortName} ·{' '}
                              {detectedDuplicate.room}
                            </div>
                          </div>
                        </div>
                        <StatusBadge status={detectedDuplicate.status} />
                      </div>

                      {/* HCI Overlay Badges */}
                      {showHciTags && (
                        <div className="flex flex-wrap gap-1.5">
                          <HciBadge label="Distributed Cognition" visible={showHciTags} />
                          <HciBadge label="Constraints" visible={showHciTags} />
                        </div>
                      )}

                      {/* Existing Report Preview */}
                      <div className="flex items-center gap-3 bg-white/90 rounded-xl p-2.5 border border-amber-200/80">
                        <img
                          src={detectedDuplicate.photoUrl}
                          alt="Existing issue thumbnail"
                          onClick={() =>
                            setLightboxData({
                              photo: detectedDuplicate.photoUrl,
                              title: `${getBuildingById(detectedDuplicate.buildingId).shortName} · ${detectedDuplicate.room}`,
                              subtitle: detectedDuplicate.description
                            })
                          }
                          className="w-16 h-12 rounded-lg object-cover border border-slate-200 shrink-0 cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-800 font-medium line-clamp-2 leading-snug">
                            &ldquo;{detectedDuplicate.description}&rdquo;
                          </p>
                          <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-amber-800">
                            <Users className="w-3 h-3" />
                            {detectedDuplicate.confirmations}{' '}
                            {detectedDuplicate.confirmations === 1 ? 'student' : 'students'} already
                            confirmed this issue
                          </div>
                        </div>
                      </div>

                      {/* Primary One-Tap CTA: Confirm / +1 Issue (Me Too) */}
                      <button
                        type="button"
                        onClick={() => handleConfirmDuplicateInStep2(detectedDuplicate)}
                        className="w-full py-3 px-4 rounded-xl bg-[#DA2127] hover:bg-[#B91C1C] active:scale-[0.99] text-white font-extrabold text-sm shadow-md shadow-red-600/20 flex items-center justify-center gap-2 transition-all"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Confirm / +1 Issue (Me Too)
                      </button>

                      {/* Secondary Subtle Override Link */}
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setBypassDuplicate((v) => !v)}
                          className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 underline underline-offset-2"
                        >
                          {bypassDuplicate
                            ? 'Hide separate report form'
                            : 'This is a different unit in the same room — submit separate report anyway'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ---------- PHOTO CAPTURE & OPTIONAL DESCRIPTION ---------- */}
                  {(!detectedDuplicate || bypassDuplicate || version === 'v1') && (
                    <>
                      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-[#DA2127]" />
                            Snap or Upload Photo
                          </span>
                          <HciBadge label="Cognitive Offloading" visible={showHciTags} />
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />

                        {photoPreview ? (
                          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                            <img
                              src={photoPreview}
                              alt="Uploaded issue preview"
                              className="w-full h-40 object-cover"
                            />
                            <div className="absolute top-2 right-2 flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-2.5 py-1 rounded-lg bg-slate-900/80 text-white text-[11px] font-semibold backdrop-blur-sm hover:bg-slate-900"
                              >
                                Retake
                              </button>
                              <button
                                type="button"
                                onClick={() => setPhotoPreview(null)}
                                className="p-1.5 rounded-lg bg-slate-900/80 text-white backdrop-blur-sm hover:bg-red-600"
                                aria-label="Remove photo"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full py-6 px-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#DA2127] bg-slate-50 hover:bg-rose-50/30 transition-all flex flex-col items-center justify-center gap-1.5 text-center"
                            >
                              <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-[#DA2127]">
                                <Camera className="w-5 h-5" />
                              </div>
                              <div className="text-xs font-bold text-slate-800">
                                Tap to Take Photo or Upload
                              </div>
                              <div className="text-[11px] text-slate-400">
                                A quick photo saves you from writing long details
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={handleAttachSamplePhoto}
                              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                              Attach Sample Photo (for Desktop Testing)
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Optional Short Description */}
                      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-2">
                        <label
                          htmlFor="desc-input"
                          className="text-xs font-bold text-slate-800 block"
                        >
                          Short Description{' '}
                          <span className="font-medium text-slate-400">
                            (Optional — photo is enough)
                          </span>
                        </label>
                        <textarea
                          id="desc-input"
                          rows={2}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="e.g., Flickering screen, leaking water, loose bolt..."
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#DA2127] focus:ring-2 focus:ring-red-100 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none resize-none transition-all"
                        />
                      </div>

                      {/* Validation Error */}
                      {formError && (
                        <div className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs font-semibold text-rose-700 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          {formError}
                        </div>
                      )}

                      {/* Submit CTA */}
                      <button
                        type="submit"
                        className="w-full py-3.5 px-4 rounded-2xl bg-[#DA2127] hover:bg-[#B91C1C] active:scale-[0.99] text-white font-extrabold text-sm shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {bypassDuplicate ? 'Submit Separate Report' : 'Submit Report'}
                      </button>
                    </>
                  )}
                </form>
              )}
            </>
          )}

          {/* -------------------- STEP 3 / STATUS DASHBOARD -------------------- */}
          {activeTab === 'dashboard' && (
            <section className="space-y-3.5">
              {/* Step 3 Submission Feedback Banner (Gulf of Evaluation) */}
              {recentSubmissionBanner && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 shadow-sm space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-emerald-950">
                          Step 3 Complete · {recentSubmissionBanner.title}
                        </div>
                        <div className="text-[11px] font-medium text-emerald-800 mt-0.5">
                          {recentSubmissionBanner.subtitle}
                        </div>
                        {recentSubmissionBanner.recordedSec && (
                          <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-950 text-[10px] font-bold font-mono">
                            <Timer className="w-3 h-3" />
                            WSD Trial Logged: {recentSubmissionBanner.recordedSec.toFixed(1)}s
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRecentSubmissionBanner(null)}
                      className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-700"
                      aria-label="Dismiss banner"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Dashboard Header & HCI Tags */}
              <div className="flex items-center justify-between flex-wrap gap-1.5">
                <div>
                  <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Campus Status Dashboard
                  </h1>
                  <p className="text-xs text-slate-500">
                    Real-time KNU Daegu repair transparency
                  </p>
                </div>
                <HciBadge label="Gulf of Evaluation" visible={showHciTags} />
              </div>

              {/* Segmented Tabs: All Reports vs My Reports */}
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-200/75 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setDashboardTab('all')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    dashboardTab === 'all'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Reports
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700">
                    {reports.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setDashboardTab('mine')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    dashboardTab === 'mine'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  My Reports
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-[#B91C1C]">
                    {myReports.length}
                  </span>
                </button>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {['All', 'Reported', 'In Progress', 'Fixed'].map((st) => {
                  const active = statusFilter === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        active
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>

              {/* Report Cards Feed */}
              {visibleReports.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    {dashboardTab === 'mine'
                      ? 'No personal reports yet'
                      : 'No matching issues found'}
                  </div>
                  <p className="text-xs text-slate-500">
                    {dashboardTab === 'mine'
                      ? version === 'v2'
                        ? 'Submit a new issue or tap +1 Confirm on an existing report.'
                        : 'Submit a new campus issue report to track its status here.'
                      : 'Try selecting a different status filter above.'}
                  </p>
                  {dashboardTab === 'mine' && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('report');
                        setReportStep(1);
                      }}
                      className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#DA2127] text-white text-xs font-bold shadow-sm"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Report an Issue
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleReports.map((rep) => {
                    const bldg = getBuildingById(rep.buildingId);
                    const cat = getCategoryById(rep.category);
                    const isActiveIssue = rep.status === 'Reported' || rep.status === 'In Progress';

                    return (
                      <article
                        key={rep.id}
                        className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-sm hover:shadow transition-shadow space-y-2.5"
                      >
                        {/* Top Row: Category Icon, Building/Room, Status Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-xl ${cat.accentBg} border ${cat.accentBorder} flex items-center justify-center shrink-0`}
                            >
                              <CategoryIcon categoryId={cat.id} className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="text-[13px] font-extrabold text-slate-900 truncate">
                                  {bldg.shortName} · {rep.room}
                                </h3>
                                {(rep.createdByMe || rep.confirmedByMe) && (
                                  <span className="px-1.5 py-0.5 rounded bg-rose-100 text-[#B91C1C] text-[9.5px] font-bold">
                                    {rep.createdByMe ? 'You' : 'You +1'}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <span className="font-semibold text-slate-600">{cat.labelEn}</span>
                                <span>·</span>
                                <span>{formatRelativeTime(rep.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          <StatusBadge status={rep.status} />
                        </div>

                        {/* Middle Row: Photo Thumbnail + Description */}
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setLightboxData({
                                photo: rep.photoUrl,
                                title: `${bldg.nameEn} · ${rep.room}`,
                                subtitle: `${cat.labelEn} — ${rep.status}`
                              })
                            }
                            className="relative group w-20 h-14 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 focus:outline-none"
                            aria-label="Enlarge issue photo"
                          >
                            <img
                              src={rep.photoUrl}
                              alt={`${cat.labelEn} at ${bldg.shortName}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 flex items-center justify-center transition-colors">
                              <Maximize2 className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>

                          <p className="text-xs text-slate-600 leading-relaxed flex-1">
                            {rep.description}
                          </p>
                        </div>

                        {/* Footer Row: Building Full Name + v2 Interactive +1 Confirm Pill */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <span className="text-[10.5px] text-slate-400 truncate">
                            {bldg.nameEn} ({bldg.nameKo})
                          </span>

                          {version === 'v2' && isActiveIssue ? (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <HciBadge
                                label="Shared Awareness"
                                visible={showHciTags && rep.id === visibleReports[0]?.id}
                              />
                              <button
                                type="button"
                                onClick={() => handleToggleDashboardUpvote(rep.id)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all active:scale-95 ${
                                  rep.confirmedByMe || rep.createdByMe
                                    ? 'bg-rose-50 border-[#DA2127] text-[#B91C1C]'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>
                                  {rep.confirmedByMe || rep.createdByMe ? 'Confirmed' : '+1 Confirm'}
                                </span>
                                <span className="px-1.5 py-0.2 rounded-full bg-white/80 text-[10px] font-extrabold">
                                  {rep.confirmations}
                                </span>
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 shrink-0">
                              <Users className="w-3 h-3" />
                              {rep.confirmations} {rep.confirmations === 1 ? 'report' : 'reports'}
                            </span>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </main>

        {/* ==================== BOTTOM NAVIGATION BAR ==================== */}
        <nav
          className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-2 grid grid-cols-2 gap-2"
          aria-label="Primary Navigation"
        >
          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-2xl transition-all ${
              activeTab === 'report'
                ? 'bg-rose-50 text-[#DA2127]'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <PlusCircle
              className={`w-5 h-5 ${activeTab === 'report' ? 'stroke-[2.4]' : 'stroke-[2]'}`}
            />
            <span className="text-[11px] font-bold">Report Issue</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`relative flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-2xl transition-all ${
              activeTab === 'dashboard'
                ? 'bg-rose-50 text-[#DA2127]'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <ClipboardList
                className={`w-5 h-5 ${activeTab === 'dashboard' ? 'stroke-[2.4]' : 'stroke-[2]'}`}
              />
              <span className="absolute -top-1.5 -right-3 min-w-[18px] h-[16px] px-1 rounded-full bg-slate-900 text-white text-[9.5px] font-bold flex items-center justify-center">
                {reports.length}
              </span>
            </div>
            <span className="text-[11px] font-bold">Status Dashboard</span>
          </button>
        </nav>

        {/* ==================== PHOTO LIGHTBOX MODAL ==================== */}
        <PhotoLightboxModal
          photo={lightboxData?.photo}
          title={lightboxData?.title}
          subtitle={lightboxData?.subtitle}
          onClose={() => setLightboxData(null)}
        />
      </div>
    </div>
  );
}