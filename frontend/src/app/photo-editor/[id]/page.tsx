"use client";

import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { useRouter } from "next/navigation";
import type { Media } from "../../../types/media";
import { getMediaById, saveMediaEdits } from "../../../services/media";

export default function PhotoEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const cropFrameRef = useRef<number | null>(null);
  const pendingCropPointRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const [media, setMedia] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isCropActive, setIsCropActive] = useState(false);
  const [cropRect, setCropRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [cropPreset, setCropPreset] = useState<"free" | "1:1" | "4:3" | "16:9" | "3:4">("free");
  const [showCropGuides, setShowCropGuides] = useState(true);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragStartCrop, setDragStartCrop] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [activeHandle, setActiveHandle] = useState<
    "move" | "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | null
  >(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      const resolvedParams = await params;
      if (!isMounted) return;
      await loadMedia(resolvedParams.id);
    }

    initialize();

    return () => {
      isMounted = false;
    };
  }, [params]);

  async function loadMedia(id: string) {
    try {
      const data = await getMediaById(id);
      setMedia(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load media for editing.");
    } finally {
      setLoading(false);
    }
  }

  type BoundsRect = { x: number; y: number; width: number; height: number };

  const getAspectRatioValue = (preset: string) => {
    switch (preset) {
      case "1:1":
        return 1;
      case "4:3":
        return 4 / 3;
      case "16:9":
        return 16 / 9;
      case "3:4":
        return 3 / 4;
      default:
        return null;
    }
  };

  const getCenteredCropRect = (rect: BoundsRect, preset: typeof cropPreset) => {
    const ratio = getAspectRatioValue(preset);

    if (!ratio) {
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      };
    }

    const width = rect.width;
    const height = width / ratio;
    const safeHeight = Math.min(height, rect.height);
    const safeWidth = safeHeight * ratio;

    return {
      x: rect.x + (rect.width - safeWidth) / 2,
      y: rect.y + (rect.height - safeHeight) / 2,
      width: safeWidth,
      height: safeHeight,
    };
  };

  const getContainerContent = () => {
    if (!imageContainerRef.current) return null;
    const container = imageContainerRef.current;
    const style = window.getComputedStyle(container);
    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingRight = parseFloat(style.paddingRight) || 0;
    const paddingBottom = parseFloat(style.paddingBottom) || 0;

    return {
      x: paddingLeft,
      y: paddingTop,
      width: Math.max(0, container.clientWidth - paddingLeft - paddingRight),
      height: Math.max(0, container.clientHeight - paddingTop - paddingBottom),
    };
  };

  const getImageBounds = () => {
    if (!imageRef.current || !imageContainerRef.current) return null;

    const imageRect = imageRef.current.getBoundingClientRect();
    const containerRect = imageContainerRef.current.getBoundingClientRect();
    const content = getContainerContent();
    if (!content) return null;
    const naturalWidth = imageRef.current.naturalWidth;
    const naturalHeight = imageRef.current.naturalHeight;

    if (!naturalWidth || !naturalHeight || !imageRect.width || !imageRect.height) {
      return {
        x: Math.max(0, imageRect.left - containerRect.left - content.x),
        y: Math.max(0, imageRect.top - containerRect.top - content.y),
        width: Math.max(0, imageRect.width),
        height: Math.max(0, imageRect.height),
      };
    }

    const elementRatio = imageRect.width / imageRect.height;
    const imageRatio = naturalWidth / naturalHeight;
    const visibleWidth = imageRatio > elementRatio ? imageRect.width : imageRect.height * imageRatio;
    const visibleHeight = imageRatio > elementRatio ? imageRect.width / imageRatio : imageRect.height;
    const letterboxX = (imageRect.width - visibleWidth) / 2;
    const letterboxY = (imageRect.height - visibleHeight) / 2;

    return {
      x: Math.max(0, imageRect.left - containerRect.left - content.x + letterboxX),
      y: Math.max(0, imageRect.top - containerRect.top - content.y + letterboxY),
      width: Math.max(0, visibleWidth),
      height: Math.max(0, visibleHeight),
    };
  };

  const getContainerPoint = (clientX: number, clientY: number) => {
    if (!imageContainerRef.current) return null;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const content = getContainerContent();
    if (!content) return null;

    return {
      x: Math.min(
        Math.max(clientX - rect.left - content.x, 0),
        content.width,
      ),
      y: Math.min(
        Math.max(clientY - rect.top - content.y, 0),
        content.height,
      ),
      width: content.width,
      height: content.height,
    };
  };

  const createDefaultCrop = (preset: typeof cropPreset = cropPreset) => {
    const imageBounds = getImageBounds();
    const content = getContainerContent();
    const bounds = imageBounds ?? content;
    if (!bounds) return null;
    return getCenteredCropRect(bounds, preset);
  };

  const getHandleCursorClass = (handleKey: string) => {
    switch (handleKey) {
      case "nw":
      case "se":
        return "cursor-nwse-resize";
      case "ne":
      case "sw":
        return "cursor-nesw-resize";
      case "n":
      case "s":
        return "cursor-ns-resize";
      case "e":
      case "w":
        return "cursor-ew-resize";
      default:
        return "cursor-grab";
    }
  };

  const handleCropPresetChange = (preset: typeof cropPreset) => {
    setCropPreset(preset);

    if (!isCropActive || !imageContainerRef.current) return;

    const imageBounds = getImageBounds();
    const content = getContainerContent();
    const bounds = imageBounds ?? content;
    if (!bounds) return;

    const nextRect = getCenteredCropRect(bounds, preset);
    setCropRect(nextRect);
    setDragStart(null);
    setActiveHandle(null);
  };

  const clearCropInteraction = () => {
    if (cropFrameRef.current !== null) {
      cancelAnimationFrame(cropFrameRef.current);
      cropFrameRef.current = null;
    }
    pendingCropPointRef.current = null;
    setDragStart(null);
    setDragStartCrop(null);
    setActiveHandle(null);
  };

  const handleImageInteraction = (event: MouseEvent<HTMLImageElement>) => {
    event.preventDefault();
    event.stopPropagation();
    clearCropInteraction();
  };

  const startCrop = (event: PointerEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || !cropRect) return;
    event.preventDefault();

    const point = getContainerPoint(event.clientX, event.clientY);
    if (!point) return;
    const x = point.x;
    const y = point.y;

    const hitSize = 16;
    const handleZones = {
      nw: { x: cropRect.x, y: cropRect.y },
      ne: { x: cropRect.x + cropRect.width, y: cropRect.y },
      sw: { x: cropRect.x, y: cropRect.y + cropRect.height },
      se: { x: cropRect.x + cropRect.width, y: cropRect.y + cropRect.height },
      n: { x: cropRect.x + cropRect.width / 2, y: cropRect.y },
      s: { x: cropRect.x + cropRect.width / 2, y: cropRect.y + cropRect.height },
      w: { x: cropRect.x, y: cropRect.y + cropRect.height / 2 },
      e: { x: cropRect.x + cropRect.width, y: cropRect.y + cropRect.height / 2 },
    };

    const foundHandle = (Object.entries(handleZones) as [
      string,
      { x: number; y: number }
    ][]).find(([, zone]) => {
      return (
        Math.abs(zone.x - x) <= hitSize &&
        Math.abs(zone.y - y) <= hitSize
      );
    });

    if (foundHandle) {
      setDragStart({ x, y });
      setDragStartCrop(cropRect);
      setActiveHandle(foundHandle[0] as typeof activeHandle);
      return;
    }

    const isInsideRect =
      x >= cropRect.x &&
      x <= cropRect.x + cropRect.width &&
      y >= cropRect.y &&
      y <= cropRect.y + cropRect.height;

    if (!isInsideRect) {
      clearCropInteraction();
      return;
    }

    setDragStart({ x, y });
    setDragStartCrop(cropRect);
    setActiveHandle("move");
  };

  const updateCropAtPoint = (clientX: number, clientY: number) => {
    if (!dragStart || !imageContainerRef.current || !cropRect || !dragStartCrop) return;

    const point = getContainerPoint(clientX, clientY);
    if (!point) return;
    const imageBounds = getImageBounds();
    const bounds = imageBounds ?? { x: 0, y: 0, width: point.width, height: point.height };

    const x = point.x;
    const y = point.y;
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;

    const clampRect = (nextRect: typeof cropRect) => {
      const minSize = 24;
      const minX = bounds.x;
      const minY = bounds.y;
      const maxWidth = bounds.width;
      const maxHeight = bounds.height;
      const width = Math.max(minSize, Math.min(nextRect.width, maxWidth));
      const height = Math.max(minSize, Math.min(nextRect.height, maxHeight));
      let nextX = Math.max(minX, Math.min(nextRect.x, minX + maxWidth - width));
      let nextY = Math.max(minY, Math.min(nextRect.y, minY + maxHeight - height));

      if (nextX + width > minX + maxWidth) {
        nextX = minX + maxWidth - width;
      }
      if (nextY + height > minY + maxHeight) {
        nextY = minY + maxHeight - height;
      }

      return { x: nextX, y: nextY, width, height };
    };

    if (activeHandle === "move") {
      const nextCrop = clampRect({
        ...dragStartCrop,
        x: dragStartCrop.x + deltaX,
        y: dragStartCrop.y + deltaY,
      });
      setCropRect(nextCrop);
      return;
    }

    const ratio = getAspectRatioValue(cropPreset);
    const initialCrop = dragStartCrop;
    let nextX = initialCrop.x;
    let nextY = initialCrop.y;
    let width = initialCrop.width;
    let height = initialCrop.height;

    if (ratio) {
      if (activeHandle?.includes("e")) {
        width = Math.max(24, initialCrop.width + deltaX);
        height = width / ratio;
      } else if (activeHandle?.includes("w")) {
        width = Math.max(24, initialCrop.width - deltaX);
        height = width / ratio;
        nextX = initialCrop.x + initialCrop.width - width;
      }

      if (activeHandle?.includes("s")) {
        height = Math.max(24, initialCrop.height + deltaY);
        width = height * ratio;
      } else if (activeHandle?.includes("n")) {
        height = Math.max(24, initialCrop.height - deltaY);
        width = height * ratio;
        nextY = initialCrop.y + initialCrop.height - height;
      }

      if (activeHandle === "ne") {
        width = Math.max(24, initialCrop.width + deltaX);
        height = width / ratio;
        nextY = initialCrop.y + initialCrop.height - height;
      } else if (activeHandle === "nw") {
        width = Math.max(24, initialCrop.width - deltaX);
        height = width / ratio;
        nextX = initialCrop.x + initialCrop.width - width;
        nextY = initialCrop.y + initialCrop.height - height;
      } else if (activeHandle === "se") {
        width = Math.max(24, initialCrop.width + deltaX);
        height = width / ratio;
      } else if (activeHandle === "sw") {
        width = Math.max(24, initialCrop.width - deltaX);
        height = width / ratio;
        nextX = initialCrop.x + initialCrop.width - width;
      }
    } else {
      if (activeHandle?.includes("e")) {
        width = Math.max(24, initialCrop.width + deltaX);
      } else if (activeHandle?.includes("w")) {
        width = Math.max(24, initialCrop.width - deltaX);
        nextX = initialCrop.x + initialCrop.width - width;
      }

      if (activeHandle?.includes("s")) {
        height = Math.max(24, initialCrop.height + deltaY);
      } else if (activeHandle?.includes("n")) {
        height = Math.max(24, initialCrop.height - deltaY);
        nextY = initialCrop.y + initialCrop.height - height;
      }

      if (activeHandle === "ne") {
        nextY = initialCrop.y + initialCrop.height - height;
      } else if (activeHandle === "nw") {
        nextX = initialCrop.x + initialCrop.width - width;
        nextY = initialCrop.y + initialCrop.height - height;
      } else if (activeHandle === "sw") {
        nextX = initialCrop.x + initialCrop.width - width;
      }
    }

    const nextCrop = clampRect({
      x: nextX,
      y: nextY,
      width,
      height,
    });

    setCropRect(nextCrop);
  };

  const scheduleCropUpdate = (clientX: number, clientY: number) => {
    pendingCropPointRef.current = { clientX, clientY };

    if (cropFrameRef.current !== null) return;

    cropFrameRef.current = requestAnimationFrame(() => {
      cropFrameRef.current = null;
      const point = pendingCropPointRef.current;
      pendingCropPointRef.current = null;
      if (!point) return;
      updateCropAtPoint(point.clientX, point.clientY);
    });
  };

  const updateCrop = (event: PointerEvent<HTMLDivElement>) => {
    scheduleCropUpdate(event.clientX, event.clientY);
  };

  const endCrop = () => {
    const pendingPoint = pendingCropPointRef.current;
    if (pendingPoint) {
      if (cropFrameRef.current !== null) {
        cancelAnimationFrame(cropFrameRef.current);
        cropFrameRef.current = null;
      }
      pendingCropPointRef.current = null;
      updateCropAtPoint(pendingPoint.clientX, pendingPoint.clientY);
    }
    clearCropInteraction();
  };

  useEffect(() => {
    if (!dragStart) return;

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      scheduleCropUpdate(event.clientX, event.clientY);
    };

    const handlePointerUp = () => {
      endCrop();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [dragStart, cropRect, activeHandle, cropPreset]);

  const getSourceCropRect = (
    crop: BoundsRect,
    imageBounds: BoundsRect,
    naturalWidth: number,
    naturalHeight: number,
  ) => {
    const cropLeft = Math.max(crop.x, imageBounds.x);
    const cropTop = Math.max(crop.y, imageBounds.y);
    const cropRight = Math.min(crop.x + crop.width, imageBounds.x + imageBounds.width);
    const cropBottom = Math.min(crop.y + crop.height, imageBounds.y + imageBounds.height);
    const cropWidth = Math.max(1, cropRight - cropLeft);
    const cropHeight = Math.max(1, cropBottom - cropTop);

    return {
      x: ((cropLeft - imageBounds.x) / imageBounds.width) * naturalWidth,
      y: ((cropTop - imageBounds.y) / imageBounds.height) * naturalHeight,
      width: (cropWidth / imageBounds.width) * naturalWidth,
      height: (cropHeight / imageBounds.height) * naturalHeight,
    };
  };

  const drawImageToCanvas = (
    image: HTMLImageElement,
    width: number,
    height: number,
    filter = "none",
  ) => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.filter = filter;
    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, canvas.width, canvas.height);
    return canvas;
  };

  const applyCrop = () => {
    if (!cropRect || !imageRef.current || !media || !imageContainerRef.current) return;

    const imageElement = imageRef.current;
    const sourceImage = editedImageUrl ?? media.file_url;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = sourceImage;

    image.onload = () => {
      const naturalWidth = image.naturalWidth || media.width || imageElement.naturalWidth;
      const naturalHeight = image.naturalHeight || media.height || imageElement.naturalHeight;
      const imageBounds = getImageBounds();
      if (!imageBounds) return;
      const sourceCrop = getSourceCropRect(cropRect, imageBounds, naturalWidth, naturalHeight);

      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = Math.max(1, Math.round(sourceCrop.width));
      cropCanvas.height = Math.max(1, Math.round(sourceCrop.height));
      const cropCtx = cropCanvas.getContext("2d");
      if (!cropCtx) return;

      cropCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      cropCtx.drawImage(
        image,
        sourceCrop.x,
        sourceCrop.y,
        sourceCrop.width,
        sourceCrop.height,
        0,
        0,
        cropCanvas.width,
        cropCanvas.height,
      );

      const url = cropCanvas.toDataURL("image/png");
      setEditedImageUrl(url);
      setIsCropActive(false);
      setCropRect(null);
    };
  };

  const resetCrop = () => {
    setCropRect(null);
    setIsCropActive(false);
    setEditedImageUrl(null);
  };

  const buildEditedImageBlob = async (): Promise<Blob> => {
    if (!imageRef.current || !media) {
      throw new Error("Image is not ready for saving.");
    }

    if (editedImageUrl && !cropRect && rotation === 0) {
      const response = await fetch(editedImageUrl);
      const blob = await response.blob();
      if (blob) {
        return blob;
      }
    }

    const imageElement = imageRef.current;
    const sourceImage = editedImageUrl ?? media.file_url;
    const originalImage = new Image();
    originalImage.crossOrigin = "anonymous";
    originalImage.src = sourceImage;

    await new Promise<void>((resolve, reject) => {
      originalImage.onload = () => resolve();
      originalImage.onerror = () => reject(new Error("Unable to load the original image."));
    });

    const naturalWidth = originalImage.naturalWidth || media.width || imageElement.naturalWidth;
    const naturalHeight = originalImage.naturalHeight || media.height || imageElement.naturalHeight;
    const imageBounds = getImageBounds();
    const fullImageCanvas = drawImageToCanvas(originalImage, naturalWidth, naturalHeight);
    if (!fullImageCanvas) {
      throw new Error("Unable to create an image canvas.");
    }

    let renderCanvas: HTMLCanvasElement = fullImageCanvas;
    if (cropRect && cropRect.width > 0 && cropRect.height > 0) {
      if (!imageBounds) {
        throw new Error("Unable to calculate the crop area.");
      }

      const sourceCrop = getSourceCropRect(cropRect, imageBounds, naturalWidth, naturalHeight);
      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = Math.max(1, Math.round(sourceCrop.width));
      cropCanvas.height = Math.max(1, Math.round(sourceCrop.height));
      const cropCtx = cropCanvas.getContext("2d");
      if (!cropCtx) {
        throw new Error("Unable to create a crop image canvas.");
      }

      cropCtx.drawImage(
        originalImage,
        sourceCrop.x,
        sourceCrop.y,
        sourceCrop.width,
        sourceCrop.height,
        0,
        0,
        cropCanvas.width,
        cropCanvas.height,
      );
      renderCanvas = cropCanvas;
    }

    const angle = (rotation * Math.PI) / 180;
    const cos = Math.abs(Math.cos(angle));
    const sin = Math.abs(Math.sin(angle));
    const rotatedWidth = Math.round(renderCanvas.width * cos + renderCanvas.height * sin);
    const rotatedHeight = Math.round(renderCanvas.width * sin + renderCanvas.height * cos);

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, rotatedWidth);
    canvas.height = Math.max(1, rotatedHeight);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Unable to create an image canvas.");
    }

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle);
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    ctx.drawImage(
      renderCanvas,
      -renderCanvas.width / 2,
      -renderCanvas.height / 2,
      renderCanvas.width,
      renderCanvas.height,
    );
    ctx.restore();

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("Unable to encode the edited photo."));
      }, "image/png");
    });
  };

  const handleSaveEdits = async () => {
    if (!media || isSaving) return;

    setIsSaving(true);
    setError(null);
    setSaveMessage(null);

    try {
      const blob = await buildEditedImageBlob();
      const formData = new FormData();
      formData.append("file", blob, `${media.original_filename || "edited-photo"}.png`);

      await saveMediaEdits(media.id, formData);
      setSaveMessage("Your edits were saved and the photo was updated.");
      setEditedImageUrl(null);
      setCropRect(null);
      setIsCropActive(false);
      await loadMedia(media.id);
    } catch (saveError) {
      console.error(saveError);
      setError("Unable to save the edited photo.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <main className="p-8">Loading editor...</main>;
  }

  if (error || !media) {
    return (
      <main className="p-8">
        <p className="text-red-600">{error || "Media not found."}</p>
      </main>
    );
  }

  const filterStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
    transform: `rotate(${rotation}deg)`,
  };
  const cropContent = isCropActive ? getContainerContent() : null;

  return (
    <main className="p-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <section className="flex-1 rounded-3xl border p-6 shadow-sm bg-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Photo Editor</h1>
              <p className="text-sm text-gray-500 mt-1">{media.original_filename}</p>
            </div>
            <button
              onClick={() => router.back()}
              className="text-blue-600 underline"
            >
              Back
            </button>
          </div>

          <div
            ref={imageContainerRef}
            className="relative rounded-3xl overflow-hidden border bg-black p-4"
            onPointerMove={isCropActive && dragStart ? updateCrop : undefined}
            onPointerUp={isCropActive && dragStart ? endCrop : undefined}
          >
            <img
              ref={imageRef}
              src={editedImageUrl ?? media.file_url}
              alt={media.original_filename}
              className="w-full max-h-[70vh] object-contain select-none"
              style={filterStyle}
              draggable={false}
              onMouseDown={handleImageInteraction}
              onMouseMove={handleImageInteraction}
              onMouseUp={handleImageInteraction}
              onDragStart={(event) => event.preventDefault()}
            />

              {isCropActive && cropRect && cropContent && (
                <div
                  className="absolute pointer-events-none overflow-visible"
                  style={{
                    left: cropContent.x,
                    top: cropContent.y,
                    width: cropContent.width,
                    height: cropContent.height,
                  }}
                >
                  <div
                    className="absolute cursor-grab touch-none select-none border-[2px] border-white/90 bg-transparent pointer-events-auto will-change-transform"
                    style={{
                      transform: `translate3d(${cropRect.x}px, ${cropRect.y}px, 0)`,
                      width: cropRect.width,
                      height: cropRect.height,
                      boxShadow: `0 0 0 9999px rgba(15, 23, 42, 0.45), inset 0 0 0 1px rgba(255,255,255,0.2)`,
                    }}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      startCrop(event);
                    }}
                  >
                    {showCropGuides && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute left-1/3 top-0 h-full w-px border-l border-white/50" />
                        <div className="absolute left-2/3 top-0 h-full w-px border-l border-white/50" />
                        <div className="absolute left-0 top-1/3 h-px w-full border-t border-white/50" />
                        <div className="absolute left-0 top-2/3 h-px w-full border-t border-white/50" />
                      </div>
                    )}
                  </div>
                  {[
                    { key: "nw", left: cropRect.x, top: cropRect.y },
                    { key: "n", left: cropRect.x + cropRect.width / 2, top: cropRect.y },
                    { key: "ne", left: cropRect.x + cropRect.width, top: cropRect.y },
                    { key: "e", left: cropRect.x + cropRect.width, top: cropRect.y + cropRect.height / 2 },
                    { key: "se", left: cropRect.x + cropRect.width, top: cropRect.y + cropRect.height },
                    { key: "s", left: cropRect.x + cropRect.width / 2, top: cropRect.y + cropRect.height },
                    { key: "sw", left: cropRect.x, top: cropRect.y + cropRect.height },
                    { key: "w", left: cropRect.x, top: cropRect.y + cropRect.height / 2 },
                  ].map((handle) => (
                    <div
                      key={handle.key}
                      className={`absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full border border-blue-400 bg-white shadow-sm pointer-events-auto will-change-transform ${getHandleCursorClass(handle.key)}`}
                      style={{ transform: `translate3d(${handle.left}px, ${handle.top}px, 0) translate(-50%, -50%)` }}
                      onPointerDown={(event) => {
                        event.stopPropagation();
                        startCrop(event);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setRotation((current) => current - 90)}
              className="rounded-full border px-4 py-2 text-sm hover:bg-slate-100"
            >
              Rotate Left
            </button>
            <button
              type="button"
              onClick={() => setRotation((current) => current + 90)}
              className="rounded-full border px-4 py-2 text-sm hover:bg-slate-100"
            >
              Rotate Right
            </button>
            <button
              type="button"
              onClick={() => {
                setBrightness(100);
                setContrast(100);
                setSaturation(100);
                setRotation(0);
                setEditedImageUrl(null);
                setCropRect(null);
              }}
              className="rounded-full border px-4 py-2 text-sm hover:bg-slate-100"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCropActive(true);
                const defaultCrop = createDefaultCrop();
                if (defaultCrop) {
                  setCropRect(defaultCrop);
                }
              }}
              className="rounded-full border px-4 py-2 text-sm hover:bg-slate-100"
            >
              Crop
            </button>
            {isCropActive && (
              <div className="flex items-center gap-2 rounded-full border px-3 py-2 text-sm">
                <span className="text-gray-500">Ratio</span>
                <select
                  value={cropPreset}
                  onChange={(event) => handleCropPresetChange(event.target.value as typeof cropPreset)}
                  className="bg-transparent outline-none"
                >
                  <option value="free">Free</option>
                  <option value="1:1">1:1</option>
                  <option value="4:3">4:3</option>
                  <option value="16:9">16:9</option>
                  <option value="3:4">3:4</option>
                </select>
              </div>
            )}
            {isCropActive && (
              <button
                type="button"
                onClick={() => setShowCropGuides((current) => !current)}
                className="rounded-full border px-4 py-2 text-sm hover:bg-slate-100"
              >
                {showCropGuides ? "Hide Guides" : "Show Guides"}
              </button>
            )}
            {isCropActive && (
              <button
                type="button"
                onClick={applyCrop}
                disabled={!cropRect?.width || !cropRect?.height}
                className="rounded-full border px-4 py-2 text-sm hover:bg-slate-100 disabled:opacity-50"
              >
                Apply Crop
              </button>
            )}
            {isCropActive && (
              <button
                type="button"
                onClick={resetCrop}
                className="rounded-full border px-4 py-2 text-sm hover:bg-slate-100"
              >
                Cancel Crop
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveEdits}
              disabled={isSaving}
              className="rounded-full border border-black bg-black px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "Saving..." : "Save Edits"}
            </button>
          </div>

          {saveMessage && (
            <p className="mt-4 text-sm text-emerald-600">{saveMessage}</p>
          )}
        </section>

        <aside className="w-full max-w-md rounded-3xl border p-6 shadow-sm bg-white">
          <h2 className="text-2xl font-semibold mb-4">Adjustments</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Brightness
              </label>
              <input
                type="range"
                min={50}
                max={150}
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full mt-2"
              />
              <div className="text-sm text-gray-500">{brightness}%</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contrast
              </label>
              <input
                type="range"
                min={50}
                max={150}
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full mt-2"
              />
              <div className="text-sm text-gray-500">{contrast}%</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Saturation
              </label>
              <input
                type="range"
                min={50}
                max={150}
                value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
                className="w-full mt-2"
              />
              <div className="text-sm text-gray-500">{saturation}%</div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(editedImageUrl ?? media.file_url)}
              className="rounded-xl bg-black text-white px-4 py-3 hover:bg-slate-800"
            >
              Copy URL
            </button>
            <a
              href={editedImageUrl ?? media.file_url}
              download
              className="rounded-xl border border-black px-4 py-3 text-center hover:bg-slate-100"
            >
              Download Edited Photo
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}
