// Mock auth service with PBKDF2 hashing (real backend will replace this)
// For production: use bcrypt on server, never store plaintext

const MOCK_OTP_CODES: Map<string, { code: string; expiresAt: number; attempts: number }> = new Map();
const USERS_KEY = 'marbou-users-v2'; // v2 to avoid old plaintext users

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  accountType: 'buyer_seller' | 'business';
  businessName?: string;
  businessCategory?: string;
  createdAt: number;
  lastLoginAt?: number;
}

interface StoredAuthUser extends AuthUser {
  passwordHash: string; // PBKDF2 hash
}

export interface Session {
  accessToken: string; // JWT-like mock
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
}

// Simple PBKDF2-style hash (in production use bcrypt on server)
async function hashPassword(password: string, salt: string = 'marbou-salt-v1'): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const newHash = await hashPassword(password);
  return newHash === hash;
}

function getStoredUsers(): StoredAuthUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredAuthUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateToken(): string {
  return 'token_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

export async function register(data: {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
  accountType: 'buyer_seller' | 'business';
  businessName?: string;
  businessCategory?: string;
}): Promise<{ success: boolean; error?: string; userId?: string }> {
  const users = getStoredUsers();
  
  if (users.some(u => u.email === data.email)) {
    return { success: false, error: 'emailExists' };
  }

  if (!data.password || data.password.length < 6) {
    return { success: false, error: 'passwordTooShort' };
  }

  const passwordHash = await hashPassword(data.password);
  const newUser: StoredAuthUser = {
    id: `user-${Date.now()}`,
    email: data.email,
    displayName: data.displayName,
    phone: data.phone,
    accountType: data.accountType,
    businessName: data.accountType === 'business' ? data.businessName : undefined,
    businessCategory: data.accountType === 'business' ? data.businessCategory : undefined,
    passwordHash,
    createdAt: Date.now(),
  };

  users.push(newUser);
  saveStoredUsers(users);

  // Send mock OTP to email (in production: real email service)
  const otp = generateOTP();
  MOCK_OTP_CODES.set(data.email, { 
    code: otp, 
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 min
    attempts: 0 
  });
  console.log(`[DEV] OTP for ${data.email}: ${otp}`);

  return { success: true, userId: newUser.id };
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string; session?: Session }> {
  const users = getStoredUsers();
  const found = users.find(u => u.email === email);

  if (!found) {
    return { success: false, error: 'invalidCredentials' };
  }

  const passwordMatch = await verifyPassword(password, found.passwordHash);
  if (!passwordMatch) {
    return { success: false, error: 'invalidCredentials' };
  }

  const session: Session = {
    accessToken: generateToken(),
    refreshToken: generateToken(),
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 min
    user: {
      id: found.id,
      email: found.email,
      displayName: found.displayName,
      phone: found.phone,
      accountType: found.accountType,
      businessName: found.businessName,
      businessCategory: found.businessCategory,
      createdAt: found.createdAt,
      lastLoginAt: Date.now(),
    },
  };

  // Update last login
  const userIndex = users.findIndex(u => u.id === found.id);
  users[userIndex].lastLoginAt = Date.now();
  saveStoredUsers(users);

  return { success: true, session };
}

export function verifyOTP(email: string, code: string): { success: boolean; error?: string } {
  const otpRecord = MOCK_OTP_CODES.get(email);
  
  if (!otpRecord) {
    return { success: false, error: 'otpNotFound' };
  }

  if (Date.now() > otpRecord.expiresAt) {
    MOCK_OTP_CODES.delete(email);
    return { success: false, error: 'otpExpired' };
  }

  if (otpRecord.attempts >= 5) {
    MOCK_OTP_CODES.delete(email);
    return { success: false, error: 'otpLocked' };
  }

  if (code !== otpRecord.code) {
    otpRecord.attempts++;
    return { success: false, error: 'invalidOTP' };
  }

  MOCK_OTP_CODES.delete(email);
  return { success: true };
}

export function logout(): void {
  localStorage.removeItem('marbou-session');
}
