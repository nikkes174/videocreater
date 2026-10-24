import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { PageCam2D, resolveCamAt2D, type CamKey2D } from "../vendor/videoShotcraft/demos/_fixtures/PageCam2D";
import { EASE, FONT, Grain, ramp } from "../vendor/videoShotcraft/demos/_fixtures/Polish";
import { alpha, Dust, LOOKS } from "../vendor/videoShotcraft/demos/_fixtures/Look";

// Adapted from video-shotcraft/demos/opening/spotlight-hero-card/SpotlightHeroCard.tsx.
// Uses the original PageCam2D, moving pool, page-space light hole, lift/hover/reseat,
// paired contour sweeps, spatial note, and deterministic Dust. See THIRD_PARTY_NOTICES.md.
export const UNLIMITSUB_SPOTLIGHT_PRODUCT_DURATION = 172;
export const UNLIMITSUB_SPOTLIGHT_PRODUCT_FPS = 30;

const WIDTH = 1920;
const HEIGHT = 1080;
const SOURCE_WIDTH = 1728;
const SOURCE_HEIGHT = 743;
const PAGE_SCALE = WIDTH / SOURCE_WIDTH;
const PAGE_HEIGHT = SOURCE_HEIGHT * PAGE_SCALE;
const CARD_SOURCE_RECT = { x: 1152, y: 367, width: 288, height: 352 } as const;
const CARD = {
  x: CARD_SOURCE_RECT.x * PAGE_SCALE,
  y: CARD_SOURCE_RECT.y * PAGE_SCALE,
  w: CARD_SOURCE_RECT.width * PAGE_SCALE,
  h: CARD_SOURCE_RECT.height * PAGE_SCALE,
};
const MCX = CARD.x + CARD.w / 2;
const MCY = CARD.y + CARD.h / 2;
const RADIUS = 18;

const LOCK = 34;
const PUSH0 = 40;
const PUSH1 = 58;
const RISE0 = 56;
const RISE1 = 66;
const RESEAT0 = 124;
const LAND = 142;

const PUSH_EASE = Easing.bezier(0.35, 0, 0.2, 1);
const POP_EASE = Easing.bezier(0.2, 1.25, 0.3, 1);
const RESEAT_EASE = Easing.bezier(0.4, 0, 0.3, 1.05);
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const COLORS = {
  background: "#03080D",
  graphite: "#11181B",
  teal: "#39D5C7",
  coolLight: "#72DEDB",
  silver: "#EAF6F5",
  secondary: "#9EB5BA",
  shadow: "#02070A",
};
const LOOK = LOOKS.graphite;

const CAM_KEYS: CamKey2D[] = [
  { frame: 0, cx: WIDTH / 2, cy: PAGE_HEIGHT / 2, zoom: 0.8, rotX: 0, rotY: 0, rotZ: 0, persp: 1200 },
  { frame: PUSH0, cx: WIDTH / 2, cy: PAGE_HEIGHT / 2, zoom: 0.8, rotX: 0, rotY: 0, rotZ: 0, persp: 1200 },
  { frame: PUSH1, cx: MCX - 105, cy: MCY - 10, zoom: 2.6, rotX: 8, rotY: 34, rotZ: 2, persp: 1200 },
  { frame: UNLIMITSUB_SPOTLIGHT_PRODUCT_DURATION, cx: MCX - 105, cy: MCY - 10, zoom: 2.6, rotX: 8, rotY: 34, rotZ: 2, persp: 1200 },
];

const CardAnnotationCamera: React.FC<{ frame: number; children: React.ReactNode }> = ({ frame, children }) => {
  const cam = resolveCamAt2D(frame, CAM_KEYS, PUSH_EASE);
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          perspective: `${cam.persp * cam.zoom}px`,
          perspectiveOrigin: "960px 540px",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: WIDTH,
            height: PAGE_HEIGHT,
            zoom: cam.zoom,
            transformOrigin: `${cam.cx}px ${cam.cy}px`,
            transformStyle: "preserve-3d",
            transform: `translate(${960 / cam.zoom - cam.cx}px, ${540 / cam.zoom - cam.cy}px) rotateY(${cam.rotY}deg) rotateX(${cam.rotX}deg) rotateZ(${cam.rotZ}deg)`,
          }}
        >
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const UnlimitSubSpotlightProduct: React.FC = () => {
  const frame = useCurrentFrame();

  // Search path: three held intermediate stops, then settle exactly on the
  // product's screen-space position before the camera starts its close push.
  const spotlightStops = [4, 10, 13, 19, 22, 28, LOCK, PUSH1];
  const spotX = interpolate(frame, spotlightStops, [24, 24, 72, 72, 38, 38, 70, 64], {
    ...CLAMP,
    easing: EASE.smooth,
  });
  const spotY = interpolate(frame, spotlightStops, [30, 30, 40, 40, 62, 62, 64, 52], {
    ...CLAMP,
    easing: EASE.smooth,
  });

  // Original shutter-like on pulse: bright, one-frame dip, then steady.
  const lamp = interpolate(frame, [1, 3, 4, 6], [0, 1, 0.62, 1], CLAMP);
  const poolBase = interpolate(frame, [22, LOCK, PUSH1], [400, 300, 470], {
    ...CLAMP,
    easing: EASE.swift,
  });
  const lockPulse = interpolate(frame, [LOCK, LOCK + 4, LOCK + 10], [0, 0.06, 0], CLAMP);
  const breathe = 1 + 0.015 * Math.sin((frame - LAND) / 14) * ramp(frame, LAND, 20, EASE.out);
  const poolRx = poolBase * (1 + lockPulse) * breathe;
  const poolRy = poolBase * interpolate(frame, [PUSH0, PUSH1], [0.8, 0.92], CLAMP) * (1 + lockPulse) * breathe;
  const outerDark = interpolate(frame, [0, LOCK, PUSH1], [0.9, 0.92, 0.94], CLAMP);
  const cardLight = ramp(frame, LOCK + 4, PUSH1 - LOCK - 4, EASE.smooth);
  const holdBreath = 1 + 0.012 * Math.sin((frame - LAND) / 14) * ramp(frame, LAND, 20, EASE.out);

  // Original rise → floating hover → reseat timing and 3D overshoot curve.
  const rise = interpolate(frame, [RISE0, RISE1], [0, 1], { ...CLAMP, easing: POP_EASE });
  const reseat = interpolate(frame, [RESEAT0, LAND], [0, 1], { ...CLAMP, easing: RESEAT_EASE });
  const lift = rise * (1 - reseat);
  const bob = Math.sin(((frame - RISE1) / 40) * Math.PI * 2) * 4 * lift;
  const z = 110 * lift + bob;
  const landed = frame >= LAND;
  const press = interpolate(frame, [LAND - 4, LAND - 1, LAND], [1, 0.997, 1], CLAMP);
  const shadow = `${-10 * lift}px ${10 * lift}px ${12 + 12 * lift}px rgba(2,7,10,${0.35 * lift}), ${-36 * lift}px ${48 * lift}px ${90 * lift}px rgba(2,7,10,${0.42 * lift})`;
  const slotVisibility = Math.min(1, rise * 2) * (1 - reseat);
  const landingPulse = interpolate(frame, [LAND - 4, LAND, LAND + 14], [0, 1, 0], CLAMP);
  const slotEdge = Math.min(1, 0.45 * (1 - reseat)) + landingPulse * 0.5;

  // Keep the original split focus treatment: circle while searching, then a
  // card-shaped page-space light hole so the whole product tile remains crisp.
  const beamOneProgress = interpolate(frame, [68, 82], [0, 1], { ...CLAMP, easing: EASE.linear });
  const beamOneOn = frame >= 67 && frame <= 83;
  const beamTwoProgress = interpolate(frame, [88, 108], [0, 1], { ...CLAMP, easing: EASE.swift });
  const beamTwoOn = frame >= 87 && frame <= 109;
  const beamTrail = interpolate(frame, [108, 122], [0.4, 0], CLAMP);
  const hiresIn = interpolate(frame, [PUSH0, PUSH0 + 6], [0, 1], CLAMP);
  const edgeLight = 0.5 * Math.min(1, lift + ramp(frame, PUSH0, 16, EASE.linear));

  // Page-space soft cutout, 3D note entrance and teal marker bar.
  const noteIn = ramp(frame, 70, 14, EASE.out);
  const noteSettle = interpolate(frame, [RESEAT0 - 4, LAND], [0, 1], { ...CLAMP, easing: RESEAT_EASE });
  const noteZ = 4 + (88 + Math.sin(((frame - 70) / 44) * Math.PI * 2) * 3) * (1 - noteSettle);
  const marker = ramp(frame, 84, 12, EASE.swift);

  const px = (spotX / 100) * WIDTH;
  const py = (spotY / 100) * HEIGHT;
  const sourceX = px + 420;
  const sourceY = -720;
  const coneWidth = poolRx * 0.6;
  const cone = `${sourceX - 26}px ${sourceY}px, ${sourceX + 26}px ${sourceY}px, ${px + coneWidth}px ${py}px, ${px - coneWidth}px ${py}px`;
  const beamWidth = CARD.w + 6;
  const beamHeight = CARD.h + 6;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      <PageCam2D
        src="assets/site-tour/img_3.png"
        pageH={PAGE_HEIGHT}
        keys={CAM_KEYS}
        ease={PUSH_EASE}
        bg={COLORS.background}
      >
        {/* Subtle leading edge gives the captured page a real plane in the dark. */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 8,
            background: "rgba(57,213,199,0.56)",
            filter: "blur(6px)",
            opacity: edgeLight,
            pointerEvents: "none",
          }}
        />

        {/* The soft-edged aperture is in page space, beneath the floating card. */}
        {cardLight > 0.001 ? (
          <svg
            width={WIDTH}
            height={PAGE_HEIGHT}
            style={{ position: "absolute", left: 0, top: 0, transform: "translateZ(1px)", opacity: cardLight, pointerEvents: "none" }}
          >
            <defs>
              <filter id="unlimitsub-spot-tight" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="22" />
              </filter>
              <filter id="unlimitsub-spot-wide" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="60" />
              </filter>
              <mask id="unlimitsub-spot-hole" maskUnits="userSpaceOnUse" x={0} y={0} width={WIDTH} height={PAGE_HEIGHT}>
                <rect x={0} y={0} width={WIDTH} height={PAGE_HEIGHT} fill="white" />
                <rect x={CARD.x - 60} y={CARD.y - 50} width={CARD.w + 120} height={CARD.h + 100} rx={70} fill="#262626" filter="url(#unlimitsub-spot-wide)" />
                <rect x={CARD.x - 14} y={CARD.y - 14} width={CARD.w + 28} height={CARD.h + 28} rx={RADIUS + 14} fill="black" filter="url(#unlimitsub-spot-tight)" />
              </mask>
            </defs>
            <rect
              x={0}
              y={0}
              width={WIDTH}
              height={PAGE_HEIGHT}
              fill="rgb(3,8,13)"
              fillOpacity={Math.min(0.97, 0.94 * holdBreath)}
              mask="url(#unlimitsub-spot-hole)"
            />
          </svg>
        ) : null}

        <div style={{ transformStyle: "preserve-3d" }}>
          {/* Black page-color patch hides the original tile while the hero rises. */}
          {slotVisibility > 0.02 || landingPulse > 0.02 ? (
            <div
              style={{
                position: "absolute",
                left: CARD.x - 2,
                top: CARD.y - 2,
                width: CARD.w + 4,
                height: CARD.h + 4,
                transform: "translateZ(1.5px)",
                background: slotVisibility > 0.02 ? "#000000" : "transparent",
                borderRadius: RADIUS,
                boxShadow: `inset 0 0 26px rgba(57,213,199,${(0.14 * slotEdge).toFixed(3)})`,
                opacity: Math.max(slotVisibility, landingPulse),
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: RADIUS,
                  border: `1.5px solid ${COLORS.teal}`,
                  opacity: slotEdge,
                  boxShadow: landingPulse > 0.02 ? `0 0 ${(24 * landingPulse).toFixed(1)}px ${alpha(COLORS.teal, 0.78)}` : undefined,
                }}
              />
            </div>
          ) : null}

          {/* Exact product tile captured from the catalogue; the high-res PNG
              fades over the same source pixels during the camera push. */}
          <div
            style={{
              position: "absolute",
              left: CARD.x,
              top: CARD.y,
              width: CARD.w,
              height: CARD.h,
              transform: `translateZ(${(z + 2).toFixed(2)}px) scale(${press})`,
              transformOrigin: "center center",
              transformStyle: "preserve-3d",
            }}
          >
            <div style={{ position: "absolute", inset: 0, borderRadius: RADIUS, overflow: "hidden", boxShadow: landed ? "none" : shadow }}>
              <Img
                src={staticFile("assets/site-tour/apple-1000.png")}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", opacity: hiresIn }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(200deg, rgba(114,222,219,0.20), rgba(114,222,219,0) 45%, rgba(3,8,13,0.06) 100%)",
                  opacity: lift,
                  pointerEvents: "none",
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: RADIUS,
                boxShadow: `inset 0 0 0 1px rgba(234,246,245,${(0.7 * lift).toFixed(3)}), 0 0 0 1.5px rgba(57,213,199,${(0.72 * cardLight).toFixed(3)}), 0 0 34px rgba(57,213,199,${(0.14 * cardLight).toFixed(3)})`,
                pointerEvents: "none",
              }}
            />
            {(beamOneOn || beamTwoOn) && lift > 0.4 ? (
              <svg
                width={beamWidth}
                height={beamHeight}
                viewBox={`0 0 ${beamWidth} ${beamHeight}`}
                style={{
                  position: "absolute",
                  left: -3,
                  top: -3,
                  overflow: "visible",
                  pointerEvents: "none",
                  opacity: beamOneOn ? 1 : 0.62,
                  filter: `drop-shadow(0 0 6px ${alpha(COLORS.teal, 0.9)}) drop-shadow(0 0 18px rgba(114,222,219,0.48))`,
                }}
              >
                <rect
                  x={2}
                  y={2}
                  width={beamWidth - 4}
                  height={beamHeight - 4}
                  rx={RADIUS}
                  fill="none"
                  stroke={COLORS.teal}
                  strokeWidth={beamOneOn ? 5 : 3.5}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray="0.16 1"
                  strokeDashoffset={-(beamOneOn ? beamOneProgress : beamTwoProgress)}
                />
                <rect
                  x={2}
                  y={2}
                  width={beamWidth - 4}
                  height={beamHeight - 4}
                  rx={RADIUS}
                  fill="none"
                  stroke="rgba(234,246,245,0.98)"
                  strokeWidth={beamOneOn ? 2.5 : 1.75}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray="0.16 1"
                  strokeDashoffset={-(beamOneOn ? beamOneProgress : beamTwoProgress)}
                />
              </svg>
            ) : null}
            {beamTrail > 0.01 ? (
              <div
                style={{
                  position: "absolute",
                  inset: -3,
                  borderRadius: RADIUS + 3,
                  border: `1.5px solid ${COLORS.teal}`,
                  opacity: beamTrail,
                  pointerEvents: "none",
                }}
              />
            ) : null}
          </div>
        </div>
      </PageCam2D>

      {/* Screen-space lighting: theatrical dim, travelling soft pool, and a
          teal volume beam. No hard-edged circle or extra decorative graphics. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(${(poolRx * 1.35).toFixed(1)}px ${(poolRy * 1.35).toFixed(1)}px at ${spotX}% ${spotY}%, rgba(3,8,13,0) 0%, rgba(3,8,13,0) 26%, rgba(3,8,13,${(outerDark * 0.25).toFixed(3)}) 44%, rgba(3,8,13,${(outerDark * 0.62).toFixed(3)}) 62%, rgba(3,8,13,${(outerDark * 0.9).toFixed(3)}) 80%, rgba(3,8,13,${outerDark.toFixed(3)}) 100%)`,
          mixBlendMode: "multiply",
          pointerEvents: "none",
          opacity: lamp * (1 - cardLight),
        }}
      />
      <AbsoluteFill
        style={{
          background: "rgba(3,8,13,1)",
          mixBlendMode: "multiply",
          opacity: 0.84 * (1 - lamp),
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(${(poolRx * 1.2).toFixed(1)}px ${(poolRy * 1.2).toFixed(1)}px at ${spotX}% ${spotY}%, rgba(57,213,199,0.18) 0%, rgba(57,213,199,0.09) 50%, rgba(57,213,199,0) 80%)`,
          mixBlendMode: "soft-light",
          pointerEvents: "none",
          opacity: lamp * (1 - cardLight),
        }}
      />
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          pointerEvents: "none",
          opacity: lamp * (1 - 0.45 * ramp(frame, PUSH0, 18, EASE.smooth)),
        }}
      >
        <div style={{ position: "absolute", inset: 0, filter: "blur(28px)" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: `polygon(${cone})`,
              background: `linear-gradient(${(Math.atan2(py - sourceY, px - sourceX) * 180 / Math.PI - 90).toFixed(1)}deg, rgba(114,222,219,0.30) 0%, rgba(57,213,199,0.16) 60%, rgba(57,213,199,0.05) 100%)`,
            }}
          />
        </div>
        <div style={{ position: "absolute", inset: 0, clipPath: `polygon(${cone})` }}>
          <Dust look={LOOK} count={36} seed={4} drift={0.3} opacity={0.5} color="#D7FFFC" />
        </div>
      </AbsoluteFill>

      {/* Spatial annotation shares PageCam2D's exact interpolated camera, but
          sits above screen-space lighting so its silver text stays legible. */}
      <CardAnnotationCamera frame={frame}>
        {frame >= 70 ? (
          <div style={{ transformStyle: "preserve-3d", pointerEvents: "none" }}>
            <div
              style={{
                position: "absolute",
                left: 1005,
                top: 520,
                width: 260,
                height: 150,
                transform: `translateZ(${(noteZ - 1).toFixed(2)}px) translateY(${((1 - noteIn) * 26).toFixed(2)}px)`,
                background: "radial-gradient(ellipse 65% 58% at 50% 50%, rgba(3,8,13,0.97) 0%, rgba(3,8,13,0.88) 62%, rgba(3,8,13,0) 100%)",
                filter: "blur(6px)",
                opacity: noteIn,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 1020,
                top: 545,
                width: "max-content",
                whiteSpace: "nowrap",
                transform: `translateZ(${noteZ.toFixed(2)}px) translateY(${((1 - noteIn) * 26).toFixed(2)}px)`,
                opacity: noteIn,
                filter: noteIn < 1 ? `blur(${((1 - noteIn) * 4).toFixed(2)}px)` : undefined,
                fontFamily: FONT.sans,
                letterSpacing: "-0.035em",
                lineHeight: 1.12,
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 760, color: COLORS.silver, textShadow: "0 2px 18px rgba(0,0,0,0.6)" }}>
                Твой выбор.
              </div>
              <div style={{ position: "relative", display: "inline-block", marginTop: 3 }}>
                <div
                  style={{
                    position: "relative",
                    display: "inline-block",
                    padding: "2px 8px",
                    whiteSpace: "nowrap",
                    fontSize: 21,
                    fontWeight: 760,
                    lineHeight: 1.12,
                    color: marker > 0.55 ? COLORS.background : COLORS.silver,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "8%",
                      bottom: "2%",
                      width: `${(marker * 100).toFixed(2)}%`,
                      background: COLORS.teal,
                      borderRadius: 4,
                    }}
                  />
                  <span style={{ position: "relative" }}>По адекватной цене</span>
                </div>
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontFamily: FONT.sans,
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  color: COLORS.secondary,
                  textTransform: "uppercase",
                }}
              >
                UnlimitSub
              </div>
            </div>
          </div>
        ) : null}
      </CardAnnotationCamera>
      <Grain opacity={0.045} blend="soft-light" />
    </AbsoluteFill>
  );
};
