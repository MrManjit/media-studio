"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import type { Media } from "../../types/media";
import { getMedia, uploadMedia } from "../../services/media";

type TemplateKind =
  | "grid"
  | "feature"
  | "filmstrip"
  | "mosaic"
  | "magazine"
  | "postcard"
  | "polaroid"
  | "colorblock";

type CollageTemplate = {
  id: TemplateKind;
  name: string;
  group: "Basic" | "Advanced" | "Colorful";
  description: string;
};

type CollageTheme = {
  id: string;
  name: string;
  background: string;
  accent: string;
  text: string;
};

type Frame = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
};

const TEMPLATES: CollageTemplate[] = [
  { id: "grid", name: "Clean Grid", group: "Basic", description: "Balanced rows for everyday sets." },
  { id: "feature", name: "Hero Feature", group: "Basic", description: "One lead image with supporting moments." },
  { id: "filmstrip", name: "Film Strip", group: "Basic", description: "A crisp editorial strip." },
  { id: "mosaic", name: "Mosaic Flow", group: "Advanced", description: "Asymmetric blocks with a premium rhythm." },
  { id: "magazine", name: "Magazine", group: "Advanced", description: "Cover-style collage with headline space." },
  { id: "postcard", name: "Postcard", group: "Advanced", description: "Travel-board spacing and refined margins." },
  { id: "polaroid", name: "Candy Prints", group: "Colorful", description: "Playful tilted photo prints." },
  { id: "colorblock", name: "Color Pop", group: "Colorful", description: "Bright panels with layered images." },
];

const THEMES: CollageTheme[] = [
  { id: "ink", name: "Ink", background: "#0b0f19", accent: "#f8fafc", text: "#f8fafc" },
  { id: "gallery", name: "Gallery", background: "#f7f3eb", accent: "#1f2937", text: "#111827" },
  { id: "rose", name: "Rose", background: "#ffe4e6", accent: "#be123c", text: "#881337" },
  { id: "mint", name: "Mint", background: "#dcfce7", accent: "#047857", text: "#064e3b" },
  { id: "sky", name: "Sky", background: "#dbeafe", accent: "#1d4ed8", text: "#172554" },
  { id: "sunset", name: "Sunset", background: "#fed7aa", accent: "#c2410c", text: "#7c2d12" },
];

const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 2000;

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  frame: Frame,
  radius: number,
) {
  ctx.save();
  ctx.translate(frame.x + frame.width / 2, frame.y + frame.height / 2);
  ctx.rotate(((frame.rotate ?? 0) * Math.PI) / 180);
  roundedRect(ctx, -frame.width / 2, -frame.height / 2, frame.width, frame.height, radius);
  ctx.clip();

  const imageRatio = image.naturalWidth / image.naturalHeight;
  const frameRatio = frame.width / frame.height;
  let sourceWidth = image.naturalWidth;
  let sourceHeight = image.naturalHeight;
  let sourceX = 0;
  let sourceY = 0;

  if (imageRatio > frameRatio) {
    sourceWidth = sourceHeight * frameRatio;
    sourceX = (image.naturalWidth - sourceWidth) / 2;
  } else {
    sourceHeight = sourceWidth / frameRatio;
    sourceY = (image.naturalHeight - sourceHeight) / 2;
  }

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    -frame.width / 2,
    -frame.height / 2,
    frame.width,
    frame.height,
  );
  ctx.restore();
}

function getGridFrames(count: number, margin: number, gap: number): Frame[] {
  const columns = count <= 2 ? count : count <= 4 ? 2 : 3;
  const rows = Math.ceil(count / columns);
  const width = (CANVAS_WIDTH - margin * 2 - gap * (columns - 1)) / columns;
  const height = (CANVAS_HEIGHT - margin * 2 - gap * (rows - 1)) / rows;

  return Array.from({ length: count }, (_, index) => ({
    x: margin + (index % columns) * (width + gap),
    y: margin + Math.floor(index / columns) * (height + gap),
    width,
    height,
  }));
}

function getTemplateFrames(template: TemplateKind, count: number, spacing: number): Frame[] {
  const margin = spacing * 2;
  const gap = spacing;
  const right = CANVAS_WIDTH - margin;
  const bottom = CANVAS_HEIGHT - margin;
  const innerWidth = CANVAS_WIDTH - margin * 2;
  const innerHeight = CANVAS_HEIGHT - margin * 2;

  if (template === "grid") {
    return getGridFrames(count, margin, gap);
  }

  if (template === "feature") {
    const frames: Frame[] = [
      { x: margin, y: margin, width: innerWidth, height: innerHeight * 0.58 },
    ];
    const smallCount = Math.max(0, count - 1);
    const smallWidth = (innerWidth - gap * (smallCount - 1)) / Math.max(1, smallCount);
    for (let index = 0; index < smallCount; index += 1) {
      frames.push({
        x: margin + index * (smallWidth + gap),
        y: margin + innerHeight * 0.58 + gap,
        width: smallWidth,
        height: innerHeight * 0.42 - gap,
      });
    }
    return frames.slice(0, count);
  }

  if (template === "filmstrip") {
    const height = (innerHeight - gap * (count - 1)) / count;
    return Array.from({ length: count }, (_, index) => ({
      x: margin,
      y: margin + index * (height + gap),
      width: innerWidth,
      height,
    }));
  }

  if (template === "mosaic") {
    const base: Frame[] = [
      { x: margin, y: margin, width: innerWidth * 0.58 - gap / 2, height: innerHeight * 0.46 },
      { x: margin + innerWidth * 0.58 + gap / 2, y: margin, width: innerWidth * 0.42 - gap / 2, height: innerHeight * 0.28 },
      { x: margin + innerWidth * 0.58 + gap / 2, y: margin + innerHeight * 0.28 + gap, width: innerWidth * 0.42 - gap / 2, height: innerHeight * 0.18 - gap },
      { x: margin, y: margin + innerHeight * 0.46 + gap, width: innerWidth * 0.36, height: innerHeight * 0.54 - gap },
      { x: margin + innerWidth * 0.36 + gap, y: margin + innerHeight * 0.46 + gap, width: innerWidth * 0.64 - gap, height: innerHeight * 0.54 - gap },
    ];
    return Array.from({ length: count }, (_, index) => base[index % base.length]);
  }

  if (template === "magazine") {
    const base: Frame[] = [
      { x: margin, y: margin + 220, width: innerWidth, height: innerHeight * 0.48 },
      { x: margin, y: margin + innerHeight * 0.48 + 240, width: innerWidth * 0.48 - gap / 2, height: bottom - (margin + innerHeight * 0.48 + 240) },
      { x: margin + innerWidth * 0.48 + gap / 2, y: margin + innerHeight * 0.48 + 240, width: innerWidth * 0.52 - gap / 2, height: bottom - (margin + innerHeight * 0.48 + 240) },
    ];
    return Array.from({ length: count }, (_, index) => base[index % base.length]);
  }

  if (template === "postcard") {
    const base: Frame[] = [
      { x: margin + 80, y: margin + 70, width: innerWidth * 0.64, height: innerHeight * 0.42, rotate: -2 },
      { x: right - innerWidth * 0.46 - 60, y: margin + 520, width: innerWidth * 0.46, height: innerHeight * 0.34, rotate: 3 },
      { x: margin + 120, y: bottom - innerHeight * 0.34 - 90, width: innerWidth * 0.52, height: innerHeight * 0.34, rotate: -1 },
    ];
    return Array.from({ length: count }, (_, index) => base[index % base.length]);
  }

  if (template === "polaroid") {
    const columns = count <= 2 ? 1 : 2;
    const cardWidth = (innerWidth - gap * (columns - 1)) / columns;
    const cardHeight = Math.min(560, (innerHeight - gap * Math.ceil(count / columns)) / Math.ceil(count / columns));
    return Array.from({ length: count }, (_, index) => ({
      x: margin + (index % columns) * (cardWidth + gap),
      y: margin + Math.floor(index / columns) * (cardHeight + gap * 1.4),
      width: cardWidth,
      height: cardHeight,
      rotate: index % 2 === 0 ? -3 : 3,
    }));
  }

  const base = getGridFrames(count, margin, gap);
  return base.map((frame, index) => ({
    ...frame,
    x: frame.x + (index % 2 === 0 ? 0 : gap / 2),
    y: frame.y + (index % 3 === 0 ? gap / 2 : 0),
  }));
}

async function loadImage(src: string) {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load collage image."));
    image.src = src;
  });
}

function CollagePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [allMedia, setAllMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [template, setTemplate] = useState<TemplateKind>("mosaic");
  const [themeId, setThemeId] = useState("ink");
  const [spacing, setSpacing] = useState(34);
  const [radius, setRadius] = useState(28);
  const [caption, setCaption] = useState("My Collage");
  const [showCaption, setShowCaption] = useState(true);
  const [imageOrder, setImageOrder] = useState<string[]>([]);

  const selectedIds = useMemo(() => {
    return (searchParams.get("ids") ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  }, [searchParams]);

  useEffect(() => {
    async function loadSelectedMedia() {
      try {
        const media = await getMedia();
        setAllMedia(media);
        setImageOrder(selectedIds);
      } catch (error) {
        console.error(error);
        setMessage("Unable to load selected photos.");
      } finally {
        setLoading(false);
      }
    }

    loadSelectedMedia();
  }, [selectedIds]);

  const selectedPhotos = useMemo(() => {
    const mediaById = new Map(allMedia.map((item) => [item.id, item]));
    return imageOrder
      .map((id) => mediaById.get(id))
      .filter((item): item is Media => item !== undefined && item.media_type === "image");
  }, [allMedia, imageOrder]);

  const activeTheme = THEMES.find((item) => item.id === themeId) ?? THEMES[0];
  const activeTemplate = TEMPLATES.find((item) => item.id === template) ?? TEMPLATES[0];

  const renderCollage = useCallback(async (targetCanvas?: HTMLCanvasElement) => {
    const canvas = targetCanvas ?? canvasRef.current;
    if (!canvas || selectedPhotos.length === 0) return null;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = activeTheme.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (template === "colorblock") {
      ctx.fillStyle = activeTheme.accent;
      ctx.globalAlpha = 0.2;
      ctx.fillRect(0, 0, CANVAS_WIDTH * 0.42, CANVAS_HEIGHT);
      ctx.fillRect(CANVAS_WIDTH * 0.62, CANVAS_HEIGHT * 0.18, CANVAS_WIDTH * 0.38, CANVAS_HEIGHT * 0.68);
      ctx.globalAlpha = 1;
    }

    if (showCaption && caption.trim()) {
      ctx.fillStyle = activeTheme.text;
      ctx.font = "700 96px Arial";
      ctx.fillText(caption.trim(), spacing * 2, spacing * 2 + 72);
      ctx.fillStyle = activeTheme.accent;
      ctx.fillRect(spacing * 2, spacing * 2 + 108, 260, 12);
    }

    const images = await Promise.all(selectedPhotos.map((item) => loadImage(item.file_url)));
    const topInset = showCaption && caption.trim() && template === "magazine" ? 0 : 0;
    const frames = getTemplateFrames(template, images.length, spacing + topInset);

    frames.forEach((frame, index) => {
      const image = images[index % images.length];
      if (!image) return;

      if (template === "polaroid") {
        ctx.save();
        ctx.translate(frame.x + frame.width / 2, frame.y + frame.height / 2);
        ctx.rotate(((frame.rotate ?? 0) * Math.PI) / 180);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(15, 23, 42, 0.28)";
        ctx.shadowBlur = 34;
        ctx.shadowOffsetY = 22;
        roundedRect(ctx, -frame.width / 2, -frame.height / 2, frame.width, frame.height, 24);
        ctx.fill();
        ctx.restore();

        drawCoverImage(
          ctx,
          image,
          {
            ...frame,
            x: frame.x + 34,
            y: frame.y + 34,
            width: frame.width - 68,
            height: frame.height - 132,
          },
          radius,
        );
        return;
      }

      ctx.save();
      ctx.shadowColor = "rgba(2, 6, 23, 0.26)";
      ctx.shadowBlur = 26;
      ctx.shadowOffsetY = 16;
      drawCoverImage(ctx, image, frame, radius);
      ctx.restore();
    });

    return canvas;
  }, [activeTheme, caption, radius, selectedPhotos, showCaption, spacing, template]);

  useEffect(() => {
    let isCurrent = true;

    renderCollage().catch((error) => {
      if (!isCurrent) return;
      console.error(error);
      setMessage("Unable to render this collage preview.");
    });

    return () => {
      isCurrent = false;
    };
  }, [renderCollage]);

  const handleShuffle = () => {
    setImageOrder((current) => current.slice().sort(() => Math.random() - 0.5));
  };

  const exportBlob = async () => {
    const canvas = document.createElement("canvas");
    const renderedCanvas = await renderCollage(canvas);
    if (!renderedCanvas) {
      throw new Error("Collage is not ready.");
    }

    return await new Promise<Blob>((resolve, reject) => {
      renderedCanvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("Unable to export collage."));
      }, "image/png");
    });
  };

  const handleDownload = async () => {
    try {
      const blob = await exportBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${caption.trim() || "collage"}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      setMessage("Unable to download the collage.");
    }
  };

  const handleSaveToLibrary = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const blob = await exportBlob();
      const formData = new FormData();
      formData.append("file", blob, `${caption.trim() || "collage"}.png`);
      await uploadMedia(formData);
      setMessage("Collage saved to your library.");
      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage("Unable to save collage to the library.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <main className="p-8">Loading collage studio...</main>;
  }

  if (selectedPhotos.length < 2) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-3xl rounded-lg border border-white/10 bg-white/10 p-8">
          <h1 className="text-3xl font-bold">Choose at least two photos</h1>
          <p className="mt-3 text-slate-300">Collages can be made from image selections only.</p>
          <Link href="/library" className="mt-6 inline-flex rounded-lg bg-white px-5 py-3 font-semibold text-slate-950">
            Back to Library
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090b10] text-white">
      <div className="border-b border-white/10 bg-black/40 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Collage Studio</p>
            <h1 className="text-3xl font-bold">Design a premium collage</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/library" className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/10">
              Library
            </Link>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/10"
            >
              Download
            </button>
            <button
              type="button"
              onClick={handleSaveToLibrary}
              disabled={saving}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save to Library"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 p-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <section className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Templates</h2>
              <span className="text-xs text-slate-400">{selectedPhotos.length} photos</span>
            </div>
            <div className="mt-4 space-y-4">
              {(["Basic", "Advanced", "Colorful"] as const).map((group) => (
                <div key={group}>
                  <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-400">{group}</p>
                  <div className="grid gap-2">
                    {TEMPLATES.filter((item) => item.group === group).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTemplate(item.id)}
                        className={`rounded-lg border p-3 text-left transition ${
                          template === item.id
                            ? "border-cyan-300 bg-cyan-300/15"
                            : "border-white/10 bg-black/20 hover:bg-white/10"
                        }`}
                      >
                        <span className="block font-semibold">{item.name}</span>
                        <span className="mt-1 block text-xs text-slate-400">{item.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
            <h2 className="text-lg font-semibold">Style</h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {THEMES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setThemeId(item.id)}
                  className={`rounded-lg border p-2 text-xs ${
                    themeId === item.id ? "border-white" : "border-white/10"
                  }`}
                >
                  <span
                    className="mb-2 block h-8 rounded"
                    style={{ background: item.background, border: `4px solid ${item.accent}` }}
                  />
                  {item.name}
                </button>
              ))}
            </div>

            <label className="mt-5 block text-sm text-slate-300">
              Spacing
              <input
                type="range"
                min={12}
                max={80}
                value={spacing}
                onChange={(event) => setSpacing(Number(event.target.value))}
                className="mt-2 w-full"
              />
            </label>

            <label className="mt-5 block text-sm text-slate-300">
              Corners
              <input
                type="range"
                min={0}
                max={80}
                value={radius}
                onChange={(event) => setRadius(Number(event.target.value))}
                className="mt-2 w-full"
              />
            </label>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
            <h2 className="text-lg font-semibold">Finishing</h2>
            <label className="mt-4 block text-sm text-slate-300">
              Caption
              <input
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-cyan-300"
              />
            </label>
            <label className="mt-4 flex items-center gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={showCaption}
                onChange={(event) => setShowCaption(event.target.checked)}
              />
              Show caption
            </label>
            <button
              type="button"
              onClick={handleShuffle}
              className="mt-5 w-full rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/10"
            >
              Shuffle Photos
            </button>
            {message && <p className="mt-4 text-sm text-cyan-200">{message}</p>}
          </section>
        </aside>

        <section className="min-h-[720px] rounded-lg border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_36%),#111827] p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">{activeTemplate.name}</h2>
              <p className="text-sm text-slate-400">{activeTemplate.description}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-300">
              1600 x 2000 PNG
            </div>
          </div>
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="aspect-[4/5] max-h-[78vh] w-full max-w-[720px] rounded-lg bg-black shadow-2xl shadow-black/50"
            />
          </div>
        </section>
      </div>
    </main>
  );
}

export default function CollagePage() {
  return (
    <Suspense fallback={<main className="p-8">Loading collage studio...</main>}>
      <CollagePageContent />
    </Suspense>
  );
}
