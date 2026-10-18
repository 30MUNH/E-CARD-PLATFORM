import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  List,
  LoaderCircle,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { PdfAssetDescriptor } from '../types/ecard';
import './PdfFlipbook.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

type FlipBookApi = {
  pageFlip: () => {
    flip: (page: number) => void;
    flipNext: () => void;
    flipPrev: () => void;
  };
};

interface PdfFlipbookProps {
  asset: PdfAssetDescriptor | null | undefined;
  mode?: 'reader' | 'preview';
  onRefreshAsset?: () => Promise<void>;
  onBack?: () => void;
  onNext?: () => void;
}

interface Bookmark {
  title: string;
  pageIndex: number;
}

interface OutlineNode {
  title: string;
  dest: string | unknown[] | null;
  items: OutlineNode[];
}

interface PdfPageProps {
  document: PDFDocumentProxy;
  pageIndex: number;
  shouldRender: boolean;
  width: number;
  height: number;
}

const PdfPage = forwardRef<HTMLDivElement, PdfPageProps>(
  ({ document, pageIndex, shouldRender, width, height }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !shouldRender) return;
      let cancelled = false;
      let renderTask: { cancel: () => void; promise: Promise<unknown> } | undefined;

      void document.getPage(pageIndex + 1).then((page) => {
        if (cancelled) return;
        const baseViewport = page.getViewport({ scale: 1 });
        const fitScale = Math.min(width / baseViewport.width, height / baseViewport.height);
        const outputScale = Math.min(window.devicePixelRatio || 1, 1.35);
        const viewport = page.getViewport({ scale: fitScale * outputScale });
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) return;

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        renderTask = page.render({ canvas, canvasContext: context, viewport });
        void renderTask.promise.catch((error: unknown) => {
          if (!cancelled && !(error instanceof Error && error.name === 'RenderingCancelledException')) {
            // The outer document loader handles user-visible PDF errors.
          }
        });
      });

      return () => {
        cancelled = true;
        renderTask?.cancel();
      };
    }, [document, height, pageIndex, shouldRender, width]);

    return (
      <div ref={ref} className="song-hanh-pdf-page" aria-label={`Trang ${pageIndex + 1}`}>
        <canvas ref={canvasRef} />
        <span className="song-hanh-pdf-page-number">{pageIndex + 1}</span>
      </div>
    );
  }
);
PdfPage.displayName = 'PdfPage';

function flattenOutline(outline: OutlineNode[], document: PDFDocumentProxy): Promise<Bookmark[]> {
  const items: OutlineNode[] = [];
  const visit = (entries: OutlineNode[]) => {
    for (const entry of entries) {
      items.push({ title: entry.title, dest: entry.dest, items: entry.items });
      if (entry.items) visit(entry.items);
    }
  };
  visit(outline);

  return Promise.all(
    items.map(async (item) => {
      try {
        const destination = typeof item.dest === 'string'
          ? await document.getDestination(item.dest)
          : item.dest;
        const pageRef = destination?.[0];
        if (!pageRef) return null;
        return { title: item.title, pageIndex: await document.getPageIndex(pageRef as never) };
      } catch {
        return null;
      }
    })
  ).then((resolved) => resolved.filter((item): item is Bookmark => item !== null));
}

export const PdfFlipbook: React.FC<PdfFlipbookProps> = ({ asset, mode = 'reader', onRefreshAsset, onBack, onNext }) => {
  const rootRef = useRef<HTMLElement>(null);
  const flipBookRef = useRef<FlipBookApi | null>(null);
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(asset?.url));
  const [error, setError] = useState<string | null>(null);
  const [showContents, setShowContents] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!asset?.url) {
      setDocument(null);
      setPageCount(0);
      setBookmarks([]);
      setCurrentPage(0);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    const loadingTask = pdfjsLib.getDocument({ url: asset.url });
    setDocument(null);
    setPageCount(0);
    setBookmarks([]);
    setCurrentPage(0);
    setIsLoading(true);
    setError(null);

    void loadingTask.promise
      .then(async (loadedDocument) => {
        const outline = await loadedDocument.getOutline();
        const loadedBookmarks = outline ? await flattenOutline(outline, loadedDocument) : [];
        if (cancelled) {
          await loadedDocument.destroy();
          return;
        }
        setDocument(loadedDocument);
        setPageCount(loadedDocument.numPages);
        setBookmarks(loadedBookmarks);
        setIsLoading(false);
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : 'Không thể mở tệp PDF này.');
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
      void loadingTask.destroy();
    };
  }, [asset?.url, reloadToken]);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(documentFullscreenElement() === rootRef.current);
    window.addEventListener('fullscreenchange', syncFullscreen);
    return () => window.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  const pageWidth = useMemo(() => {
    const width = containerSize.width || 360;
    return Math.max(220, Math.min(420, width > 760 ? width / 2 - 42 : width - 40));
  }, [containerSize.width]);
  const pageHeight = Math.round(pageWidth * 1.414);
  const renderRadius = 3;
  const displayedPage = Math.min(currentPage + 1, Math.max(pageCount, 1));

  const flipTo = useCallback((pageIndex: number) => {
    const clampedPage = Math.min(Math.max(pageIndex, 0), Math.max(pageCount - 1, 0));
    flipBookRef.current?.pageFlip().flip(clampedPage);
    setCurrentPage(clampedPage);
  }, [pageCount]);

  const handleFlip = useCallback((event: { data: number }) => {
    setCurrentPage(event.data);
    if (soundEnabled) {
      const sound = new Audio('/sounds/tap.mp3');
      sound.volume = 0.22;
      void sound.play().catch(() => undefined);
    }
  }, [soundEnabled]);

  const toggleFullscreen = async () => {
    const root = rootRef.current;
    if (!root) return;
    if (documentFullscreenElement()) {
      await window.document.exitFullscreen?.();
    } else {
      await root.requestFullscreen?.();
    }
  };

  if (!asset?.url) {
    return (
      <section ref={rootRef} className={`song-hanh-reader song-hanh-reader-${mode}`} aria-label="Sách lật PDF">
        <div className="song-hanh-reader-empty">
          <span className="song-hanh-reader-mark">SHK</span>
          <BookOpen aria-hidden="true" size={30} />
          <p>Chưa có sách PDF</p>
          {mode === 'preview' && <small>Tải PDF lên để xem trước sách lật.</small>}
          <CardSlideNavigation mode={mode} onBack={onBack} onNext={onNext} />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      className={`song-hanh-reader song-hanh-reader-${mode}`}
      aria-label="Trình đọc sách lật SONG HÀNH KÝ"
    >
      <header className="song-hanh-reader-toolbar">
        <div className="song-hanh-reader-brand" aria-label="SONG HÀNH KÝ">
          <span className="song-hanh-reader-brand-mark">SHK</span>
          <span>SONG HÀNH KÝ</span>
        </div>
        <div className="song-hanh-reader-tools">
          <button type="button" aria-label="Mục lục" aria-pressed={showContents} onClick={() => setShowContents((value) => !value)}>
            <List size={19} />
          </button>
          <button type="button" aria-label="Thu nhỏ" disabled={zoom <= 0.75} onClick={() => setZoom((value) => Math.max(0.75, value - 0.15))}>
            <ZoomOut size={19} />
          </button>
          <button type="button" aria-label="Phóng to" disabled={zoom >= 1.6} onClick={() => setZoom((value) => Math.min(1.6, value + 0.15))}>
            <ZoomIn size={19} />
          </button>
          <button type="button" aria-label={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'} onClick={() => void toggleFullscreen()}>
            {isFullscreen ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
          </button>
          <button type="button" aria-label={soundEnabled ? 'Tắt âm thanh lật trang' : 'Bật âm thanh lật trang'} aria-pressed={soundEnabled} onClick={() => setSoundEnabled((value) => !value)}>
            {soundEnabled ? <Volume2 size={19} /> : <VolumeX size={19} />}
          </button>
        </div>
      </header>

      {showContents && (
        <aside className="song-hanh-reader-contents" aria-label="Mục lục sách">
          <div className="song-hanh-reader-contents-title"><FileText size={15} /> Nội dung sách</div>
          <div className="song-hanh-reader-contents-list">
            {(bookmarks.length > 0
              ? bookmarks
              : Array.from({ length: pageCount }, (_, pageIndex) => ({ title: `Trang ${pageIndex + 1}`, pageIndex }))
            ).map((item, index) => (
              <button key={`${item.pageIndex}-${index}`} type="button" onClick={() => flipTo(item.pageIndex)}>
                <span>{item.title}</span><small>{item.pageIndex + 1}</small>
              </button>
            ))}
          </div>
        </aside>
      )}

      <div className="song-hanh-reader-stage" aria-busy={isLoading}>
        {isLoading && (
          <div className="song-hanh-reader-state" role="status">
            <LoaderCircle className="song-hanh-reader-spinner" size={28} />
            <span>Đang mở sách…</span>
          </div>
        )}
        {error && !isLoading && (
          <div className="song-hanh-reader-state song-hanh-reader-error" role="alert">
            <FileText size={26} />
            <strong>Không mở được sách PDF</strong>
            <span>{error}</span>
            <button type="button" onClick={() => {
              void (async () => {
                try { await onRefreshAsset?.(); } finally { setReloadToken((value) => value + 1); }
              })();
            }}>Thử tải lại</button>
          </div>
        )}
        {document && !isLoading && !error && (
          <div className="song-hanh-reader-book-scroll">
            <div className="song-hanh-reader-book-scale" style={{ transform: `scale(${zoom})` }}>
              <HTMLFlipBook
                key={`${document.numPages}-${pageWidth}-${pageHeight}`}
                ref={flipBookRef}
                className="song-hanh-reader-book"
                style={{ margin: '0 auto' }}
                startPage={0}
                width={pageWidth}
                height={pageHeight}
                size="fixed"
                minWidth={pageWidth}
                maxWidth={pageWidth}
                minHeight={pageHeight}
                maxHeight={pageHeight}
                drawShadow
                flippingTime={620}
                usePortrait
                startZIndex={0}
                autoSize={false}
                maxShadowOpacity={0.55}
                showCover
                mobileScrollSupport={false}
                clickEventForward
                useMouseEvents
                swipeDistance={34}
                showPageCorners
                disableFlipByClick={false}
                onFlip={handleFlip}
              >
                {Array.from({ length: pageCount }, (_, pageIndex) => (
                  <PdfPage
                    key={`${asset.id}-${pageIndex}`}
                    document={document}
                    pageIndex={pageIndex}
                    shouldRender={Math.abs(pageIndex - currentPage) <= renderRadius}
                    width={pageWidth}
                    height={pageHeight}
                  />
                ))}
              </HTMLFlipBook>
            </div>
          </div>
        )}
      </div>

      <footer className="song-hanh-reader-navigation">
        <button type="button" aria-label="Trang trước" disabled={!document || currentPage <= 0} onClick={() => flipBookRef.current?.pageFlip().flipPrev()}>
          <ChevronLeft size={18} />
        </button>
        <input
          aria-label="Chọn trang sách"
          type="range"
          min={1}
          max={Math.max(pageCount, 1)}
          value={displayedPage}
          disabled={!document}
          onChange={(event) => flipTo(Number(event.target.value) - 1)}
        />
        <span className="song-hanh-reader-page-count">{displayedPage} / {pageCount || '—'}</span>
        <button type="button" aria-label="Trang tiếp theo" disabled={!document || currentPage >= pageCount - 1} onClick={() => flipBookRef.current?.pageFlip().flipNext()}>
          <ChevronRight size={18} />
        </button>
      </footer>
      <CardSlideNavigation mode={mode} onBack={onBack} onNext={onNext} />
    </section>
  );
};

const CardSlideNavigation: React.FC<Pick<PdfFlipbookProps, 'mode' | 'onBack' | 'onNext'>> = ({ mode, onBack, onNext }) => {
  if (mode === 'preview' || (!onBack && !onNext)) return null;
  return (
    <nav className="song-hanh-reader-card-navigation" aria-label="Điều hướng thiệp">
      <button type="button" aria-label="Quay lại thiệp" onClick={onBack} disabled={!onBack}>
        <img src="/template/back.png" alt="" />
        <span>Quay lại</span>
      </button>
      <button type="button" aria-label="Tiếp tục thiệp" onClick={onNext} disabled={!onNext}>
        <span>Tiếp tục</span>
        <img src="/template/next.png" alt="" />
      </button>
    </nav>
  );
};

function documentFullscreenElement(): Element | null {
  return typeof window !== 'undefined' ? window.document.fullscreenElement : null;
}
