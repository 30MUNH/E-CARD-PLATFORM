import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { DEFAULT_ECARD_CONFIG, DEFAULT_ECARD_UUID } from './data/ecardData';
import { MediaProvider } from './context/MediaContext';
import { getCardAccessService } from './services';
import { EcardConfig, PinVerificationResult } from './types/ecard';
import { EcardRenderer } from './renderer/EcardRenderer';
import { CustomEditRedirectPage, SignInPage } from './components/SignInPage';
import { ZaloBrowserModal } from './components/ZaloBrowserModal';
import { EditorProvider } from './admin/context/EditorContext';
import { AdminLayout } from './admin/AdminLayout';
import { DashboardPage } from './admin/pages/DashboardPage';
import { CardListPage } from './admin/pages/CardListPage';
import { CardEditorPage } from './admin/pages/CardEditorPage';
import { PreviewPage } from './admin/pages/PreviewPage';

const RecipientEcardRoute: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const cardId = uuid || DEFAULT_ECARD_UUID;
  const [cardConfig, setCardConfig] = useState<EcardConfig>(() => DEFAULT_ECARD_CONFIG);

  useEffect(() => {
    let cancelled = false;
    const accessService = getCardAccessService();
    void accessService
      .getAuthorizedCardContent(cardId)
      .then((loaded) => {
        if (!cancelled) {
          setCardConfig(loaded);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCardConfig(DEFAULT_ECARD_CONFIG);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cardId]);

  const handleVerifyPin = async (pin: string): Promise<PinVerificationResult> => {
    return getCardAccessService().verifyPin(cardId, pin);
  };

  return (
    <>
      <ZaloBrowserModal />
      <EcardRenderer
        config={cardConfig}
        onVerifyPin={handleVerifyPin}
        onCardUnlocked={(unlocked) => setCardConfig(unlocked)}
      />
    </>
  );
};

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
