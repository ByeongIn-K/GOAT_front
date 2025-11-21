/**
 * Restaurant Service - 레스토랑 데이터 관리
 */

import { Restaurant } from '../../types';
import { USE_MOCK_API, STORAGE_KEYS } from '../config';
import { apiClient } from '../apiClient';
import { mockRestaurants } from '../../data/mockData';

// ============================================
// Mock API (로컬스토리지 사용)
// ============================================

const mockRestaurantService = {
  /**
   * 모든 레스토랑 조회
   */
  async getAll(): Promise<Restaurant[]> {
    const saved = localStorage.getItem(STORAGE_KEYS.RESTAURANTS);
    if (saved) {
      return JSON.parse(saved);
    }
    // 초기 데이터가 없으면 mockData 사용
    localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(mockRestaurants));
    return mockRestaurants;
  },

  /**
   * 특정 레스토랑 조회
   */
  async getById(id: number): Promise<Restaurant | null> {
    const restaurants = await this.getAll();
    return restaurants.find((r) => r.id === id) || null;
  },

  /**
   * 레스토랑 추가
   */
  async create(restaurant: Restaurant): Promise<Restaurant> {
    const restaurants = await this.getAll();
    const newRestaurant = {
      ...restaurant,
      id: restaurant.id || Date.now(), // ID가 없으면 생성
    };
    const updated = [...restaurants, newRestaurant];
    localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(updated));
    return newRestaurant;
  },

  /**
   * 레스토랑 수정
   */
  async update(id: number, updates: Partial<Restaurant>): Promise<Restaurant> {
    const restaurants = await this.getAll();
    const index = restaurants.findIndex((r) => r.id === id);
    
    if (index === -1) {
      throw new Error(`레스토랑을 찾을 수 없습니다. (ID: ${id})`);
    }

    const updated = restaurants.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    );
    localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(updated));
    return updated[index];
  },

  /**
   * 레스토랑 삭제
   */
  async delete(id: number): Promise<void> {
    const restaurants = await this.getAll();
    const filtered = restaurants.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(filtered));
  },

  /**
   * 검색 및 필터링
   */
  async search(params: {
    cuisine?: string;
    priceRange?: string;
    minRating?: number;
  }): Promise<Restaurant[]> {
    const restaurants = await this.getAll();
    
    return restaurants.filter((r) => {
      if (params.cuisine && r.cuisine !== params.cuisine) return false;
      if (params.priceRange && r.priceRange !== params.priceRange) return false;
      if (params.minRating && r.rating < params.minRating) return false;
      return true;
    });
  },
};

// ============================================
// Real API (백엔드 서버 호출)
// ============================================

const realRestaurantService = {
  // 학생: 예약 가능한 매장 조회 (날짜 파라미터 필요)
  async getAll(date?: string): Promise<Restaurant[]> {
    const url = date
      ? `/student/stores?date=${date}`
      : '/student/stores';
    return apiClient<Restaurant[]>(url, {
      method: 'GET',
    });
  },

  // 학생: 매장 상세 정보 조회
  async getById(id: number): Promise<Restaurant | null> {
    try {
      return await apiClient<Restaurant>(`/student/stores/${id}`, {
        method: 'GET',
      });
    } catch (error) {
      return null;
    }
  },

  // 사장님: 매장 상세 정보 입력
  async create(restaurant: Restaurant): Promise<Restaurant> {
    return apiClient<Restaurant>('/store/profile', {
      method: 'POST',
      body: JSON.stringify(restaurant),
    });
  },

  // 사장님: 매장 정보 수정
  async update(id: number, updates: Partial<Restaurant>): Promise<Restaurant> {
    return apiClient<Restaurant>('/store/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async delete(id: number): Promise<void> {
    await apiClient<void>(`/restaurants/${id}`, {
      method: 'DELETE',
    });
  },

  async search(params: {
    cuisine?: string;
    priceRange?: string;
    minRating?: number;
  }): Promise<Restaurant[]> {
    const queryParams = new URLSearchParams();
    if (params.cuisine) queryParams.append('cuisine', params.cuisine);
    if (params.priceRange) queryParams.append('priceRange', params.priceRange);
    if (params.minRating) queryParams.append('minRating', params.minRating.toString());

    return apiClient<Restaurant[]>(`/restaurants/search?${queryParams.toString()}`);
  },
};

// ============================================
// Export - Mock/Real 자동 선택
// ============================================

export const restaurantService = USE_MOCK_API
  ? mockRestaurantService
  : realRestaurantService;
