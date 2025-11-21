/**
 * Auth Service - 인증 및 사용자 관리
 */

import { User } from '../../types';
import { USE_MOCK_API, STORAGE_KEYS } from '../config';
import { apiClient } from '../apiClient';
import { generateDefaultTimeSlots, generateDateRange } from '../utils/timeSlots';

// ============================================
// Mock API (로컬스토리지 사용)
// ============================================

interface StoredUser extends User {
  password: string; // Mock용 비밀번호 저장
}

const mockAuthService = {
  /**
   * 모든 사용자 조회 (내부용)
   */
  _getAllUsers(): StoredUser[] {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : [];
  },

  /**
   * 모든 사용자 저장 (내부용)
   */
  _saveUsers(users: StoredUser[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  /**
   * 현재 로그인한 사용자 조회
   */
  async getCurrentUser(): Promise<User | null> {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return saved ? JSON.parse(saved) : null;
  },

  /**
   * 로그인
   */
  async login(userId: string, password: string): Promise<User> {
    const users = this._getAllUsers();
    
    // 아이디와 비밀번호로 사용자 찾기
    const storedUser = users.find(
      (u) => u.userId === userId && u.password === password
    );

    if (!storedUser) {
      throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
    }

    // 비밀번호 제외하고 User 객체 생성
    const { password: _, ...user } = storedUser;

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  },

  /**
   * 회원가입
   */
  async signup(data: {
    userId: string;
    email: string;
    password: string;
    name: string;
    phone?: string;
    restaurantName?: string; // 추가
    capacity?: number;       // 추가
    address?: string;        // 추가
    imageUrl?: string;       // 추가
    role?: 'customer' | 'restaurant_owner'; // 'admin' 제거
  }): Promise<User> {
    const users = this._getAllUsers();

    // 이미 존재하는 아이디인지 확인
    if (users.some((u) => u.userId === data.userId)) {
      throw new Error('이미 존재하는 아이디입니다.');
    }

    // 이미 존재하는 이메일인지 확인
    if (users.some((u) => u.email === data.email)) {
      throw new Error('이미 존재하는 이메일입니다.');
    }

    const newStoredUser: StoredUser = {
      id: `user-${Date.now()}`,
      userId: data.userId,
      email: data.email,
      password: data.password, // Mock용으로 저장
      name: data.name,
      phone: data.phone,
      role: data.role || 'customer',
      createdAt: new Date().toISOString(),
    };

    // 사용자 목록에 추가
    users.push(newStoredUser);
    this._saveUsers(users);

    // 비밀번호 제외하고 반환
    const { password: _, ...user } = newStoredUser;
    
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  },

  /**
   * 레스토랑 사장 회원가입
   */
  async signupRestaurantOwner(data: {
    userId: string;
    email: string;
    password: string;
    name: string;
    phone: string;
    restaurantName: string;
    capacity?: number; // 🆕 선택적 매개변수 추가
    address?: string; // 🆕 선택적 매개변수 추가
    imageUrl?: string; // 🆕 선택적 매개변수 추가
  }): Promise<User> {
    console.log('=== 레스토랑 사장 회원가입 시작 ===');
    console.log('입력 데이터:', data);
    
    const users = this._getAllUsers();

    // 이미 존재하는 아이디인지 확인
    if (users.some((u) => u.userId === data.userId)) {
      throw new Error('이미 존재하는 아이디입니다.');
    }

    // 이미 존재하는 이메일인지 확인
    if (users.some((u) => u.email === data.email)) {
      throw new Error('이미 존재하는 이메일입니다.');
    }

    try {
      // 레스토랑 ID 생성 (타임스탬프 기반)
      const restaurantId = Date.now();
      console.log('생성된 레스토랑 ID:', restaurantId);

      // 1️⃣ 사용자 데이터 준비
      const newStoredUser: StoredUser = {
        id: `user-${Date.now()}`,
        userId: data.userId,
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
        role: 'restaurant_owner',
        restaurantId: restaurantId, // 레스토랑 ID 추가
        createdAt: new Date().toISOString(),
      };

      console.log('생성된 사용자:', { ...newStoredUser, password: '***' });

      // 2️⃣ 레스토랑 데이터 준비
      const newRestaurant = {
        id: restaurantId,
        name: data.restaurantName,
        cuisine: '', // 🔧 하드코딩 제거 - 나중에 매장 정보 수정에서 입력
        rating: 4.5, // 기본값 (자동 계산)
        reviews: 0, // 기본값 (자동 계산)
        address: data.address || '', // 🔧 빈 값으로 변경
        distance: '0km', // 기본값 (자동 계산)
        hours: '', // 🔧 하드코딩 제거 - 나중에 매장 정보 수정에서 입력
        priceRange: '', // 🔧 하드코딩 제거 - 나중에 매장 정보 수정에서 입력
        capacity: data.capacity || 50, // 사용자 입력 또는 기본값
        image: data.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', // 사용자 입력 또는 기본 이미지
        phone: data.phone,
        website: data.email,
        description: '', // 🔧 하드코딩 제거 - 나중에 매장 정보 수정에서 입력
      };

      console.log('생성된 레스토랑:', newRestaurant);

      // 3️⃣ 매장 기본 설정 데이터 준비
      console.log('매장 기본 설정 생성 중...');
      
      // 오늘부터 10일간 날짜 생성
      const today = new Date();
      const availableDates = generateDateRange(today, 10);
      console.log('생성된 예약 가능 날짜:', availableDates);
      
      // 기본 시간대 생성 (16:00 ~ 익일 04:00, 30분 간격)
      const defaultTimeSlots = generateDefaultTimeSlots();
      console.log('기본 시간대:', defaultTimeSlots);
      
      // 날짜별 시간대 설정
      const availableTimeSlots: { [date: string]: string[] } = {};
      availableDates.forEach(date => {
        availableTimeSlots[date] = [...defaultTimeSlots];
      });
      
      const newSettings = {
        restaurantId: restaurantId,
        unavailableDates: [],
        dailyCapacity: {},
        availableTimeSlots: availableTimeSlots,
      };

      // 4️⃣ 기존 데이터 로드 (JSON 파싱 에러 처리 포함)
      let restaurants;
      try {
        const restaurantsData = localStorage.getItem(STORAGE_KEYS.RESTAURANTS);
        restaurants = restaurantsData ? JSON.parse(restaurantsData) : [];
      } catch (parseError) {
        console.warn('레스토랑 데이터 파싱 실패, 초기화:', parseError);
        restaurants = [];
      }

      let allSettings;
      try {
        const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        allSettings = settingsData ? JSON.parse(settingsData) : [];
      } catch (parseError) {
        console.warn('설정 데이터 파싱 실패, 초기화:', parseError);
        allSettings = [];
      }

      console.log('기존 레스토랑 수:', restaurants.length);

      // 5️⃣ 모든 데이터 한번에 저장 (원자성 보장)
      users.push(newStoredUser);
      restaurants.push(newRestaurant);
      allSettings.push(newSettings);

      this._saveUsers(users);
      localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(restaurants));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(allSettings));
      
      console.log('✅ 레스토랑 저장 완료. 총 레스토랑 수:', restaurants.length);
      console.log('✅ 매장 기본 설정 생성 완료:', newSettings);

      // 6️⃣ 현재 사용자 설정
      const { password: _, ...user } = newStoredUser;
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      
      console.log('✅ 매장 회원가입 완료:', user);
      console.log('===================');
      
      return user;
      
    } catch (error) {
      console.error('❌ 매장 회원가입 중 오류 발생:', error);
      // 에러 발생 시 사용자에게 명확한 메시지 전달
      if (error instanceof Error) {
        throw error; // 기존 에러 메시지 유지
      }
      throw new Error('매장 회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  },

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  /**
   * 프로필 업데이트
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new Error('로그인이 필요합니다.');
    }

    const users = this._getAllUsers();
    const index = users.findIndex((u) => u.id === currentUser.id);

    if (index === -1) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 사용자 정보 업데이트
    const updatedStoredUser = { ...users[index], ...updates };
    users[index] = updatedStoredUser;
    this._saveUsers(users);

    // 비밀번호 제외하고 반환
    const { password: _, ...updatedUser } = updatedStoredUser;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
    return updatedUser;
  },

  /**
   * 비밀번호 변경
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new Error('로그인이 필요합니다.');
    }

    const users = this._getAllUsers();
    const storedUser = users.find((u) => u.id === currentUser.id);

    if (!storedUser || storedUser.password !== currentPassword) {
      throw new Error('현재 비밀번호가 일치하지 않습니다.');
    }

    // 비밀번호 변경
    storedUser.password = newPassword;
    this._saveUsers(users);
  },

  /**
   * 비밀번호 재설정 이메일 전송
   */
  async resetPassword(email: string): Promise<void> {
    const users = this._getAllUsers();
    const user = users.find((u) => u.email === email);

    if (!user) {
      throw new Error('해당 이메일로 가입된 계정이 없습니다.');
    }

    // Mock: 실제 구현에서는 이메일 전송
    console.log(`비밀번호 재설정 이메일이 ${email}로 전송되었습니다.`);
  },
};

// ============================================
// Real API (백엔드 서버 호출)
// ============================================

const realAuthService = {
  async getCurrentUser(): Promise<User | null> {
    try {
      // 명세서에 /auth/me 없음 → 필요시 백엔드에 문의
      return null;
    } catch (error) {
      return null;
    }
  },

  // 로그인 (userId, password 사용)
  async login(userId: string, password: string): Promise<User> {
    const response = await apiClient<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userId, password }),
    });

    localStorage.setItem('authToken', response.token);
    return response.user;
  },

  // 회원가입 (학생/관리자/사장님 모두 /auth/signup 사용)
  async signup(data: {
    userId: string;
    email: string;
    password: string;
    name: string;
    phone?: string;
    restaurantName?: string; // 추가
    capacity?: number;       // 추가
    address?: string;        // 추가
    imageUrl?: string;       // 추가
    role?: 'customer' | 'restaurant_owner'; // 'admin' 제거
  }): Promise<User> {
    const response = await apiClient<{ user: User; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    localStorage.setItem('authToken', response.token);
    return response.user;
  },

  // 사장님 회원가입도 /auth/signup 사용 (role: 'restaurant_owner')
  async signupRestaurantOwner(data: {
    userId: string;
    email: string;
    password: string;
    name: string;
    phone: string;
    restaurantName: string;
    capacity?: number;
    address?: string;
    imageUrl?: string;
  }): Promise<User> {
    const response = await apiClient<{ user: User; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        role: 'restaurant_owner',
      }),
    });

    localStorage.setItem('authToken', response.token);
    return response.user;
  },

  // 로그아웃
  async logout(): Promise<void> {
    await apiClient<void>('/auth/logout', {
      method: 'POST',
    });
    localStorage.removeItem('authToken');
  },

  // 프로필 업데이트 (학생/사장님에 따라 분기 필요)
  async updateProfile(updates: Partial<User>): Promise<User> {
    // 학생
    if (updates.role === 'customer') {
      return apiClient<User>('/student/profile', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    }
    // 사장님
    if (updates.role === 'restaurant_owner') {
      return apiClient<User>('/store/profile', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    }
    // 기타
    return apiClient<User>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },
};

// ============================================
// Export - Mock/Real 자동 선택
// ============================================

export const authService = USE_MOCK_API ? mockAuthService : realAuthService;