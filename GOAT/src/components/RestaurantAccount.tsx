import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { restaurantService, authService } from "../services";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { RestaurantDashboard } from "./RestaurantDashboard";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Store,
  MapPin,
  Clock,
  Phone,
  Mail,
  Settings,
  Upload,
  Star,
  Globe,
  Wifi,
  CreditCard,
  Users,
  BarChart,
  ShieldCheck,
  Award,
} from "lucide-react";

export function RestaurantAccount() {
  const { currentUser, setCurrentUser, updateRestaurant } = useApp();
  const [activeTab, setActiveTab] = useState("dashboard");

  // 매장 정보 state
  const [restaurant, setRestaurant] = useState<any>(null);
  const [isLoadingRestaurant, setIsLoadingRestaurant] = useState(true);

  // 매장 정보 폼 state
  const [restaurantName, setRestaurantName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [restaurantImage, setRestaurantImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isUpdatingRestaurant, setIsUpdatingRestaurant] = useState(false);

  // 계정 정보 폼 state
  const [managerName, setManagerName] = useState(currentUser?.name || "");
  const [managerEmail, setManagerEmail] = useState(currentUser?.email || "");
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);

  // 매장 정보 불러오기 (명세서 기반: /student/stores/{store_id} 사용)
  useEffect(() => {
    const loadRestaurant = async () => {
      if (!currentUser?.restaurantId) {
        setIsLoadingRestaurant(false);
        return;
      }
      try {
        const data = await restaurantService.getById(currentUser.restaurantId);
        if (data) {
          setRestaurant(data);
          setRestaurantName(data.name || "");
          setCapacity(data.capacity?.toString() || "");
          setAddress(data.address || "");
          setPhone(data.phone || "");
          setRestaurantImage(data.image || "");
          setImagePreview(data.image || "");
        }
      } catch (error) {
        console.error("매장 정보 불러오기 실패:", error);
      } finally {
        setIsLoadingRestaurant(false);
      }
    };
    loadRestaurant();
  }, [currentUser?.restaurantId]);

  // 이미지 파일 업로드 핸들러 (프론트에서 Base64 변환)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!validTypes.includes(file.type)) {
      alert("JPG, PNG, WEBP, GIF 형식의 이미지만 업로드 가능합니다.");
      return;
    }
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("이미지 크기는 2MB 이하여야 합니다.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setRestaurantImage(base64String);
      setImagePreview(base64String);
    };
    reader.onerror = () => {
      alert("이미지 업로드 중 오류가 발생했습니다.");
    };
    reader.readAsDataURL(file);
  };

  // 매장 정보 업데이트 (명세서 기반: /store/profile PATCH 사용)
  const handleUpdateRestaurant = async () => {
    if (!currentUser?.restaurantId) {
      alert("매장 정보를 찾을 수 없습니다.");
      return;
    }
    if (!restaurantName || !address) {
      alert("매장 이름과 주소는 필수 입력 항목입니다.");
      return;
    }
    try {
      setIsUpdatingRestaurant(true);
      const updatedRestaurant = await restaurantService.update(currentUser.restaurantId, {
        name: restaurantName,
        capacity: capacity ? parseInt(capacity) : undefined,
        address: address,
        phone: phone,
        image: restaurantImage,
      });
      setRestaurant(updatedRestaurant);
      await updateRestaurant(currentUser.restaurantId, {
        name: restaurantName,
        capacity: capacity ? parseInt(capacity) : undefined,
        address: address,
        phone: phone,
        image: restaurantImage,
      });
      alert("매장 정보가 성공적으로 업데이트되었습니다!");
    } catch (error) {
      console.error("매장 정보 업데이트 실패:", error);
      alert("매장 정보 업데이트 중 오류가 발생했습니다.");
    } finally {
      setIsUpdatingRestaurant(false);
    }
  };

  // 계정 정보 업데이트 (명세서 기반: /auth/profile PATCH 사용)
  const handleUpdateAccount = async () => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!managerName || !managerEmail) {
      alert("이름과 이메일은 필수 입력 항목입니다.");
      return;
    }
    try {
      setIsUpdatingAccount(true);
      const updatedUser = await authService.updateProfile({
        name: managerName,
        email: managerEmail,
      });
      setCurrentUser(updatedUser);
      alert("계정 정보가 성공적으로 업데이트되었습니다!");
    } catch (error) {
      console.error("계정 정보 업데이트 실패:", error);
      alert("계정 정보 업데이트 중 오류가 발생했습니다.");
    } finally {
      setIsUpdatingAccount(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 레스토랑 프로필 헤더 */}
      <Card className="shadow-lg overflow-hidden border-[#d4e1ff]">
        <div className="bg-gradient-to-r from-[#5570f1] to-[#4a6cf7] h-32"></div>
        <CardContent className="-mt-16 pb-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <Avatar className="w-32 h-32 border-4 border-white shadow-xl bg-white">
              <AvatarImage src={restaurant?.image || ""} alt="레스토랑" />
              <AvatarFallback>
                <Store className="w-16 h-16 text-[#4a6cf7]" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-black mb-2">
                {isLoadingRestaurant
                  ? "로딩 중..."
                  : restaurant?.name || "매장 정보 없음"}
              </h1>
              <p className="text-gray-600">
                {restaurant?.address || "주소 정보 없음"}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center"></div>
          </div>
        </CardContent>
      </Card>

      {/* 메인 탭 네비게이션 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-1 border border-[#d4e1ff]">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-b data-[state=active]:from-[#5570f1] data-[state=active]:to-[#4a6cf7] data-[state=active]:text-white">
              <BarChart className="w-4 h-4" />
              <span className="hidden sm:inline">대시보드</span>
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-b data-[state=active]:from-[#5570f1] data-[state=active]:to-[#4a6cf7] data-[state=active]:text-white">
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">매장 정보</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-b data-[state=active]:from-[#5570f1] data-[state=active]:to-[#4a6cf7] data-[state=active]:text-white">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">설정</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard">
          <RestaurantDashboard />
        </TabsContent>

        <TabsContent value="info">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* 매장 이미지 */}
            <Card className="shadow-lg border-[#d4e1ff] lg:col-span-2">
              <CardHeader className="border-b border-[#d4e1ff] bg-gradient-to-r from-[#f0f4ff] to-white">
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#4a6cf7]" />
                  매장 이미지
                </CardTitle>
                <CardDescription>
                  고객에게 보여질 매장 대표 이미지입니다
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-[#d4e1ff]">
                    {imagePreview ? (
                      <img src={imagePreview} alt="매장 이미지" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-b from-[#e8efff] to-[#ffffff] flex items-center justify-center">
                        <Upload className="w-12 h-12 text-[#c3cfe5]" />
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="restaurant-image-update"
                    className="cursor-pointer px-4 py-2 bg-gradient-to-b from-[#5570f1] to-[#4a6cf7] text-white rounded-lg hover:from-[#4a6cf7] hover:to-[#3451d9] transition-all shadow-md flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {imagePreview ? "이미지 변경" : "이미지 업로드"}
                  </label>
                  <input
                    id="restaurant-image-update"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 text-center">
                    JPG, PNG, WEBP, GIF (최대 2MB)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 기본 정보 */}
            <Card className="shadow-lg border-[#d4e1ff]">
              <CardHeader className="border-b border-[#d4e1ff] bg-gradient-to-r from-[#f0f4ff] to-white">
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-[#4a6cf7]" />
                  기본 정보
                </CardTitle>
                <CardDescription>
                  매장의 기본 정보를 관리하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurant-name">매장 이름</Label>
                  <Input
                    id="restaurant-name"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="border-[#d4e1ff] focus:border-[#4a6cf7] focus:ring-[#4a6cf7]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-capacity">최대 수용인원</Label>
                  <Input
                    id="max-capacity"
                    type="number"
                    step="5"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="border-[#d4e1ff] focus:border-[#4a6cf7] focus:ring-[#4a6cf7]"
                  />
                  <p className="text-xs text-gray-500">
                    매장에서 한 번에 수용 가능한 최대 인원수
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 연락처 정보 */}
            <Card className="shadow-lg border-[#d4e1ff]">
              <CardHeader className="border-b border-[#d4e1ff] bg-gradient-to-r from-[#f0f4ff] to-white">
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-[#4a6cf7]" />
                  연락처 정보
                </CardTitle>
                <CardDescription>
                  고객이 연락할 수 있는 정보입니다
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">주소</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="border-[#d4e1ff] focus:border-[#4a6cf7] focus:ring-[#4a6cf7]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">매장 전화번호</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border-[#d4e1ff] focus:border-[#4a6cf7] focus:ring-[#4a6cf7]"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              <Button
                size="lg"
                className="w-full bg-gradient-to-b from-[#5570f1] to-[#4a6cf7] hover:from-[#4a6cf7] hover:to-[#3451d9]"
                onClick={handleUpdateRestaurant}
                disabled={isUpdatingRestaurant}
              >
                <Settings className="w-4 h-4 mr-2" />
                {isUpdatingRestaurant ? "저장 중..." : "변경사항 저장"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="account">
          <div className="max-w-2xl mx-auto">
            {/* 계정 정보 */}
            <Card className="shadow-lg border-[#d4e1ff]">
              <CardHeader className="border-b border-[#d4e1ff] bg-gradient-to-r from-[#f0f4ff] to-white">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#4a6cf7]" />
                  계정 정보
                </CardTitle>
                <CardDescription>
                  담당자 정보를 관리하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manager-name">담당자 이름</Label>
                  <Input
                    id="manager-name"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="border-[#d4e1ff] focus:border-[#4a6cf7] focus:ring-[#4a6cf7]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager-email">담당자 이메일</Label>
                  <Input
                    id="manager-email"
                    type="email"
                    value={managerEmail}
                    onChange={(e) => setManagerEmail(e.target.value)}
                    className="border-[#d4e1ff] focus:border-[#4a6cf7] focus:ring-[#4a6cf7]"
                  />
                </div>
                <Button
                  className="w-full bg-gradient-to-b from-[#5570f1] to-[#4a6cf7] hover:from-[#4a6cf7] hover:to-[#3451d9]"
                  size="lg"
                  onClick={handleUpdateAccount}
                  disabled={isUpdatingAccount}
                >
                  {isUpdatingAccount ? "업데이트 중..." : "정보 업데이트"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}