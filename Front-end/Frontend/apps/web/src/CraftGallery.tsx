import { useRef, useState, type CSSProperties, type PointerEvent, type TouchEvent } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import type { CraftGalleryImage } from '../data/demoCraft';

type Props = {
  images: CraftGalleryImage[];
  productName: string;
};

type ZoomPosition = { x: number; y: number };

export function CraftGallery({ images, productName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [pointerInside, setPointerInside] = useState(false);
  const [manualZoom, setManualZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState<ZoomPosition>({ x: 50, y: 50 });
  const touchStartX = useRef<number | null>(null);
  const activeImage = images[activeIndex];
  const isZoomed = pointerInside || manualZoom;

  function showImage(index: number) {
    const nextIndex = (index + images.length) % images.length;
    setActiveIndex(nextIndex);
    setManualZoom(false);
    setPointerInside(false);
    setZoomPosition({ x: 50, y: 50 });
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    setZoomPosition({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartX.current = null;
    if (startX === null || endX === undefined) return;

    const distance = endX - startX;
    if (Math.abs(distance) < 45) return;
    showImage(activeIndex + (distance < 0 ? 1 : -1));
  }

  if (images.length === 0) {
    return <div className="craft-gallery-empty" role="status">Nenhuma fotografia disponível para este artesanato.</div>;
  }

  const zoomStyle = {
    '--zoom-x': `${zoomPosition.x}%`,
    '--zoom-y': `${zoomPosition.y}%`,
  } as CSSProperties;

  return (
    <section className="craft-gallery" aria-label={`Galeria de imagens: ${productName}`}>
      <div className="craft-gallery-stage-wrap">
        <div
          className={`craft-gallery-stage${isZoomed ? ' is-zoomed' : ''}`}
          style={zoomStyle}
          onPointerEnter={(event) => {
            if (event.pointerType === 'mouse') setPointerInside(true);
          }}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setPointerInside(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-label="Passe o cursor para ampliar em 2,5 vezes ou deslize para trocar de imagem"
        >
          <img
            key={activeImage.id}
            src={activeImage.src}
            alt={activeImage.alt}
            className="craft-gallery-main-image"
            draggable={false}
            fetchPriority="high"
          />

          {images.length > 1 && <>
            <button
              type="button"
              className="craft-gallery-arrow is-previous"
              onClick={() => showImage(activeIndex - 1)}
              aria-label="Ver imagem anterior"
            ><ChevronLeft size={21} /></button>
            <button
              type="button"
              className="craft-gallery-arrow is-next"
              onClick={() => showImage(activeIndex + 1)}
              aria-label="Ver próxima imagem"
            ><ChevronRight size={21} /></button>
          </>}

          <button
            type="button"
            className="craft-gallery-zoom-toggle"
            onClick={() => setManualZoom((zoom) => !zoom)}
            aria-pressed={manualZoom}
            aria-label={manualZoom ? 'Reduzir imagem' : 'Ampliar imagem em 2,5 vezes'}
          >
            {isZoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
            <span>{isZoomed ? 'Reduzir' : 'Zoom 2,5×'}</span>
          </button>
        </div>

        <p className="craft-gallery-zoom-hint">Passe o cursor sobre a foto para explorar a textura em 2,5×.</p>
        <div className="craft-gallery-credit">
          <span>Imagem de referência</span>
          <a href={activeImage.creditUrl} target="_blank" rel="noreferrer">{activeImage.creditLabel}</a>
        </div>
      </div>

      {images.length > 1 && (
        <div className="craft-gallery-thumbnails" role="group" aria-label="Selecionar fotografia">
          {images.map((image, index) => (
            <button
              type="button"
              key={image.id}
              className={`craft-gallery-thumbnail${index === activeIndex ? ' is-active' : ''}`}
              onClick={() => showImage(index)}
              aria-label={`Mostrar imagem ${index + 1}: ${image.alt}`}
              aria-pressed={index === activeIndex}
            >
              <img src={image.src} alt="" loading="lazy" draggable={false} />
            </button>
          ))}
        </div>
      )}
      <span className="craft-gallery-counter" aria-live="polite">
        Imagem {activeIndex + 1} de {images.length}
      </span>
    </section>
  );
}
