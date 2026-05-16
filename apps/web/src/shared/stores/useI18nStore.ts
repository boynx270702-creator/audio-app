import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'vi' | 'en';

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      language: 'vi',
      setLanguage: (lang) => set({ language: lang }),
    }),
    { name: 'sv-i18n' }
  )
);

export const dictionaries = {
  vi: {
    common: {
      search: 'Tìm kiếm truyện, tác giả...',
      login: 'Đăng nhập',
      signup: 'Đăng ký',
      logout: 'Đăng xuất',
      settings: 'Cài đặt',
      home: 'Trang chủ',
      explore: 'Khám phá',
      library: 'Thư viện',
      trending: 'Xu hướng',
      bookmarks: 'Đã lưu',
      history: 'Lịch sử',
      quests: 'Nhiệm vụ',
      read: 'Đọc ngay',
      unlock: 'Mở khóa',
      share: 'Chia sẻ',
      back: 'Quay lại',
      save: 'Lưu thay đổi',
      cancel: 'Hủy bỏ',
    },
    home: {
      heroTitle: 'Khám phá những câu chuyện hay nhất thế giới.',
      heroSub: 'Khám phá các vũ trụ, nhân vật và cốt truyện được tạo nên bởi các nhà sáng tạo nội dung số.',
      trending: 'Xu hướng',
      newReleases: 'Mới nhất',
      communityTitle: 'Tham gia cộng đồng sáng tạo',
      communitySub: 'Tạo nên vũ trụ của riêng bạn, xuất bản các chương truyện và phát triển độc giả trong thư viện số đẹp nhất.',
      startPublishing: 'Bắt đầu xuất bản',
    },
    explore: {
      resultsFor: 'Kết quả cho',
      noResults: 'Không tìm thấy kết quả',
      adjustFilters: 'Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.',
      loadMore: 'Xem thêm truyện',
    },
    library: {
      title: 'Thư viện của tôi',
      sub: 'Theo dõi hành trình của bạn qua mọi vũ trụ.',
      empty: 'Thư viện của bạn đang trống',
      resume: 'Đọc tiếp',
    },
    auth: {
      welcome: 'Chào mừng trở lại',
      createAccount: 'Tạo tài khoản mới',
      joinCommunity: 'Tham gia cộng đồng người kể chuyện.',
      displayName: 'Tên hiển thị',
      email: 'Địa chỉ Email',
      password: 'Mật khẩu',
      signIn: 'Đăng nhập',
      noAccount: 'Chưa có tài khoản? Đăng ký',
      hasAccount: 'Đã có tài khoản? Đăng nhập',
    },
    wallet: {
      title: 'Trung tâm tài chính',
      sub: 'Quản lý tài sản và phần thưởng của bạn.',
      available: 'Số dư hiện có',
      points: 'Điểm thưởng',
      transactions: 'Giao dịch gần đây',
      deposit: 'Nạp tiền',
    },
    settings: {
      title: 'Cài đặt tài khoản',
      sub: 'Tùy chỉnh hồ sơ và tùy chọn của bạn.',
      profile: 'Hồ sơ',
      security: 'Bảo mật',
      notifications: 'Thông báo',
      appearance: 'Giao diện',
      language: 'Ngôn ngữ',
      displayName: 'Tên hiển thị',
      bio: 'Tiểu sử ngắn',
      email: 'Địa chỉ Email',
      changePassword: 'Đổi mật khẩu',
      save: 'Lưu thay đổi',
      discard: 'Hủy bỏ',
      theme: {
        title: 'Chế độ hiển thị',
        dark: 'Tối',
        light: 'Sáng',
      }
    }
  },
  en: {
    common: {
      search: 'Search stories, authors...',
      login: 'Log in',
      signup: 'Sign up',
      logout: 'Log out',
      settings: 'Settings',
      home: 'Home',
      explore: 'Explore',
      library: 'Library',
      trending: 'Trending',
      bookmarks: 'Bookmarks',
      history: 'History',
      quests: 'Quests',
      read: 'Read now',
      unlock: 'Unlock',
      share: 'Share',
      back: 'Back',
      save: 'Save changes',
      cancel: 'Cancel',
    },
    home: {
      heroTitle: "Explore the world's best stories.",
      heroSub: 'Discover universes, characters and plots created by digital storytellers.',
      trending: 'Trending',
      newReleases: 'New Releases',
      communityTitle: 'Join the Creative Community',
      communitySub: 'Create your own universe, publish chapters and grow your audience in the most beautiful digital library.',
      startPublishing: 'Start Publishing',
    },
    explore: {
      resultsFor: 'Results for',
      noResults: 'No results found',
      adjustFilters: 'Try adjusting your filters or search terms.',
      loadMore: 'Load more stories',
    },
    library: {
      title: 'My Library',
      sub: 'Track your journeys through every universe.',
      empty: 'Your library is empty',
      resume: 'Resume',
    },
    auth: {
      welcome: 'Welcome Back',
      createAccount: 'Create New Account',
      joinCommunity: 'Join the community of storytellers.',
      displayName: 'Display Name',
      email: 'Email Address',
      password: 'Password',
      signIn: 'Sign In',
      noAccount: "Don't have an account? Sign up",
      hasAccount: 'Already have an account? Log in',
    },
    wallet: {
      title: 'Financial Hub',
      sub: 'Manage your assets and rewards.',
      available: 'Available Balance',
      points: 'Loyalty Points',
      transactions: 'Recent Activity',
      deposit: 'Deposit',
    },
    settings: {
      title: 'Account Settings',
      sub: 'Customize your profile and preferences.',
      profile: 'Profile',
      security: 'Security',
      notifications: 'Notifications',
      appearance: 'Appearance',
      language: 'Language',
      displayName: 'Display Name',
      bio: 'Short Biography',
      email: 'Email Address',
      changePassword: 'Change Password',
      save: 'Save Changes',
      discard: 'Discard',
      theme: {
        title: 'Theme Mode',
        dark: 'Dark',
        light: 'Light',
      }
    }
  }
};
