/**
 * MoroccanDivider — 40px SVG band with tiled 8-pointed star.
 * Appears once, between the photo strip and page content.
 * Uses var(--border) at opacity 0.4 — the single Moroccan decoration.
 */
export default function MoroccanDivider() {
  return (
    <div
      aria-hidden="true"
      style={{
        height: '40px',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <svg
        width="100%"
        height="40"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <defs>
          <pattern
            id="moroccan-star"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            {/* 8-pointed star: square + 45° rotated square */}
            <g transform="translate(20,20)" fill="var(--border)" opacity="0.4">
              <polygon points="0,-7 2.8,-2.8 7,0 2.8,2.8 0,7 -2.8,2.8 -7,0 -2.8,-2.8" />
              <polygon
                points="0,-7 2.8,-2.8 7,0 2.8,2.8 0,7 -2.8,2.8 -7,0 -2.8,-2.8"
                transform="rotate(45)"
              />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="40" fill="url(#moroccan-star)" />
      </svg>
    </div>
  );
}
