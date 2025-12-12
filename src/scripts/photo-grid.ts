import justifiedLayout from 'justified-layout';
import GLightbox from 'glightbox';

interface JustifiedLayoutResult {
  containerHeight: number;
  widowCount: number;
  boxes: LayoutBox[];
}

interface LayoutBox {
  aspectRatio: number;
  top: number;
  width: number;
  height: number;
  left: number;
  forcedAspectRatio?: boolean;
}

let lastContainerWidth = 0;

export async function setupGallery() {
  if (typeof document === 'undefined') return;

  const container = document.getElementById('photo-grid');
  if (!container) return;

  const containerWidth = container.clientWidth;
  if (containerWidth === lastContainerWidth) return; // skip if width unchanged
  lastContainerWidth = containerWidth;

  const imageLinks = Array.from(container.querySelectorAll('.photo-item')) as HTMLElement[];
  if (imageLinks.length === 0) return;

  container.style.opacity = '0'; // hide during layout

  const imageElements = await waitForImagesToLoad(container);
  const layout = createLayoutFor(imageElements, container);

  applyImagesStyleBasedOnLayout(imageLinks, layout);
  applyContainerStyleBasedOnLayout(container, layout);

  container.style.transition = 'opacity 0.2s ease';
  container.style.opacity = '1';

  GLightbox({
    selector: '.glightbox',
    openEffect: 'zoom',
    closeEffect: 'fade',
    width: 'auto',
    height: 'auto',
  });
}

function createLayoutFor(
  imageElements: HTMLImageElement[],
  container: HTMLElement,
): JustifiedLayoutResult {
  const imageSizes = imageElements.map((img) => ({
    width: img.naturalWidth || img.width || 300,
    height: img.naturalHeight || img.height || 200,
  }));

  const containerPadding = 16; // matches Tailwind px-4
  const boxSpacing = 10;

  return justifiedLayout(imageSizes, {
    containerWidth: container.clientWidth || window.innerWidth,
    targetRowHeight: 300,
    boxSpacing,
    containerPadding,
  });
}

async function waitForImagesToLoad(container: HTMLElement) {
  const imageElements = Array.from(container.querySelectorAll('img')) as HTMLImageElement[];
  await Promise.all(
    imageElements.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) resolve(null);
          else {
            img.onload = () => resolve(null);
            img.onerror = () => resolve(null);
          }
        }),
    ),
  );
  return imageElements;
}

function applyImagesStyleBasedOnLayout(imageLinks: HTMLElement[], layout: JustifiedLayoutResult) {
  imageLinks.forEach((el, i) => {
    if (!layout.boxes[i]) return;
    const { left, top, width, height } = layout.boxes[i];

    el.style.position = 'absolute';
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    el.style.display = 'block';
  });
}

function applyContainerStyleBasedOnLayout(container: HTMLElement, layout: JustifiedLayoutResult) {
  container.style.position = 'relative';
  container.style.height = `${layout.containerHeight}px`;
}

// Optimized resize using requestAnimationFrame
function optimizedResize(func: () => void) {
  let running = false;
  window.addEventListener('resize', () => {
    if (running) return;
    running = true;
    requestAnimationFrame(() => {
      func();
      running = false;
    });
  });
}

// Run once on DOMContentLoaded
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', setupGallery);
  optimizedResize(setupGallery);
}
