export interface AdminPrincipal {
  userId: string;
  role: 'admin' | 'editor';
}

export interface RecipientSession {
  cardId: string;
  expiresAt: number;
}

export interface AdminRepository {
  list(filter: { status?: string; search?: string }, principal: AdminPrincipal): Promise<unknown>;
  get(id: string, principal: AdminPrincipal): Promise<unknown | null>;
  getPublished(id: string, principal: AdminPrincipal): Promise<unknown | null>;
  create(payload: unknown, principal: AdminPrincipal): Promise<unknown>;
  update(id: string, payload: unknown, principal: AdminPrincipal): Promise<unknown>;
  saveDraft(id: string, payload: unknown, principal: AdminPrincipal): Promise<unknown>;
  publish(id: string, expectedVersion: number | undefined, principal: AdminPrincipal): Promise<unknown>;
  archive(id: string, principal: AdminPrincipal): Promise<unknown>;
  templates(principal: AdminPrincipal): Promise<unknown>;
}

export interface PublicRepository {
  metadata(slug: string): Promise<unknown | null>;
  verifyPin(slug: string, pin: string): Promise<{ cardId: string; versionId: string } | null>;
  createSession(cardId: string): Promise<{ token: string; expiresAt: string }>;
  resolveSession(token: string): Promise<RecipientSession | null>;
  content(slug: string): Promise<unknown | null>;
}

export interface MediaRepository {
  upload(request: Request, principal: AdminPrincipal): Promise<unknown>;
  delete(id: string, principal: AdminPrincipal): Promise<void>;
}

export interface ApiDeps {
  admin: {
    authenticate(request: Request): Promise<AdminPrincipal | null>;
  };
  cards: AdminRepository;
  media?: MediaRepository;
  public: PublicRepository;
}
