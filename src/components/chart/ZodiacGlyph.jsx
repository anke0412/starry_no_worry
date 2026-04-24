import React from "react";

const GLYPHS = {
  aries: (
    <>
      <path d="M -8 8 C -8 -1 -4 -6 0 1" />
      <path d="M 8 8 C 8 -1 4 -6 0 1" />
    </>
  ),
  taurus: (
    <>
      <path d="M -9 -6 C -6 -1 -3 0 0 0 C 3 0 6 -1 9 -6" />
      <circle cx="0" cy="5" r="6.2" />
    </>
  ),
  gemini: (
    <>
      <path d="M -7 -8 C -2 -6 2 -6 7 -8" />
      <path d="M -7 8 C -2 6 2 6 7 8" />
      <path d="M -4.8 -6.5 L -4.8 6.5" />
      <path d="M 4.8 -6.5 L 4.8 6.5" />
    </>
  ),
  cancer: (
    <>
      <path d="M -9 -2 C -4 -7 6 -6 8 -1" />
      <path d="M 9 2 C 4 7 -6 6 -8 1" />
      <circle cx="-4.2" cy="0" r="2.8" />
      <circle cx="4.2" cy="0" r="2.8" />
    </>
  ),
  leo: (
    <>
      <path d="M -6 7 C -2 2 -3 -7 2 -7 C 7 -7 7 -1 2 2" />
      <path d="M 2 2 C 8 2 9 7 4 8" />
    </>
  ),
  virgo: (
    <>
      <path d="M -9 -7 L -9 8" />
      <path d="M -3.5 -7 L -3.5 8" />
      <path d="M 2 -7 L 2 8" />
      <path d="M 2 -1 C 9 -1 9 8 3 8 C 7 6 8 1 4 -3" />
    </>
  ),
  libra: (
    <>
      <path d="M -9 7 L 9 7" />
      <path d="M -9 2 L -3.5 2 C -3.5 -3.5 3.5 -3.5 3.5 2 L 9 2" />
    </>
  ),
  scorpio: (
    <>
      <path d="M -9 -7 L -9 8" />
      <path d="M -3.5 -7 L -3.5 8" />
      <path d="M 2 -7 L 2 6" />
      <path d="M 2 6 C 6 7.5 8.5 5 8 1" />
      <path d="M 8 1 L 10 3.4" />
    </>
  ),
  sagittarius: (
    <>
      <path d="M -7.5 7.5 L 7.5 -7.5" />
      <path d="M 0 -7.5 L 7.5 -7.5 L 7.5 0" />
      <path d="M -7.5 -2 L 2 7.5" />
    </>
  ),
  capricorn: (
    <>
      <path d="M -9 -7 L -9 8" />
      <path d="M -9 -4 C -4 -8 0 -2 -0.5 5" />
      <path d="M -0.5 5 C -0.5 9.5 7 9 7 3.5 C 7 -0.5 2 -1 1.2 2.8" />
    </>
  ),
  aquarius: (
    <>
      <path d="M -10 -2 C -6 -5.5 -3 1.5 0 -2 C 3 -5.5 6 1.5 10 -2" />
      <path d="M -10 5 C -6 1.5 -3 8.5 0 5 C 3 1.5 6 8.5 10 5" />
    </>
  ),
  pisces: (
    <>
      <path d="M -7 -8 C -2 -4 -2 4 -7 8" />
      <path d="M 7 -8 C 2 -4 2 4 7 8" />
      <path d="M -8 0 L 8 0" />
    </>
  ),
};

export function ZodiacGlyph({ id, x, y }) {
  const glyph = GLYPHS[id] ?? null;

  return (
    <g className="wheel-zodiac-label wheel-zodiac-glyph" transform={`translate(${x} ${y})`}>
      <circle className="wheel-zodiac-glyph-halo" cx="0" cy="0" r="11.6" />
      <g className="wheel-zodiac-glyph-backdrop">{glyph}</g>
      <g className="wheel-zodiac-glyph-foreground">{glyph}</g>
    </g>
  );
}
