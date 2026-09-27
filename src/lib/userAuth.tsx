import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInAnonymously
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import { playFortuneClickSound } from './sound';

export interface UserProfile {
  userId: string;
  nickname: string;
  avatarUrl: string;
  frameId: string;
  gardenStreak: number;
  lastCheckInDate: string;
  totalCheckIns: number;
  petals: number;
  updatedAt: number;
  email?: string | null;
  gardenData?: Record<string, any>;
}

export const DEFAULT_AVATAR = 'https://i.pinimg.com/736x/9c/22/0f/9c220f853800c55d195ed122379f4d9d.jpg';
export const DEFAULT_FRAME = 'frame-crown-rose';

export const PRESET_AVATARS = [
  'https://i.pinimg.com/736x/9c/22/0f/9c220f853800c55d195ed122379f4d9d.jpg',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80'
];

interface UserAuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  profile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, nickname?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  checkInGarden: () => Promise<{ success: boolean; alreadyCheckedIn: boolean; streak: number; gainedPetals: number }>;
  syncGardenData: (data: Record<string, any>) => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export function getTodayDateString(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

export function getYesterdayDateString(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(Date.now() - 86400000));
}

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = Boolean(user && !user.isAnonymous);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && !currentUser.isAnonymous) {
        // Fetch or listen to Firestore user_profiles
        const profileRef = doc(db, 'user_profiles', currentUser.uid);
        const unsubscribeProfile = onSnapshot(profileRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setProfile(data);
            try {
              localStorage.setItem('mei_user_nickname', data.nickname || '');
              localStorage.setItem('mei_user_avatar', data.avatarUrl || DEFAULT_AVATAR);
              localStorage.setItem('mei_user_frame', data.frameId || DEFAULT_FRAME);
            } catch {}
          } else {
            // Initialize new profile document
            const newProfile: UserProfile = {
              userId: currentUser.uid,
              nickname: currentUser.displayName || 'vợ iu bí mật 𝜗ৎ',
              avatarUrl: currentUser.photoURL || DEFAULT_AVATAR,
              frameId: DEFAULT_FRAME,
              gardenStreak: 0,
              lastCheckInDate: '',
              totalCheckIns: 0,
              petals: 0,
              updatedAt: Date.now(),
              email: currentUser.email
            };
            try {
              await setDoc(profileRef, newProfile, { merge: true });
              setProfile(newProfile);
            } catch (err) {
              console.warn('Init profile error:', err);
              setProfile(newProfile);
            }
          }
          setLoading(false);
        }, (err) => {
          console.warn('Profile listener error:', err);
          setLoading(false);
        });

        return () => unsubscribeProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), pass);
  };

  const signUpWithEmail = async (email: string, pass: string, nickname?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const newProfile: UserProfile = {
      userId: cred.user.uid,
      nickname: nickname?.trim() || 'vợ iu bí mật 𝜗ৎ',
      avatarUrl: DEFAULT_AVATAR,
      frameId: DEFAULT_FRAME,
      gardenStreak: 0,
      lastCheckInDate: '',
      totalCheckIns: 0,
      petals: 0,
      updatedAt: Date.now(),
      email: cred.user.email
    };
    try {
      await setDoc(doc(db, 'user_profiles', cred.user.uid), newProfile, { merge: true });
      setProfile(newProfile);
    } catch (e) {
      console.warn('Save initial profile error:', e);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      // Fallback to anonymous sign-in so app features keep functioning
      await signInAnonymously(auth);
    } catch (e) {
      console.warn('Logout error:', e);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user || user.isAnonymous) return;
    const updated = {
      ...profile,
      ...data,
      updatedAt: Date.now()
    } as UserProfile;
    setProfile(updated);
    try {
      if (data.nickname) localStorage.setItem('mei_user_nickname', data.nickname);
      if (data.avatarUrl) localStorage.setItem('mei_user_avatar', data.avatarUrl);
      if (data.frameId) localStorage.setItem('mei_user_frame', data.frameId);
      await setDoc(doc(db, 'user_profiles', user.uid), updated, { merge: true });
    } catch (err) {
      console.warn('Update user profile err:', err);
    }
  };

  const checkInGarden = async () => {
    if (!user || user.isAnonymous || !profile) {
      return { success: false, alreadyCheckedIn: false, streak: 0, gainedPetals: 0 };
    }

    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    if (profile.lastCheckInDate === today) {
      return {
        success: false,
        alreadyCheckedIn: true,
        streak: profile.gardenStreak || 1,
        gainedPetals: 0
      };
    }

    const isConsecutive = profile.lastCheckInDate === yesterday;
    const newStreak = isConsecutive ? (profile.gardenStreak || 0) + 1 : 1;
    const gainedPetals = 10;
    const newPetals = (profile.petals || 0) + gainedPetals;
    const newTotal = (profile.totalCheckIns || 0) + 1;

    const updatedProfile: UserProfile = {
      ...profile,
      gardenStreak: newStreak,
      lastCheckInDate: today,
      petals: newPetals,
      totalCheckIns: newTotal,
      updatedAt: Date.now()
    };

    setProfile(updatedProfile);

    // Sync to garden localStorage so garden reflects the streak and petals
    try {
      const flowerKey = 'mong-mien-garden:release:v1:flowers:' + user.uid;
      const savedFlower = JSON.parse(localStorage.getItem(flowerKey) || '{}');
      const updatedFlower = {
        last: today,
        streak: newStreak,
        petals: (Number(savedFlower.petals) || 0) + gainedPetals
      };
      localStorage.setItem(flowerKey, JSON.stringify(updatedFlower));
    } catch {}

    try {
      await setDoc(doc(db, 'user_profiles', user.uid), updatedProfile, { merge: true });
    } catch (err) {
      console.warn('Save streak to firestore error:', err);
    }

    return {
      success: true,
      alreadyCheckedIn: false,
      streak: newStreak,
      gainedPetals
    };
  };

  const syncGardenData = async (gardenSnapshot: Record<string, any>) => {
    if (!user || user.isAnonymous) return;
    try {
      const mergedGarden = {
        ...(profile?.gardenData || {}),
        ...gardenSnapshot
      };
      setProfile((prev) => prev ? { ...prev, gardenData: mergedGarden, updatedAt: Date.now() } : null);
      await setDoc(doc(db, 'user_profiles', user.uid), {
        gardenData: mergedGarden,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (err) {
      console.warn('Sync garden data error:', err);
    }
  };

  return (
    <UserAuthContext.Provider
      value={{
        user,
        isLoggedIn,
        profile,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logout,
        updateUserProfile,
        checkInGarden,
        syncGardenData
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within UserAuthProvider');
  }
  return context;
}
