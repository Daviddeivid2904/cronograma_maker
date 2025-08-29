// src/export/decorations.tsx
import React from "react";

/** Nombres de “temas” de decoración */
export type DecorationName = "none" | "flowers" | "medical" | "science" | "snoopy";

/** Límite de la grilla real (donde está el calendario) */
export type GridRect = { x: number; y: number; w: number; h: number };

export type RenderProps = {
  name: DecorationName;
  width: number;   // tamaño total del poster (no hace falta usarlo)
  height: number;  // tamaño total del poster (no hace falta usarlo)
  grid: GridRect;  // límites exactos de la grilla (se usa para anclar)
  margin?: number; // por si querés pad opcional
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** Convierte a URL absoluta dentro de /public */
function resolvePublic(path: string): string {
  const p = path.startsWith("/") ? path.slice(1) : path;
  return new URL(p, document.baseURI).toString();
}

/** Helper: ancla a un borde/esquina de la grilla y devuelve un punto base */
function place(
  grid: GridRect,
  anchor:
    | "top-left" | "top-center" | "top-right"
    | "left-center" | "right-center"
    | "bottom-left" | "bottom-center" | "bottom-right",
  dx = 0,
  dy = 0
) {
  const { x, y, w, h } = grid;
  switch (anchor) {
    case "top-left":      return { x: x + dx,       y: y + dy };
    case "top-center":    return { x: x + w / 2 + dx, y: y + dy };
    case "top-right":     return { x: x + w + dx,   y: y + dy };
    case "left-center":   return { x: x + dx,       y: y + h / 2 + dy };
    case "right-center":  return { x: x + w + dx,   y: y + h / 2 + dy };
    case "bottom-left":   return { x: x + dx,       y: y + h + dy };
    case "bottom-center": return { x: x + w / 2 + dx, y: y + h + dy };
    case "bottom-right":  return { x: x + w + dx,   y: y + h + dy };
  }
}

/** ===== Render principal (sin máscaras ni recortes) ===== */
export function RenderDecoration({
  name,
  width,
  height,
  grid,
  margin = 0,
}: RenderProps): JSX.Element | null {
  if (name === "none") return null;

  // lado corto de la grilla para escalar decoraciones
  const s = Math.min(grid.w, grid.h);

  // definimos un sprite simple para FLORES y lo clonamos con <use/>
  const flowerId = `flower-sprite-${Math.random().toString(36).slice(2)}`;

  return (
    <g pointerEvents="none">
      <defs>
        <image
          id={flowerId}
          href={resolvePublic("/decors/flores/flores.png")}
          x="0"
          y="0"
          width="256"
          height="256"
          preserveAspectRatio="xMidYMid meet"
        />
      </defs>

      {name === "flowers" && <Flowers grid={grid} s={s} spriteId={flowerId} />}
      {name === "medical" && <Medical grid={grid} s={s} pad={margin} />}
      {name === "science" && <Science grid={grid} s={s} pad={margin}/>}
      {name === "snoopy" && <Snoopy grid={grid} s={s} pad={margin} />}
    </g>
  );
}

/* ===================== FLORES ===================== */
function Flowers({
  grid,
  s,
  spriteId,
}: {
  grid: GridRect;
  s: number;
  spriteId: string;
}) {
  const big = clamp(s * 0.42, 160, 520);
  const mid = clamp(s * 0.26, 120, 360);
  const tiny = clamp(s * 0.12, 60, 120);

  const UseFlower = ({
    cx,
    cy,
    w,
    rotate = 0,
    opacity = 1,
  }: {
    cx: number;
    cy: number;
    w: number;
    rotate?: number;
    opacity?: number;
  }) => {
    const scale = w / 256;
    const x = cx - w / 2;
    const y = cy - w / 2;
    const tfm = `translate(${x} ${y}) scale(${scale}) rotate(${rotate} ${w / 2} ${w / 2})`;
    // @ts-ignore xlinkHref para compatibilidad
    return <use href={`#${spriteId}`} xlinkHref={`#${spriteId}`} transform={tfm} opacity={opacity} />;
  };

  // esquinas pegadas a la grilla
  const tl = place(grid, "top-left", -big * 0.18, -big * 0.12);
  const br = place(grid, "bottom-right", big * 0.18, big * 0.12);
  // laterales
  const lc = place(grid, "left-center", -mid * 0.38, 0);
  const rc = place(grid, "right-center", mid * 0.38, 0);

  // anillo suave alrededor
  const cx0 = grid.x + grid.w / 2;
  const cy0 = grid.y + grid.h / 2;
  const rad = Math.min(grid.w, grid.h) * 0.55;

  return (
    <>
      <UseFlower cx={tl.x} cy={tl.y} w={big} rotate={-8} />
      <UseFlower cx={br.x} cy={br.y} w={big} rotate={172} />
      <UseFlower cx={lc.x} cy={lc.y} w={mid} rotate={-14} />
      <UseFlower cx={rc.x} cy={rc.y} w={mid} rotate={10} />

      {Array.from({ length: 10 }).map((_, i) => {
        const ang = (i * 360) / 10;
        const r = (ang * Math.PI) / 180;
        const cx = cx0 + Math.cos(r) * rad;
        const cy = cy0 + Math.sin(r) * rad;
        return (
          <UseFlower
            key={i}
            cx={cx}
            cy={cy}
            w={tiny}
            rotate={i * 22}
            opacity={0.22}
          />
        );
      })}
    </>
  );
}

/* ===================== MÉDICO ===================== */
function Medical({ grid, s, pad }: { grid: GridRect; s: number; pad: number }) {
  const big = clamp(s * 0.34, 200, 440);
  const mid = clamp(s * 0.20, 120, 260);

  // anclas “pegadas” a la grilla (independiente del formato)
  const tr = place(grid, "top-right");
  const tl = place(grid, "top-left");
  const br = place(grid, "bottom-right");
  const bl = place(grid, "bottom-left");
  const rc = place(grid, "right-center");
  const lc = place(grid, "left-center");

  return (
    <>
      {/* doctor arriba-derecha, pegado a la grilla */}
      <image
        href={resolvePublic("/decors/medicina/medico.png")}
        x={tr.x - mid + pad}
        y={tr.y - 1.25* mid - pad}
        width={mid}
        height={mid}
      />

      {/* corazón arriba-izquierda */}
      <image
        href={resolvePublic("/decors/medicina/corazon.png")}
        x={tl.x - mid - pad}
        y={tl.y - mid - pad}
        width={mid}
        height={mid}
        transform={`rotate(-8 ${tl.x - mid / 2} ${tl.y + mid / 2})`}
      />

      {/* gotero sangre abajo-derecha */}
      <image
        href={resolvePublic("/decors/medicina/sangre.png")}
        x={br.x + pad}
        y={br.y + pad}
        width={mid}
        height={mid}
        transform={`rotate(-10 ${br.x - mid / 2} ${br.y - mid / 2})`}
      />

      {/* jeringa abajo-izquierda */}
      <image
        href={resolvePublic("/decors/medicina/inyeccion.png")}
        x={bl.x - mid - pad}
        y={bl.y + pad}
        width={mid}
        height={mid}
        transform={`rotate(14 ${bl.x + pad + mid / 2} ${bl.y - pad - mid / 2})`}
      />

      {/* stetoscopio centro derecha */}
      <image
        href={resolvePublic("/decors/medicina/stetoscopio.png")}
        x={rc.x - 0.8*mid}
        y={rc.y - 2*mid}
        width={mid}
        height={mid}
        transform={`rotate(14 ${bl.x + pad + mid / 2} ${bl.y - pad - mid / 2})`}
      />
    </>
  );
}

/* ===================== CIENTÍFICO ===================== */
function Science({ grid, s, pad }: { grid: GridRect; s: number; pad: number }) {
  const big = clamp(s * 0.30, 180, 380);
  const mid = clamp(s * 0.18, 110, 240);

  const tl = place(grid, "top-left");
  const tr = place(grid, "top-right");
  const bl = place(grid, "bottom-left");
  const br = place(grid, "bottom-right");
  const lc = place(grid, "left-center");
  const rc = place(grid, "right-center");

  return (
    <>
      <image href={resolvePublic("/decors/cientifico/atomo.png")}    
      x={lc.x - 1.85* mid}
      y={lc.y + mid}     
      width={mid} 
      height={mid} />
      <image href={resolvePublic("/decors/cientifico/bacteria.png")} 
      x={rc.x - 0.15*mid}
      y={rc.y - 2*mid}      
      width={mid} height={mid} />
      <image href={resolvePublic("/decors/cientifico/cadena.png")}   
      x={br.x *0.96 - pad}
      y={br.y *0.96- pad} 
      width={mid} 
      height={mid} />
      <image href={resolvePublic("/decors/cientifico/micro.png")}    
      x={tr.x - mid + pad}
      y={tr.y - 1.25*mid - pad}  
      width={mid} 
      height={mid} />
      <image href={resolvePublic("/decors/cientifico/lupa.png")}    
      x={bl.x - mid - pad}
      y={bl.y + pad}
      width={mid} 
      height={mid} />
      <image href={resolvePublic("/decors/cientifico/muestras.png")} 
      x={tl.x - mid - pad}
      y={tl.y - 1.2* mid - pad}
      width={mid} 
      height={mid} />
    </>
  );
}

/* ===================== SNOOPY ===================== */
function Snoopy({ grid, s, pad }: { grid: GridRect; s: number; pad: number }) {
  const big = clamp(s * 0.34, 200, 440);
  const mid = clamp(s * 0.20, 120, 260);

  // anclas “pegadas” a la grilla (independiente del formato)
  const tr = place(grid, "top-right");
  const tl = place(grid, "top-left");
  const br = place(grid, "bottom-right");
  const bl = place(grid, "bottom-left");
  const rc = place(grid, "right-center");
  const lc = place(grid, "left-center");

  return (
    <>
      {/* snoopy principal pegado al borde inferior */}
      <image href={resolvePublic("/decors/snoopy/peek.png")} 
        x={tr.x - mid + pad}
        y={tr.y - 0.95 * mid - pad}
        width={mid}
        height={mid}
      />

      {/* snoopy acostado arriba-derecha */}
      <image href={resolvePublic("/decors/snoopy/main.png")} 
        x={tl.x - mid - pad}
        y={tl.y - mid - pad}
        width={mid}
        height={mid}
      />

      {/* snoopy asomado izquierda */}
      <image href={resolvePublic("/decors/snoopy/asomado.png")} 
        x={lc.x - 1.77* mid}
        y={lc.y + mid}
        width={mid}
        height={mid}
      />

      {/* snoopy apoyado derecha */}
      <image href={resolvePublic("/decors/snoopy/apoyado.png")} 
        x={rc.x - 0.3* mid}
        y={rc.y - mid}
        width={mid}
        height={mid}
      />

      {/* woodstock derecha abajo */}
      <image href={resolvePublic("/decors/snoopy/woodstock.png")} 
        x={br.x + pad}
        y={br.y + pad}
        width={mid}
        height={mid}
      />
    </>
  );
}

export default RenderDecoration;
