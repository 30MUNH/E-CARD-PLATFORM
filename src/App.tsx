import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { DEFAULT_ECARD_CONFIG, DEFAULT_ECARD_UUID } from './data/ecardData';
import { MediaProvider } from './context/MediaContext';
import { getCardAccessService } from './services';
import { EcardConfig, PinVerificationResult, PublicCardMetadata } from './types/ecard';
import { EcardRenderer } from './renderer/EcardRenderer';
import { CustomEditRedirectPage, SignInPage } from './components/SignInPage';
import { ZaloBrowserModal } from './components/ZaloBrowserModal';
import { EditorProvider } from './admin/context/EditorContext';
import { AdminLayout } from './admin/AdminLayout';
import { DashboardPage } from './admin/pages/DashboardPage';
import { CardListPage } from './admin/pages/CardListPage';
import { CardEditorPage } from './admin/pages/CardEditorPage';
import { PreviewPage } from './admin/pages/PreviewPage';
import { AdminLoginPage } from './admin/pages/AdminLoginPage';
import { isApiMode } from './services/api/config';
import { clearRecipientAccessToken } from './services/api/auth';

const RecipientEcardRoute: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const cardId = uuid || DEFAULT_ECARD_UUID;
  const [cardConfig, setCardConfig] = useState<EcardConfig>(() => createPublicShell());
  const [shellConfig, setShellConfig] = useState<EcardConfig>(() => createPublicShell());
  const [isLoadingCard, setIsLoadingCard] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const accessService = getCardAccessService();
    setIsLoadingCard(true);
    setLoadError(false);
    void accessService.getPublicMetadata(cardId)
      .then(async (metadata) => {
        if (cancelled) return;
        const shell = createPublicShell(metadata);
        setShellConfig(shell);
        setCardConfig(shell);
        if (metadata.hasPin) return;
        return accessService.getAuthorizedCardContent(cardId);
      })
      .then((loaded) => {
        if (!loaded) return;
        if (!cancelled) {
          setCardConfig(loaded);
        }
      })
      .then(() => {
        if (!cancelled) setIsLoadingCard(false);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
          setIsLoadingCard(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cardId]);

  const handleVerifyPin = async (pin: string): Promise<PinVerificationResult> => {
    const accessService = getCardAccessService();
    const result = await accessService.verifyPin(cardId, pin);
    if (result.authorized && !result.cardContent) {
      return {
        ...result,
        cardContent: await accessService.getAuthorizedCardContent(cardId, result.accessToken),
      };
    }
    return result;
  };

  const handleRefreshContent = async () => {
    const accessService = getCardAccessService();
    if (!accessService.refreshAuthorizedCardContent) {
      throw new Error('Không hỗ trợ làm mới nội dung thiệp.');
    }
    return accessService.refreshAuthorizedCardContent(cardId);
  };

  return (
    <>
      <ZaloBrowserModal />
      {isLoadingCard ? (
        <div className="flex min-h-screen items-center justify-center bg-rose-50 text-rose-900">Đang mở thiệp…</div>
      ) : loadError ? (
        <div className="flex min-h-screen items-center justify-center bg-rose-50 px-6 text-center text-rose-900">
          Không thể tải thiệp lúc này. Vui lòng thử mở lại đường dẫn.
        </div>
      ) : (
        <EcardRenderer
          config={cardConfig}
          onVerifyPin={handleVerifyPin}
          onCardUnlocked={(unlocked) => setCardConfig(unlocked)}
          onRefreshAuthorizedContent={isApiMode() ? handleRefreshContent : undefined}
          onRecipientSessionExpired={() => {
            clearRecipientAccessToken(cardId);
            setCardConfig(shellConfig);
          }}
          onCardUnavailable={() => setLoadError(true)}
        />
      )}
    </>
  );
};

function createPublicShell(metadata?: PublicCardMetadata): EcardConfig {
  return {
    ...DEFAULT_ECARD_CONFIG,
    title: metadata?.title ?? 'Thiệp kỷ niệm',
    status: metadata?.status ?? 'published',
    ecardData: {
      ...DEFAULT_ECARD_CONFIG.ecardData,
      id: metadata?.id ?? DEFAULT_ECARD_CONFIG.ecardData.id,
      female_name: 'Người thương',
      male_name: 'Bạn',
      love_start_date: '',
      has_pin: metadata?.hasPin ?? true,
      template_id: metadata?.templateId ?? DEFAULT_ECARD_CONFIG.ecardData.template_id,
      owner_name: null,
      owner_phone: null,
      owner_addr: null,
      owner_maps: null,
    },
    albumData: [],
    albumPdf: null,
    provinceImages: [],
    letterData: { love_letters: [], audio_url: null, avatars: [] },
    musicData: [],
    hasVoice: false,
    hasVideo: false,
    videoData: { video_url: null },
    injectionData: [],
    wishboxData: [],
    specialDates: [],
    welcomeConfig: metadata?.welcomeConfig,
    pinScreenConfig: metadata?.pinScreenConfig,
    themeCustomization: metadata?.themeCustomization,
  };
}

export const App: React.FC = () => {
  return (
    <MediaProvider>
      <EditorProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={<Navigate to={`/ecd/game/${DEFAULT_ECARD_UUID}`} replace />}
            />
            {/* Recipient Experience Routes */}
            <Route path="/ecd/game/:uuid" element={<RecipientEcardRoute />} />
            <Route path="/ecd/custom-edit/:uuid" element={<CustomEditRedirectPage />} />
            <Route path="/ecd/signin/:uuid" element={<SignInPage />} />

            {/* Admin Platform Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="cards" element={<CardListPage />} />
              <Route path="cards/new" element={<CardEditorPage />} />
              <Route path="cards/:id/edit" element={<CardEditorPage />} />
              <Route path="cards/:id/preview" element={<PreviewPage />} />
              <Route path="preview" element={<PreviewPage />} />
            </Route>
            <Route path="/admin/login" element={<AdminLoginPage />} />

            <Route
              path="*"
              element={<Navigate to={`/ecd/game/${DEFAULT_ECARD_UUID}`} replace />}
            />
          </Routes>
        </BrowserRouter>
      </EditorProvider>
    </MediaProvider>
  );
};

export default App;
