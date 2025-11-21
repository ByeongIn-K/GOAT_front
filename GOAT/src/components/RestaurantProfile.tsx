import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Calendar,
  MapPin,
  Phone,
  Users,
  Clock,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import {
  getCurrentTime,
  findNextAvailableTime,
  generateDefaultTimeSlots,
  formatKoreanDate,
  getTodayLocalDate,
  formatLocalDate,
  getTomorrowLocalDate,
} from "../services";

interface RestaurantProfileProps {
  restaurantId?: number;
  bookingInfo?: {
    mode: "instant" | "scheduled";
    date?: Date;
    time?: string;
    partySize: string;
  };
  onBack?: () => void;
  onBookingComplete?: () => void;
}

export function RestaurantProfile({
  restaurantId = 1,
  bookingInfo,
  onBack,
  onBookingComplete,
}: RestaurantProfileProps) {
  // Context에서 데이터 가져오기
  const {
    restaurants,
    addBooking,
    currentUser,
    bookings,
  } = useApp();

  // 선택된 레스토랑 정보 가져오기
  const restaurant =
    restaurants.find((r) => r.id === restaurantId) ||
    restaurants[0];

  const [selectedDate, setSelectedDate] = useState(() => {
    if (bookingInfo?.date) {
      return formatLocalDate(bookingInfo.date);
    }
    return getTodayLocalDate();
  });
  const [selectedTime, setSelectedTime] = useState(
    bookingInfo?.time || "",
  );
  const [showConfirmation, setShowConfirmation] =
    useState(false);
  const [partySize, setPartySize] = useState(
    bookingInfo?.partySize.replace("명", "") || "5",
  );

  // 예약자 정보
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // 로그인한 사용자 정보로 자동 채우기
  useEffect(() => {
    if (currentUser) {
      setGuestName(currentUser.name || "");
      setGuestPhone(currentUser.phone || "");
    }
  }, [currentUser]);

  // 예약 모드
  const bookingMode = bookingInfo?.mode || "scheduled";

  // 시간 슬롯 및 남은 수용 인원 계산 (명세서 기반: 프론트에서 bookings로 계산)
  const [timeSlots, setTimeSlots] = useState<
    Array<{ time: string; available: boolean }>
  >(generateDefaultTimeSlots().map((time) => ({
    time,
    available: true,
  })));

  const [availableCapacity, setAvailableCapacity] =
    useState<number>(restaurant.capacity);

  useEffect(() => {
    // 예약된 인원 계산
    const reserved = bookings.upcoming
      .filter(
        (b) =>
          b.restaurantId === restaurant.id &&
          b.date === selectedDate &&
          b.status === "confirmed"
      )
      .reduce((sum, b) => sum + b.partySize, 0);

    setAvailableCapacity(restaurant.capacity - reserved);

    // 시간 슬롯은 기본값 사용 (명세서에 시간별 예약 가능 정보 없음)
    setTimeSlots(
      generateDefaultTimeSlots().map((time) => ({
        time,
        available: true,
      }))
    );
  }, [restaurant.id, selectedDate, restaurant.capacity, bookings]);

  // 실시간 예약 모드일 때 자동으로 시간 설정
  useEffect(() => {
    if (bookingMode === "instant") {
      const currentTime = getCurrentTime();
      const nextTime = findNextAvailableTime(
        currentTime,
        generateDefaultTimeSlots()
      );
      if (nextTime) {
        setSelectedTime(nextTime);
      } else {
        const tomorrowStr = getTomorrowLocalDate();
        setSelectedDate(tomorrowStr);
        setSelectedTime(generateDefaultTimeSlots()[0]);
      }
    }
  }, [bookingMode, restaurant.id]);

  const handleBooking = async () => {
    if (
      !guestName ||
      !guestPhone ||
      (bookingMode === "scheduled" && !selectedTime)
    ) {
      alert("모든 필수 필드를 입력해주세요.");
      return;
    }

    if (availableCapacity === 0) {
      alert("죄송합니다. 현재 예약이 마감되었습니다.");
      return;
    }

    const requestedSize = parseInt(partySize);
    if (requestedSize > availableCapacity) {
      alert(
        `죄송합니다. 현재 ${availableCapacity}명까지만 예약 가능합니다.`,
      );
      return;
    }

    try {
      if (!currentUser) {
        alert("로그인이 필요합니다.");
        return;
      }

      const bookingData = {
        userId: currentUser.id,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        guestName,
        guestPhone,
        date: selectedDate,
        time: selectedTime,
        partySize: requestedSize,
        status: "pending" as const,
        mode: bookingMode,
      };

      await addBooking(bookingData);

      setShowConfirmation(true);
    } catch (error) {
      alert("예약 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  if (showConfirmation) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Clock className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-3xl text-yellow-900 mb-2">
              예약 요청이 완료되었습니다!
            </CardTitle>
            <CardDescription className="text-lg text-yellow-700">
              매장 승인 대기 중입니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 🆕 승인 대기 안내 */}
            <div className="bg-white rounded-xl p-4 border-2 border-yellow-200">
              <p className="text-sm text-gray-700 text-center">
                매장에서 예약을 확인한 후 승인 여부가
                결정됩니다.
                <br />
                <strong className="text-yellow-700">
                  내 예약
                </strong>{" "}
                페이지에서 예약 상태를 확인하세요.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="mb-4 pb-3 border-b">
                예약 상세 정보
              </h3>
              <div className="space-y-3">
                {/* ✅ 모든 모드에서 날짜 표시 */}
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">날짜</span>
                  <span className="font-medium">
                    {formatKoreanDate(selectedDate)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">
                    {bookingMode === "instant"
                      ? "예약 타입"
                      : "시간"}
                  </span>
                  <span className="font-medium">
                    {bookingMode === "instant" ? (
                      <span className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        즉시 예약 ({selectedTime})
                      </span>
                    ) : (
                      selectedTime
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">인원</span>
                  <span className="font-medium">
                    {partySize}명
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">매장</span>
                  <span className="font-medium">
                    {restaurant.name}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">예약자</span>
                  <span className="font-medium">
                    {guestName}
                  </span>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => {
                setShowConfirmation(false);
                onBookingComplete?.();
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              완료
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 뒤로가기 버튼 */}
      {onBack && (
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2 border-[#d4e1ff] text-[#4a6cf7] hover:bg-[#f0f4ff]"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </Button>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 레스토랑 정보 */}
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl mb-3">
              {restaurant.name}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <MapPin className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium mb-1">주소</p>
                  <p className="text-gray-700">
                    {restaurant.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Phone className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium mb-1">전화번호</p>
                  <p className="text-gray-700">
                    {restaurant.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Users className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium mb-1">
                    남은 수용 인원
                  </p>
                  <p
                    className={`${
                      availableCapacity > 10
                        ? "text-green-600"
                        : availableCapacity > 5
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {availableCapacity}명
                    {availableCapacity === 0 && (
                      <span className="ml-2 text-sm text-red-600">
                        (예약 마감)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 예약 폼 */}
        <Card className="lg:col-span-1 shadow-lg sticky top-6 h-fit">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              {bookingMode === "instant"
                ? "즉시 예약하기"
                : "예약하기"}
            </CardTitle>
            <CardDescription>
              {bookingMode === "instant"
                ? "지금 바로 방문하실 예약 정보를 입력하세요"
                : "원하시는 시간을 선택하세요"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {/* 예약자명 */}
            <div className="space-y-2">
              <Label>예약자명 *</Label>
              <Input
                placeholder="이름을 입력하세요"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
            </div>

            {/* 연락처 */}
            <div className="space-y-2">
              <Label>연락처 *</Label>
              <Input
                type="tel"
                placeholder="010-0000-0000"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
              />
            </div>

            {/* 예약 인원 */}
            <div className="space-y-2">
              <Label>예약 인원 *</Label>
              <div className="grid grid-cols-5 gap-2 p-1">
                {Array.from(
                  {
                    length: Math.floor(restaurant.capacity / 5),
                  },
                  (_, i) => (i + 1) * 5,
                ).map((num) => (
                  <Button
                    key={num}
                    variant={
                      partySize === num.toString()
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => setPartySize(num.toString())}
                    disabled={num > availableCapacity}
                    className={
                      partySize === num.toString()
                        ? "bg-gradient-to-b from-[#5570f1] to-[#4a6cf7]"
                        : "border-[#d4e1ff] text-[#4a6cf7] hover:bg-[#f0f4ff]"
                    }
                  >
                    {num}명
                  </Button>
                ))}
              </div>
            </div>

            {/* 일정 예약일 경우에만 날짜/시간 선택 표시 */}
            {bookingMode === "scheduled" && (
              <>
                <div className="space-y-2">
                  <Label>날짜</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) =>
                      setSelectedDate(e.target.value)
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>예약 가능 시간</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={
                          selectedTime === slot.time
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        disabled={!slot.available}
                        onClick={() =>
                          setSelectedTime(slot.time)
                        }
                        className={
                          selectedTime === slot.time
                            ? "bg-blue-600"
                            : ""
                        }
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    회색 버튼은 예약 불가능한 시간입니다
                  </p>
                </div>
              </>
            )}

            {/* 실시간 예약일 경우 예약 시간 안내 */}
            {bookingMode === "instant" && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-green-900 mb-1">
                      즉시 예약
                    </p>
                    <p className="text-sm text-green-700">
                      예약 시간:{" "}
                      <strong>
                        {selectedTime || "바로 방문"}
                      </strong>
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      예약 확정 후 곧바로 방문하실 수 있습니다
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={
                !guestName ||
                !guestPhone ||
                (bookingMode === "scheduled" &&
                  !selectedTime) ||
                availableCapacity === 0
              }
              onClick={handleBooking}
            >
              <Calendar className="w-4 h-4 mr-2" />
              {availableCapacity === 0
                ? "예약 마감"
                : bookingMode === "instant"
                  ? "즉시 예약 확정하기"
                  : "예약 확정하기"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}