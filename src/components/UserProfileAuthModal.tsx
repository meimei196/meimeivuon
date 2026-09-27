import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  KeyRound, 
  Mail, 
  Eye, 
  EyeOff, 
  Upload, 
  CheckCircle2, 
  LogOut, 
  Edit3, 
  Calendar, 
  Flame, 
  Crown,
  Heart,
  Flower2,
  Compass,
  Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react';
import { useUserAuth, PRESET_AVATARS, DEFAULT_AVATAR, DEFAULT_FRAME } from '../lib/userAuth';
import { ADMIN_FRAMES, AvatarWithFrame } from './AvatarFrame';
import { playFortuneClickSound } from '../lib/sound';

// Client-side image compression to small Data URL under 60KB
async function compressAvatarImage(file: File, maxDimension = 400, quality = 0.8): Promise<string> {
  const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
  if (isGif) {
    if (file.size > 1.2 * 1024 * 1024) {
      throw new Error('GIF_TOO_LARGE');
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function translateAuthError(code: string): string {
  if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) {
    return 'Email hoặc mật khẩu không chính xác.';
  }
  if (code.includes('email-already-in-use')) {
    return 'Email này đã được sử dụng. Vui lòng đăng nhập.';
  }
  if (code.includes('weak-password')) {
    return 'Mật khẩu quá ngắn, vui lòng nhập tối thiểu 6 ký tự.';
  }
  if (code.includes('invalid-email')) {
    return 'Định dạng email chưa hợp lệ.';
  }
  if (code.includes('popup-closed-by-user')) {
    return 'Cửa sổ đăng nhập đã bị đóng.';
  }
  return 'Có lỗi xảy ra, vui lòng thử lại sau.';
}

interface UserProfileAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptMessage?: string | null;
  onOpenGarden?: () => void;
}

export function UserProfileAuthModal({
  isOpen,
  onClose,
  promptMessage,
  onOpenGarden
}: UserProfileAuthModalProps) {
  const {
    isLoggedIn,
    profile,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logout,
    updateUserProfile,
    checkInGarden
  } = useUserAuth();

  // Auth form state
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nicknameInput, setNicknameInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile edit states
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [checkInNotice, setCheckInNotice] = useState<string | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!email.trim() || !password.trim()) {
      setAuthError('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }
    setIsSubmitting(true);
    try {
      await signInWithEmail(email, password);
      playFortuneClickSound();
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setAuthError(translateAuthError(err.code || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!email.trim() || !password.trim()) {
      setAuthError('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }
    if (password.length < 6) {
      setAuthError('Mật khẩu cần tối thiểu 6 ký tự.');
      return;
    }
    setIsSubmitting(true);
    try {
      await signUpWithEmail(email, password, nicknameInput.trim() || 'vợ iu bí mật 𝜗ৎ');
      playFortuneClickSound();
      setEmail('');
      setPassword('');
      setNicknameInput('');
    } catch (err: any) {
      setAuthError(translateAuthError(err.code || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      playFortuneClickSound();
    } catch (err: any) {
      if (!err.message?.includes('popup-closed')) {
        setAuthError(translateAuthError(err.code || err.message));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNickname = async () => {
    if (!tempNickname.trim()) return;
    playFortuneClickSound();
    await updateUserProfile({ nickname: tempNickname.trim() });
    setIsEditingNickname(false);
  };

  const handleSelectFrame = async (frameId: string) => {
    playFortuneClickSound();
    await updateUserProfile({ frameId });
  };

  const handleSelectAvatarPreset = async (url: string) => {
    playFortuneClickSound();
    await updateUserProfile({ avatarUrl: url });
    setShowAvatarPicker(false);
  };

  const handleApplyCustomAvatarUrl = async () => {
    if (!customAvatarUrl.trim()) return;
    playFortuneClickSound();
    await updateUserProfile({ avatarUrl: customAvatarUrl.trim() });
    setCustomAvatarUrl('');
    setShowAvatarPicker(false);
  };

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressAvatarImage(file);
      playFortuneClickSound();
      await updateUserProfile({ avatarUrl: compressed });
      setShowAvatarPicker(false);
    } catch {
      alert('Không thể tải ảnh này lên. Vui lòng chọn ảnh dung lượng nhỏ hơn.');
    }
  };

  const handleDoCheckIn = async () => {
    playFortuneClickSound();
    setIsCheckingIn(true);
    setCheckInNotice(null);
    try {
      const res = await checkInGarden();
      if (res.alreadyCheckedIn) {
        setCheckInNotice('Hôm nay nàng đã điểm danh rồi đó nha! Mai lại ghé nha 𝜗ৎ');
      } else if (res.success) {
        setCheckInNotice(`Điểm danh thành công! +${res.gainedPetals} cánh hoa 🌸 · Chuỗi streak: ${res.streak} ngày!`);
      }
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[3500] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-md w-full max-h-[92vh] flex flex-col bg-zinc-950/95 border-2 border-pink-300 shadow-[0_0_35px_rgba(244,114,182,0.5),0_0_12px_rgba(251,207,232,0.3)] rounded-3xl relative overflow-hidden"
      >
        {/* Luxury top line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-400 via-rose-300 to-pink-400 z-30" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">𝜗ৎ</span>
            <h3 className="text-base sm:text-lg font-bold text-pink-200 font-serif italic tracking-wide">
              {isLoggedIn ? 'Hồ Sơ Mộng Miên · Decor' : 'Đăng Nhập · Mộng Miên Các'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {/* Prompt message if opened from restricted garden banner */}
          {promptMessage && !isLoggedIn && (
            <div className="p-3 rounded-2xl bg-pink-500/15 border border-pink-400/50 text-pink-200 text-xs flex items-start gap-2.5 shadow-[0_0_15px_rgba(244,114,182,0.2)]">
              <span className="text-lg leading-none shrink-0">🌸</span>
              <p className="leading-relaxed font-serif italic font-medium">
                {promptMessage}
              </p>
            </div>
          )}

          {!isLoggedIn ? (
            /* --- NOT LOGGED IN: LOGIN & REGISTER TABS --- */
            <div className="space-y-4">
              <p className="text-xs text-zinc-400 leading-relaxed font-serif italic text-center">
                Đăng nhập để điểm danh daily streak, lưu dữ liệu vườn và sở hữu khung decor độc quyền giống Admin 𝜗ৎ
              </p>

              {/* Tab Switcher */}
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/60 border border-white/10 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    playFortuneClickSound();
                    setAuthTab('signin');
                    setAuthError('');
                  }}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    authTab === 'signin'
                      ? 'bg-pink-500/30 border border-pink-400/50 text-pink-200 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playFortuneClickSound();
                    setAuthTab('signup');
                    setAuthError('');
                  }}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    authTab === 'signup'
                      ? 'bg-pink-500/30 border border-pink-400/50 text-pink-200 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Đăng ký
                </button>
              </div>

              {/* Auth Form */}
              <form onSubmit={authTab === 'signin' ? handleSignIn : handleSignUp} className="space-y-3">
                {authTab === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Biệt danh trong vườn
                    </label>
                    <input
                      type="text"
                      value={nicknameInput}
                      onChange={(e) => setNicknameInput(e.target.value)}
                      placeholder="VD: vợ iu bí mật 𝜗ৎ"
                      maxLength={32}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/15 text-zinc-200 text-xs focus:outline-none focus:border-pink-300"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-black/70 border border-white/15 text-zinc-200 text-xs focus:outline-none focus:border-pink-300"
                    />
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự..."
                      required
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-black/70 border border-white/15 text-zinc-200 text-xs focus:outline-none focus:border-pink-300"
                    />
                    <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {authError && (
                  <p className="text-xs text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5">
                    {authError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold text-xs shadow-[0_0_15px_rgba(244,114,182,0.4)] transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang xử lý...' : authTab === 'signin' ? 'Đăng nhập ngay' : 'Tạo tài khoản & Tham gia'}
                </button>

                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-white/10 w-full" />
                  <span className="bg-zinc-950 px-2 text-[10px] text-zinc-500 uppercase">hoặc</span>
                  <div className="border-t border-white/10 w-full" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-zinc-200 text-xs font-medium flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"/>
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                    <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4L1.6 7c-.8 1.6-1.3 3.4-1.3 5.3s.5 3.7 1.3 5.3l3.7-2.9z"/>
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.9C3.5 20.1 7.4 23 12 23z"/>
                  </svg>
                  <span>Tiếp tục với Google</span>
                </button>
              </form>
            </div>
          ) : (
            /* --- LOGGED IN: PROFILE & DECOR (GIỐNG ADMIN VẬY ĐÓ) --- */
            <div className="space-y-5">
              {/* Centered Avatar With Frame + Decor & Nickname */}
              <div className="flex flex-col items-center justify-center pt-1 select-none">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileUpload}
                  className="hidden"
                />

                <div 
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="relative group cursor-pointer"
                  title="Chạm vào để đổi avatar hoặc tải ảnh từ máy"
                >
                  <AvatarWithFrame
                    avatarUrl={profile?.avatarUrl || DEFAULT_AVATAR}
                    frameId={profile?.frameId || DEFAULT_FRAME}
                    size="xl"
                    showDecor={true}
                  />
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-sans font-medium transition-opacity z-30">
                    <span>Đổi ảnh</span>
                  </div>
                </div>

                {/* Nickname & Email */}
                <div className="mt-3 text-center">
                  {isEditingNickname ? (
                    <div className="flex items-center gap-1.5 justify-center mt-1">
                      <input
                        type="text"
                        value={tempNickname}
                        onChange={(e) => setTempNickname(e.target.value)}
                        maxLength={32}
                        className="px-2.5 py-1 text-xs rounded-lg bg-black/70 border border-pink-400 text-zinc-100 focus:outline-none w-44 text-center"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleSaveNickname}
                        className="px-2.5 py-1 rounded-lg bg-pink-500 hover:bg-pink-400 text-white text-xs font-bold"
                      >
                        Lưu
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingNickname(false)}
                        className="px-2 py-1 text-zinc-400 hover:text-white text-xs"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5">
                      <h4 className="text-base font-bold text-pink-200 font-serif italic">
                        {profile?.nickname || 'vợ iu bí mật 𝜗ৎ'}
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setTempNickname(profile?.nickname || '');
                          setIsEditingNickname(true);
                        }}
                        className="p-1 text-zinc-400 hover:text-pink-300"
                        title="Đổi tên biệt danh"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="text-[11px] text-zinc-400 mt-0.5">{profile?.email || 'Thành viên Mộng Miên'}</p>
                </div>
              </div>

              {/* Avatar Picker Panel (Collapsible) */}
              <AnimatePresence>
                {showAvatarPicker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-2xl bg-black/60 border border-pink-400/30 space-y-3 overflow-hidden"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-pink-200">
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Chọn hoặc tải ảnh đại diện</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAvatarPicker(false)}
                        className="text-zinc-400 hover:text-white text-[11px]"
                      >
                        Đóng
                      </button>
                    </div>

                    {/* Upload from device button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 px-3 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/40 text-pink-200 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Tải ảnh/GIF từ thiết bị của bạn</span>
                    </button>

                    {/* Presets Grid */}
                    <div>
                      <p className="text-[10px] text-zinc-400 mb-1.5">Ảnh mẫu có sẵn:</p>
                      <div className="grid grid-cols-6 gap-2">
                        {PRESET_AVATARS.map((url, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSelectAvatarPreset(url)}
                            className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/20 hover:border-pink-400 cursor-pointer active:scale-90 transition-all shrink-0"
                          >
                            <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Direct URL input */}
                    <div className="flex gap-1.5 pt-1">
                      <input
                        type="url"
                        value={customAvatarUrl}
                        onChange={(e) => setCustomAvatarUrl(e.target.value)}
                        placeholder="Hoặc dán URL link ảnh..."
                        className="flex-1 px-3 py-1.5 rounded-xl bg-black/80 border border-white/15 text-zinc-200 text-xs focus:outline-none focus:border-pink-300"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCustomAvatarUrl}
                        className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white text-xs font-semibold cursor-pointer"
                      >
                        Dùng
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* DAILY STREAK SECTION */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-500/15 via-rose-500/10 to-purple-500/15 border border-pink-400/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-pink-200 font-serif italic font-bold text-sm">
                    <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-pulse" />
                    <span>Daily Streak & Quà Vườn</span>
                  </div>
                  <span className="text-[11px] text-pink-300 bg-pink-500/20 px-2 py-0.5 rounded-full border border-pink-400/30">
                    🔥 {profile?.gardenStreak || 0} ngày
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                    <p className="text-[10px] text-zinc-400">Tổng ngày điểm danh</p>
                    <p className="text-sm font-bold text-zinc-100 mt-0.5">{profile?.totalCheckIns || 0} ngày</p>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                    <p className="text-[10px] text-zinc-400">Cánh hoa tích lũy</p>
                    <p className="text-sm font-bold text-pink-300 mt-0.5">{profile?.petals || 0} ✿</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDoCheckIn}
                  disabled={isCheckingIn}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 hover:from-pink-400 hover:to-rose-400 text-white text-xs font-bold shadow-[0_0_15px_rgba(244,114,182,0.4)] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                  <span>{isCheckingIn ? 'Đang điểm danh...' : 'Điểm danh nhận streak hôm nay (+10 ✿)'}</span>
                </button>

                {checkInNotice && (
                  <p className="text-xs text-pink-200 text-center font-serif italic bg-pink-500/20 p-2 rounded-xl border border-pink-400/30 animate-in fade-in">
                    {checkInNotice}
                  </p>
                )}
              </div>

              {/* CHUỖI DAILY TRONG VƯỜN (Garden Daily Chains) */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <Flower2 className="w-3.5 h-3.5 text-pink-300" />
                    <span>Chuỗi Daily Trong Vườn Mộng Miên</span>
                  </span>
                  <span className="text-[10px] text-zinc-400">Tự động lưu vĩnh viễn</span>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-300">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                    <span className="flex items-center gap-2">
                      <span className="text-pink-300">1.</span>
                      <span>Điểm danh mỗi ngày</span>
                    </span>
                    <span className="text-pink-300 font-bold">
                      {profile?.lastCheckInDate ? '✓ Đã xong' : 'Chưa điểm danh'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                    <span className="flex items-center gap-2">
                      <span className="text-pink-300">2.</span>
                      <span>Tưới hoa Mộng Miên</span>
                    </span>
                    <span className="text-zinc-400">Trong Vườn</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                    <span className="flex items-center gap-2">
                      <span className="text-pink-300">3.</span>
                      <span>Câu cá & chăm sóc mèo</span>
                    </span>
                    <span className="text-zinc-400">Trong Vườn</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                    <span className="flex items-center gap-2">
                      <span className="text-pink-300">4.</span>
                      <span>Ngắm sao đêm huyền ảo</span>
                    </span>
                    <span className="text-zinc-400">Trong Vườn</span>
                  </div>
                </div>

                {onOpenGarden && (
                  <button
                    type="button"
                    onClick={() => {
                      playFortuneClickSound();
                      onClose();
                      onOpenGarden();
                    }}
                    className="w-full mt-2 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/40 text-pink-200 text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Vào Vườn Mộng Miên Ngay 𝜗ৎ</span>
                  </button>
                )}
              </div>

              {/* KHUNG AVATAR DECOR (GIỐNG ADMIN CỦA MẬT THẤT) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
                  <span className="flex items-center gap-1 text-pink-300 font-serif italic">
                    <Crown className="w-3.5 h-3.5" />
                    <span>Bộ Khung Avatar Decor (Giống Admin)</span>
                  </span>
                  <span className="text-[10px] text-pink-300 font-normal">Chạm để đổi khung</span>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto custom-scrollbar p-1">
                  {ADMIN_FRAMES.map((f) => {
                    const isSelected = (profile?.frameId || DEFAULT_FRAME) === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleSelectFrame(f.id)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer select-none active:scale-95 ${
                          isSelected
                            ? 'bg-pink-500/25 border-pink-300 text-pink-200 shadow-[0_0_12px_rgba(244,114,182,0.45)]'
                            : 'bg-black/50 border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-pink-400/30'
                        }`}
                      >
                        <span className="text-lg shrink-0">{f.decorTop || '✨'}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10.5px] font-bold truncate leading-tight">{f.name}</p>
                          <p className="text-[8.5px] text-zinc-400 truncate">{f.badge}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-between border-t border-white/10">
                <button
                  type="button"
                  onClick={async () => {
                    playFortuneClickSound();
                    await logout();
                  }}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white text-xs font-bold shadow-md active:scale-95 cursor-pointer"
                >
                  Xong 𝜗ৎ
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
