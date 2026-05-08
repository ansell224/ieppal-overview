import { useEffect, useState } from 'react';

// Messages cycle every 2.5s. They describe what the backend is doing, not a
// promise of progress. The AI call is a single blocking request and we don't
// know when it will finish, so avoid "Almost there..." style lies.

export const AI_GOAL_MESSAGES = [
  "Pulling this student's profile...",
  "Reading their IEP reports...",
  "Reviewing existing goals and survey trends...",
  "Checking which past strategies actually worked...",
  "Drafting goal suggestions from the evidence...",
  "Tightening the wording for clarity...",
  "Still working...",
];

export const AI_STRATEGY_MESSAGES = [
  "Pulling this student's profile...",
  "Reading IEP reports and goal context...",
  "Scoring strategies from the library...",
  "Filtering out strategies already marked as not working...",
  "Ranking the best picks for this goal...",
  "Writing the match reasoning...",
  "Still working...",
];

export const AI_SURVEY_MESSAGES = [
  "Reading this goal's details...",
  "Pulling student and classroom context...",
  "Drafting survey questions that measure progress...",
  "Checking each question is specific and answerable...",
  "Still working...",
];

export const AI_DOC_MESSAGES = [
  "Uploading documents...",
  "Reading the text...",
  "Running OCR on any scanned pages...",
  "Loading the destination template...",
  "Matching your document to each template field...",
  "Scoring confidence for every match...",
  "Still working...",
];

export default function AiLoadingAnimation({
  messages = AI_GOAL_MESSAGES,
  hint = 'This usually takes 5-10 seconds',
  compact = false,
}) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className={`flex flex-col items-center justify-center ${compact ? 'py-8 space-y-4' : 'py-16 space-y-5'}`}>
      <div className="w-14 h-14 relative">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-200 to-orange-200 dark:from-pink-800/60 dark:to-orange-800/60 animate-spin" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-1 rounded-full bg-white dark:bg-neutral-800" />
        <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-14 h-14 animate-spin" style={{ animationDuration: '2s' }}>
          <g transform="translate(0,500) scale(0.1,-0.1)" fill="currentColor" stroke="none" className="text-neutral-900 dark:text-neutral-100">
            <path d="M2155 4859 c-257 -37 -457 -100 -710 -224 -817 -398 -1326 -1217 -1326 -2134 0 -390 76 -717 247 -1060 378 -763 1098 -1245 1969 -1320 235 -20 567 17 831 93 401 116 747 325 1044 632 377 389 592 847 661 1407 17 143 7 479 -20 630 -63 354 -180 654 -364 930 -296 442 -677 743 -1178 930 -136 51 -260 82 -451 111 -210 33 -497 35 -703 5z m525 -510 c725 -66 1349 -563 1580 -1256 195 -586 94 -1218 -271 -1706 -108 -144 -300 -327 -446 -424 -218 -146 -427 -234 -692 -290 -116 -26 -143 -28 -351 -27 -205 0 -236 3 -351 27 -416 88 -769 286 -1029 579 -328 370 -496 833 -477 1318 11 266 69 503 181 737 262 545 790 939 1377 1027 186 28 301 32 479 15z" />
            <path d="M2182 3594 c-182 -90 -218 -331 -72 -473 110 -107 290 -106 399 1 59 59 83 110 89 189 6 90 -16 154 -76 218 -64 68 -117 91 -213 91 -61 0 -85 -5 -127 -26z" />
            <path d="M3394 3596 c-60 -28 -116 -82 -144 -140 -31 -65 -28 -185 6 -254 28 -56 73 -100 137 -134 64 -34 184 -32 253 4 58 31 108 83 135 142 27 59 26 185 -1 242 -50 102 -149 164 -265 164 -53 0 -83 -6 -121 -24z" />
            <path d="M2265 2626 c-95 -44 -146 -127 -146 -238 0 -104 41 -167 154 -242 341 -225 792 -258 1151 -86 91 44 221 126 248 156 58 68 79 162 53 250 -22 76 -96 153 -168 173 -77 22 -158 10 -226 -34 -157 -101 -289 -141 -439 -132 -133 8 -237 44 -347 120 -28 18 -65 39 -84 45 -56 20 -140 15 -196 -12z" />
          </g>
        </svg>
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200 transition-all duration-500">
          {messages[messageIndex]}
        </p>
        {hint && <p className="text-xs text-neutral-400 dark:text-neutral-500">{hint}</p>}
      </div>
    </div>
  );
}
