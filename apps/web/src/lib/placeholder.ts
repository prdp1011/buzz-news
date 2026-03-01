/** SVG placeholder image for posts without cover images */
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#27272a"/>
          <stop offset="100%" stop-color="#18181b"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#bg)"/>
      <g fill="none" stroke="#52525b" stroke-width="1.5" opacity="0.5">
        <rect x="280" y="150" width="240" height="150" rx="8"/>
        <path d="M300 220 L360 180 L420 230 L480 170 L540 210"/>
        <circle cx="340" cy="260" r="25"/>
      </g>
      <text x="400" y="350" fill="#71717a" font-family="system-ui,sans-serif" font-size="14" text-anchor="middle">No image</text>
    </svg>`
  );
