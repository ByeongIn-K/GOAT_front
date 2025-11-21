import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import {
  Users,
  MapPin,
  CalendarIcon,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useApp } from "../context/AppContext";
import { generateDefaultTimeSlots, getCurrentTime, findNextAvailableTime } from "../services";

interface RestaurantDiscoveryProps {
  onRestaurantSelect?: (
    restaurantId: number,
    bookingInfo: {
      mode: "instant" | "scheduled";
      date?: Date;
      time?: string;
      partySize: string;
    },
  ) => void;
}

export function RestaurantDiscovery({
  onRestaurantSelect,
}: RestaurantDiscoveryProps) {
  // Context에서 레스토랑 데이터와 예약 데이터 가져오기
  const { restaurants, bookings } = useApp();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // 날짜별 남은 수용 인원 계산
  const getAvailableCapacity = (
    restaurantId: number,
    date: Date | undefined,
    defaultCapacity: number,
  ): number => {
    if (!date) return defaultCapacity;
    const dateStr = date.toISOString().split("T")[0];
    const reserved = bookings.upcoming
      .filter(
        (b) =>
          b.restaurantId === restaurantId &&
          b.date === dateStr &&
          b.status === "confirmed"
      )
      .reduce((sum, b) => sum + b.partySize, 0);
    return defaultCapacity - reserved;
  };

  // 실시간 예약: 다음 예약 가능 시간 계산
  const getNextAvailableSlot = (restaurantId: number) => {
    const slots = generateDefaultTimeSlots();
    const currentTime = getCurrentTime();
    return findNextAvailableTime(currentTime, slots) || slots[0];
  };

  // 날짜별 예약: 예약 가능한 시간대 반환
  const getAvailableSlots = (
    restaurantId: number,
    date: Date | undefined,
  ) => {
    if (!date) return [];
    return generateDefaultTimeSlots();
  };

  // 날짜별 예약 탭: 예약 가능한 매장 필터링
  const filteredRestaurantsByDate = selectedDate
    ? restaurants.filter((restaurant) => {
        const availableCapacity = getAvailableCapacity(
          restaurant.id,
          selectedDate,
          restaurant.capacity,
        );
        return availableCapacity > 0;
      })
    : [];

  // 실시간 예약 탭: 예약 가능한 매장 필터링
  const filteredRestaurantsForInstant = restaurants.filter((restaurant) => {
    const availableCapacity = getAvailableCapacity(
      restaurant.id,
      new Date(),
      restaurant.capacity,
    );
    return availableCapacity > 0;
  });

  const renderRestaurantCard = (
    restaurant: any,
    mode: "instant" | "scheduled",
    availableSlots?: string[],
  ) => {
    const nextSlot =
      mode === "instant"
        ? getNextAvailableSlot(restaurant.id)
        : availableSlots?.[0];

    const targetDate = mode === "scheduled" ? selectedDate : new Date();
    const availableCapacity = getAvailableCapacity(
      restaurant.id,
      targetDate,
      restaurant.capacity,
    );

    return (
      <Card
        key={restaurant.id}
        className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300"
      >
        <div className="flex flex-col md:flex-row">
          {/* 레스토랑 이미지 */}
          <div className="md:w-64 md:flex-shrink-0">
            <ImageWithFallback
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-48 md:h-64 object-cover"
            />
          </div>

          {/* 레스토랑 정보 */}
          <div className="flex-1 p-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4">
              <div className="mb-3 lg:mb-0">
                <div className="flex items-center gap-3 mb-2">
                  <h2>{restaurant.name}</h2>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm">
                  {restaurant.address}
                </span>
              </div>
            </div>

            {/* 수용 인원 정보 - 실시간 업데이트 */}
            <div className={`bg-gradient-to-r rounded-xl px-4 py-3 mb-4 border-2 ${
              availableCapacity > 10 
                ? 'from-green-50 to-emerald-50 border-green-300' 
                : availableCapacity > 5
                ? 'from-yellow-50 to-amber-50 border-yellow-300'
                : 'from-red-50 to-rose-50 border-red-300'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Users className={`w-5 h-5 ${
                    availableCapacity > 10 
                      ? 'text-green-600' 
                      : availableCapacity > 5
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`} />
                  <span className={
                    availableCapacity > 10 
                      ? 'text-green-900' 
                      : availableCapacity > 5
                      ? 'text-yellow-900'
                      : 'text-red-900'
                  }>
                    남은 수용 인원:{" "}
                    <strong className="text-lg">
                      {availableCapacity}명
                    </strong>
                    {availableCapacity === 0 && (
                      <span className="ml-2 text-sm">(예약 마감)</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t">
              <div className="flex items-center gap-3"></div>
              <Button
                size="lg"
                className="w-full sm:w-auto"
                disabled={availableCapacity === 0}
                onClick={() =>
                  onRestaurantSelect?.(restaurant.id, {
                    mode: mode,
                    date:
                      mode === "scheduled"
                        ? selectedDate
                        : undefined,
                    time: nextSlot || undefined,
                    partySize: "2명",
                  })
                }
              >
                {availableCapacity === 0 ? "예약 마감" : "보기 및 예약하기"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <Tabs defaultValue="instant" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="instant">
                실시간 예약
              </TabsTrigger>
              <TabsTrigger value="scheduled">
                날짜별 예약
              </TabsTrigger>
            </TabsList>

            {/* 실시간 예약 탭 */}
            <TabsContent value="instant" className="space-y-4">
              {filteredRestaurantsForInstant.length > 0 ? (
                <div className="space-y-4">
                  {filteredRestaurantsForInstant.map((restaurant) =>
                    renderRestaurantCard(restaurant, "instant"),
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="mb-2">
                    현재 예약 가능한 매장이 없습니다
                  </h3>
                  <p className="text-gray-600">
                    모든 매장이 예약 마감되었습니다. 잠시 후 다시 확인해주세요.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* 날짜별 예약 탭 */}
            <TabsContent
              value="scheduled"
              className="space-y-4"
            >
              <div className="mb-6">
                <div className="flex flex-col items-center">
                  <div className="mb-4 text-center">
                    <h3 className="mb-2">
                      예약 날짜를 선택하세요
                    </h3>
                    <p className="text-gray-600">
                      선택한 날짜에 예약 가능한 레스토랑이
                      표시됩니다
                    </p>
                  </div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border shadow"
                    disabled={(date: Date) =>
                      date < new Date() ||
                      filteredRestaurantsByDate.length === 0
                    }
                  />
                </div>
              </div>

              {filteredRestaurantsByDate.length > 0 ? (
                <div className="space-y-4">
                  {filteredRestaurantsByDate.map((restaurant) =>
                    renderRestaurantCard(restaurant, "scheduled", getAvailableSlots(restaurant.id, selectedDate)),
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="mb-2">
                    선택한 날짜에 예약 가능한 매장이 없습니다
                  </h3>
                  <p className="text-gray-600">
                    다른 날짜를 선택하거나, 실시간 예약 탭을 확인해주세요.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}