import React from "react";

const GLYPHS = {
  aries: (
    <>
      <path d="M -9 8 C -9 -4 -3 -9 0 0" />
      <path d="M 9 8 C 9 -4 3 -9 0 0" />
    </>
  ),
  taurus: (
    <>
      <path d="M -10 -8 C -6 -2 6 -2 10 -8" />
      <circle cx="0" cy="4" r="7" />
    </>
  ),
  gemini: (
    <>
      <path d="M -8 -9 C -3 -7 3 -7 8 -9" />
      <path d="M -8 9 C -3 7 3 7 8 9" />
      <path d="M -5 -7 L -5 7" />
      <path d="M 5 -7 L 5 7" />
    </>
  ),
  cancer: (
    <>
      <path d="M -10 -2 C -4 -8 8 -7 10 -1" />
      <path d="M 10 2 C 4 8 -8 7 -10 1" />
      <circle cx="-5" cy="0" r="3.4" />
      <circle cx="5" cy="0" r="3.4" />
    </>
  ),
  leo: (
    <>
      <path d="M -7 7 C -2 0 -5 -9 1 -9 C 7 -9 7 -1 2 2" />
      <path d="M 2 2 C 10 1 9 8 3 8" />
    </>
  ),
  virgo: (
    <>
      <path d="M -10 -7 L -10 8" />
      <path d="M -4 -7 L -4 8" />
      <path d="M 2 -7 L 2 8" />
      <path d="M 2 -1 C 11 -1 11 8 3 8 C 9 7 11 1 6 -3" />
    </>
  ),
  libra: (
    <>
      <path d="M -10 7 L 10 7" />
      <path d="M -10 2 L -4 2 C -4 -5 4 -5 4 2 L 10 2" />
    </>
  ),
  scorpio: (
    <>
      <path d="M -10 -7 L -10 8" />
      <path d="M -4 -7 L -4 8" />
      <path d="M 2 -7 L 2 6" />
      <path d="M 2 6 C 7 8 10 5 9 1" />
      <path d="M 9 1 L 11 4" />
    </>
  ),
  sagittarius: (
    <>
      <path d="M -8 8 L 8 -8" />
      <path d="M 0 -8 L 8 -8 L 8 0" />
      <path d="M -8 -2 L 2 8" />
    </>
  ),
  capricorn: (
    <>
      <path d="M -10 -7 L -10 8" />
      <path d="M -10 -4 C -4 -10 1 -2 0 6" />
      <path d="M 0 6 C 0 11 9 10 9 3 C 9 -2 3 -2 2 3" />
    </>
  ),
  aquarius: (
    <>
      <path d="M -11 -2 C -7 -6 -4 2 0 -2 C 4 -6 7 2 11 -2" />
      <path d="M -11 6 C -7 2 -4 10 0 6 C 4 2 7 10 11 6" />
    </>
  ),
  pisces: (
    <>
      <path d="M -8 -9 C -3 -4 -3 4 -8 9" />
      <path d="M 8 -9 C 3 -4 3 4 8 9" />
      <path d="M -9 0 L 9 0" />
    </>
  ),
};

export function ZodiacGlyph({ id, x, y }) {
  return (
    <g className="wheel-zodiac-label wheel-zodiac-glyph" transform={`translate(${x} ${y})`}>
      {GLYPHS[id] ?? null}
    </g>
  );
}
