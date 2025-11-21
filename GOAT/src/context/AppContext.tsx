import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { Restaurant, Booking, User, RestaurantSettings } from "../types";
import { restaurantService, bookingService, authService } from "../services";

interface AppContextType {
  // 레스토랑 데이터
  restaurants: Restaurant[];
  addRestaurant: (restaurant: Restaurant) => Promise<void>;
  updateRestaurant: (id: number, updates: Partial<Restaurant>) => Promise<void>;
  getRestaurant: (id: number) => Restaurant | undefined;
  refreshRestaurants: () => Promise<void>;

  // 예약 데이터
  bookings: {
    upcoming: Booking[];
    past: Booking[];
  };
  addBooking: (booking: Omit<Booking, "id" | "createdAt" | "confirmationNumber">) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  rejectBooking: (id: string) => Promise<void>;
  confirmBooking: (id: string) => Promise<void>; // 추가된 부분
  getBookingsByRestaurant: (restaurantId: number) => Booking[];
  getBookingsByUser: (userId: string) => Booking[];

  // 현재 사용자
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // 로딩 상태
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 예약 데이터를 upcoming/past로 분류 (동적으로 현재 날짜 기준)
  const bookings = useMemo(() => {
    const now = new Date();
    // ✅ 시간을 00:00:00으로 설정하여 날짜만 비교
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    console.log(`[예약 분류] 현재 날짜 기준: ${today.toISOString().split('T')[0]} (${today.toLocaleString('ko-KR')})`);
    console.log(`[예약 분류] 현재 시각: ${now.toLocaleTimeString('ko-KR')}`);
    
    const result = {
      upcoming: allBookings.filter((b) => {
        // ✅ cancelled만 제외 (rejected는 날짜 기준으로 분류)
        if (b.status === 'cancelled') return false;
        
        const bookingDate = new Date(b.date);
        
        // 📅 오늘 날짜인 경우 시간도 비교
        if (bookingDate.toISOString().split('T')[0] === today.toISOString().split('T')[0]) {
          // 시간 비교 (HH:MM 형식)
          const bookingTime = b.time; // "18:00"
          const currentTime = now.toTimeString().substring(0, 5); // "20:30"
          
          const isTimeUpcoming = bookingTime >= currentTime;
          
          if (allBookings.length > 0) {
            console.log(`  - 예약 ${b.id?.substring(0, 10)}... : ${b.date} ${b.time} (${b.status}) (현재: ${currentTime}) → ${isTimeUpcoming ? 'upcoming' : 'past (시간 지남)'}`);
          }
          
          return isTimeUpcoming;
        }
        
        // 📅 미래 날짜는 무조건 upcoming
        const isUpcoming = bookingDate > today;
        
        if (allBookings.length > 0) {
          console.log(`  - 예약 ${b.id?.substring(0, 10)}... : ${b.date} (${b.status}) (${isUpcoming ? 'upcoming' : 'past'})`);
        }
        
        return isUpcoming;
      }),
      past: allBookings.filter((b) => {
        // ✅ cancelled만 past에 강제 포함 (rejected는 날짜 기준으로 분류)
        if (b.status === 'cancelled') return true;
        
        const bookingDate = new Date(b.date);
        
        // 📅 오늘 날짜인 경우 시간도 비교
        if (bookingDate.toISOString().split('T')[0] === today.toISOString().split('T')[0]) {
          const bookingTime = b.time;
          const currentTime = now.toTimeString().substring(0, 5);
          return bookingTime < currentTime; // 시간이 지났으면 past
        }
        
        return bookingDate < today;
      }),
    };
    
    console.log(`[예약 분류 결과] Upcoming: ${result.upcoming.length}개, Past: ${result.past.length}개`);
    return result;
  }, [allBookings]);

  // 초기 데이터 로드 (Service 사용)
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        console.log('[AppContext] 초기 데이터 로드 시작...');
        
        // Service를 통해 데이터 로드
        const [restaurantsData, bookingsData, userData] = await Promise.all([
          restaurantService.getAll(),
          bookingService.getAll(),
          authService.getCurrentUser(),
        ]);

        console.log('[AppContext] 로드된 레스토랑 수:', restaurantsData.length);
        console.log('[AppContext] 로드된 예약 수:', bookingsData.length);
        console.log('[AppContext] 현재 사용자:', userData);
        
        if (restaurantsData.length > 0) {
          console.log('[AppContext] 레스토랑 목록:', restaurantsData.map(r => ({ id: r.id, name: r.name })));
        }

        setRestaurants(restaurantsData);
        setAllBookings(bookingsData);
        setCurrentUser(userData);
        
        console.log('[AppContext] ✅ 초기 데이터 로드 완료');
      } catch (error) {
        console.error("[AppContext] 데이터 로드 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // ✅ 자정(00:00) 이후 자동 날짜 업데이트를 위한 타이머
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const msUntilMidnight = tomorrow.getTime() - now.getTime();

      console.log(`[자정 체크] 다음 자정까지: ${Math.floor(msUntilMidnight / 1000 / 60)}분`);

      // 자정까지의 시간 후에 상태를 강제로 업데이트
      const timer = setTimeout(() => {
        console.log('🕛 자정이 되었습니다! 예약 데이터 날짜를 업데이트합니다.');
        // allBookings를 재설정하여 useMemo가 다시 계산되도록 트리거
        setAllBookings(prev => [...prev]);
        // 다시 타이머 설정
        checkMidnight();
      }, msUntilMidnight);

      return timer;
    };

    const timer = checkMidnight();
    return () => clearTimeout(timer);
  }, []);

  // 레스토랑 관련 함수 (Service 사용)
  const addRestaurant = async (restaurant: Restaurant) => {
    try {
      const newRestaurant = await restaurantService.create(restaurant);
      setRestaurants((prev) => [...prev, newRestaurant]);
    } catch (error) {
      console.error("레스토랑 추가 오류:", error);
      throw error;
    }
  };

  const updateRestaurant = async (id: number, updates: Partial<Restaurant>) => {
    try {
      const updated = await restaurantService.update(id, updates);
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? updated : r))
      );
    } catch (error) {
      console.error("레스토랑 수정 오류:", error);
      throw error;
    }
  };

  const getRestaurant = (id: number) => {
    return restaurants.find((r) => r.id === id);
  };

  const refreshRestaurants = async () => {
    try {
      const restaurantsData = await restaurantService.getAll();
      setRestaurants(restaurantsData);
      console.log('[AppContext.refreshRestaurants] 레스토랑 목록 새로고침 완료. 총:', restaurantsData.length);
    } catch (error) {
      console.error('[AppContext.refreshRestaurants] 레스토랑 새로고침 오류:', error);
      throw error;
    }
  };

  // 예약 관련 함수 (Service 사용)
  const addBooking = async (booking: Omit<Booking, "id" | "createdAt" | "confirmationNumber">) => {
    try {
      console.log('[AppContext.addBooking] 예약 추가 시작:', booking);
      const newBooking = await bookingService.create(booking);
      console.log('[AppContext.addBooking] 새 예약 생성 완료:', newBooking);
      
      setAllBookings((prev) => {
        const updated = [...prev, newBooking];
        console.log('[AppContext.addBooking] allBookings 업데이트 완료. 총 예약 수:', updated.length);
        return updated;
      });
    } catch (error) {
      console.error("[AppContext.addBooking] 예약 추가 오류:", error);
      throw error;
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      await bookingService.delete(id);
      setAllBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      console.error("예약 삭제 오류:", error);
      throw error;
    }
  };

  /**
   * ✅ 예약 거절 (상태를 'rejected'로 변경)
   */
  const rejectBooking = async (id: string) => {
    try {
      const updated = await bookingService.reject(id);
      setAllBookings((prev) =>
        prev.map((b) => (b.id === id ? updated : b))
      );
    } catch (error) {
      console.error("예약 거절 오류:", error);
      throw error;
    }
  };

  /**
   * ✅ 예약 확정 (상태를 'confirmed'로 변경)
   */
  const confirmBooking = async (id: string) => {
    const updated = await bookingService.confirm(id);
    setAllBookings((prev) =>
      prev.map((b) => (b.id === id ? updated : b))
    );
  };

  const getBookingsByRestaurant = (restaurantId: number) => {
    return allBookings.filter((b) => b.restaurantId === restaurantId);
  };

  const getBookingsByUser = (userId: string) => {
    return allBookings.filter((b) => b.userId === userId); // ✅ userId로 필터링
  };

  const value: AppContextType = {
    restaurants,
    addRestaurant,
    updateRestaurant,
    getRestaurant,
    refreshRestaurants,
    bookings,
    addBooking,
    deleteBooking,
    rejectBooking,
    confirmBooking, // 추가된 부분
    getBookingsByRestaurant,
    getBookingsByUser,
    currentUser,
    setCurrentUser,
    isLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Context Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};