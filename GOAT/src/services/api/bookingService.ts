/**
 * Booking Service - 예약 데이터 관리
 */

import { Booking } from '../../types';
import { USE_MOCK_API, STORAGE_KEYS } from '../config';
import { apiClient } from '../apiClient';

// ============================================
// Mock API (로컬스토리지 사용)
// ============================================

const mockBookingService = {
  /**
   * 모든 예약 조회
   */
  async getAll(): Promise<Booking[]> {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return saved ? JSON.parse(saved) : [];
  },

  /**
   * 특정 예약 조회
   */
  async getById(id: string): Promise<Booking | null> {
    const bookings = await this.getAll();
    return bookings.find((b) => b.id === id) || null;
  },

  /**
   * 레스토랑별 예약 조회
   */
  async getByRestaurant(restaurantId: number): Promise<Booking[]> {
    const bookings = await this.getAll();
    return bookings.filter((b) => b.restaurantId === restaurantId);
  },

  /**
   * 사용자별 예약 조회
   */
  async getByUser(userId: string): Promise<Booking[]> {
    const bookings = await this.getAll();
    return bookings.filter((b) => b.userId === userId);
  },

  /**
   * 확인번호로 예약 조회
   */
  async getByConfirmationNumber(confirmationNumber: string): Promise<Booking | null> {
    const bookings = await this.getAll();
    return bookings.find((b) => b.confirmationNumber === confirmationNumber) || null;
  },

  /**
   * 예약 생성
   */
  async create(
    data: Omit<Booking, 'id' | 'createdAt' | 'confirmationNumber'>
  ): Promise<Booking> {
    const bookings = await this.getAll();

    // 확인번호 생성 (BK-YYYYMMDD-XXXX)
    const date = new Date();
    // ✅ 로컬 날짜로 변환 (UTC 아님!)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}${month}${day}`;
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    const newBooking: Booking = {
      ...data,
      id: `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      confirmationNumber: `BK-${dateString}-${randomNum}`,
    };

    const updated = [...bookings, newBooking];
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
    return newBooking;
  },

  /**
   * 예약 수정
   */
  async update(id: string, updates: Partial<Booking>): Promise<Booking> {
    const bookings = await this.getAll();
    const index = bookings.findIndex((b) => b.id === id);

    if (index === -1) {
      throw new Error(`예약을 찾을 수 없습니다. (ID: ${id})`);
    }

    const updated = bookings.map((b) =>
      b.id === id ? { ...b, ...updates } : b
    );
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
    return updated[index];
  },

  /**
   * 예약 삭제
   */
  async delete(id: string): Promise<void> {
    const bookings = await this.getAll();
    const filtered = bookings.filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(filtered));
  },

  /**
   * 예약 취소 (상태 변경)
   */
  async cancel(id: string): Promise<Booking> {
    return this.update(id, { status: 'cancelled' });
  },

  /**
   * 예약 확정
   */
  async confirm(id: string): Promise<Booking> {
    return this.update(id, { status: 'confirmed' });
  },

  /**
   * ✅ 예약 거절 (상태 변경)
   */
  async reject(id: string): Promise<Booking> {
    return this.update(id, { status: 'rejected' });
  },

  /**
   * 날짜별 예약 조회
   */
  async getByDateRange(
    restaurantId: number,
    startDate: string,
    endDate: string
  ): Promise<Booking[]> {
    const bookings = await this.getByRestaurant(restaurantId);
    return bookings.filter((b) => {
      const bookingDate = new Date(b.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return bookingDate >= start && bookingDate <= end;
    });
  },

  /**
   * 🆕 특정 날짜의 확정된 예약 총 인원 계산
   */
  async getConfirmedPartySizeByDate(
    restaurantId: number,
    date: string
  ): Promise<number> {
    const bookings = await this.getByRestaurant(restaurantId);
    
    // 해당 날짜의 confirmed 예약만 필터링
    const confirmedBookings = bookings.filter(
      (b) => b.date === date && b.status === 'confirmed'
    );
    
    // 총 인원 계산
    const totalPartySize = confirmedBookings.reduce(
      (sum, booking) => sum + booking.partySize,
      0
    );
    
    console.log(`[bookingService] ${date} 확정 예약 총 인원:`, totalPartySize);
    return totalPartySize;
  },
};

// ============================================
// Real API (백엔드 서버 호출)
// ============================================

const realBookingService = {
  // 학생: 예약 정보 확인
  async getAll(): Promise<Booking[]> {
    return apiClient<Booking[]>('/student/reservations', {
      method: 'GET',
    });
  },

  // 사장님: 매장 전체 예약 정보 조회
  async getByRestaurant(restaurantId: number): Promise<Booking[]> {
    return apiClient<Booking[]>(`/store/reservations?store_id=${restaurantId}`, {
      method: 'GET',
    });
  },

  // 학생: 예약 신청
  async create(
    data: Omit<Booking, 'id' | 'createdAt' | 'confirmationNumber'>
  ): Promise<Booking> {
    return apiClient<Booking>('/student/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 학생: 예약 취소
  async delete(id: string): Promise<void> {
    await apiClient<void>(`/student/reservations/${id}`, {
      method: 'DELETE',
    });
  },

  // 사장님: 예약 수락
  async confirm(id: string): Promise<Booking> {
    return apiClient<Booking>(`/store/reservations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'confirmed' }),
    });
  },

  // 사장님: 예약 거절
  async reject(id: string): Promise<Booking> {
    return apiClient<Booking>(`/store/reservations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'rejected' }),
    });
  },
};

// ============================================
// Export - Mock/Real 자동 선택
// ============================================

export const bookingService = USE_MOCK_API
  ? mockBookingService
  : realBookingService;