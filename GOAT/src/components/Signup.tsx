import { useState } from "react";
import svgPathsConsumer from "../imports/svg-hjmrfj2oa0";
import svgPathsRestaurant from "../imports/svg-hnh442ehaz";
import { authService } from "../services";
import { useApp } from "../context/AppContext";

interface SignupProps {
  onLoginClick: () => void;
  onSignupComplete: () => void;
}

type AccountType = "consumer" | "restaurant" | null;

interface FormData {
  userId: string;
  password: string;
  email: string;
  phone: string;
  name: string;
  restaurantName: string;
  managerName: string;
  address: string;
  seats: string;
  imageUrl: string;
}

export function Signup({
  onLoginClick,
  onSignupComplete,
}: SignupProps) {
  // Context에서 상태 관리 함수 가져오기
  const { setCurrentUser, refreshRestaurants } = useApp();

  const [selectedType, setSelectedType] =
    useState<AccountType>("consumer");
  const [formData, setFormData] = useState<FormData>({
    userId: "",
    password: "",
    email: "",
    phone: "",
    name: "",
    restaurantName: "",
    managerName: "",
    address: "",
    seats: "",
    imageUrl: "", // Base64 이미지 데이터
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  // 계정 유형 변경 시 폼 초기화
  const handleTypeChange = (type: AccountType) => {
    setSelectedType(type);
    setImagePreview("");
    setFormData({
      userId: "",
      password: "",
      email: "",
      phone: "",
      name: "",
      restaurantName: "",
      managerName: "",
      address: "",
      seats: "",
      imageUrl: "",
    });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      if (selectedType === "consumer") {
        // 필수 필드 검증 - 소비자
        if (
          !formData.userId ||
          !formData.email ||
          !formData.password ||
          !formData.name
        ) {
          alert("필수 항목을 모두 입력해주세요.");
          return;
        }

        // 소비자 회원가입 (명세서: /auth/signup, role: 'customer')
        const newUser = await authService.signup({
          userId: formData.userId,
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          role: "customer",
        });

        setCurrentUser(newUser);
        alert("회원가입이 완료되었습니다!");
        onSignupComplete();
      } else if (selectedType === "restaurant") {
        // 필수 필드 검증 - 매장
        if (
          !formData.userId ||
          !formData.email ||
          !formData.password ||
          !formData.managerName ||
          !formData.restaurantName ||
          !formData.phone
        ) {
          alert("필수 항목을 모두 입력해주세요.");
          return;
        }

        // 매장 회원가입 (명세서: /auth/signup, role: 'restaurant_owner')
        const newUser = await authService.signup({
          userId: formData.userId,
          email: formData.email,
          password: formData.password,
          name: formData.managerName,
          phone: formData.phone,
          restaurantName: formData.restaurantName,
          capacity: formData.seats ? parseInt(formData.seats) : undefined,
          address: formData.address || undefined,
          imageUrl: formData.imageUrl || undefined,
          role: "restaurant_owner",
        });

        setCurrentUser(newUser);
        await refreshRestaurants();
        alert("매장 회원가입이 완료되었습니다!");
        onSignupComplete();
      }
    } catch (error) {
      console.error("회원가입 실패:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("회원가입 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 이미지 파일 업로드 핸들러
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 형식 검증
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!validTypes.includes(file.type)) {
      alert(
        "JPG, PNG, WEBP, GIF 형식의 이미지만 업로드 가능합니다.",
      );
      return;
    }

    // 파일 크기 검증 (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("이미지 크기는 2MB 이하여야 합니다.");
      return;
    }

    // 파일을 Base64로 변환
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData((prev) => ({
        ...prev,
        imageUrl: base64String,
      }));
      setImagePreview(base64String);
    };
    reader.onerror = () => {
      alert("이미지 업로드 중 오류가 발생했습니다.");
    };
    reader.readAsDataURL(file);
  };

  // 공통 헤더 컴포넌트
  const Header = () => (
    <header className="sticky top-0 bg-[rgba(255,255,255,0.8)] box-border content-stretch flex flex-col h-[74.4px] items-start pb-[0.8px] pt-[16px] px-[32px] w-full z-50">
      <div
        aria-hidden="true"
        className="absolute border-[#d4e1ff] border-[0px_0px_0.8px] border-solid inset-0 pointer-events-none"
      />
      <div className="h-[41.6px] relative shrink-0 w-full">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex h-[41.6px] items-center justify-between relative w-full">
            <div className="h-[40px] relative shrink-0 w-[139.038px]">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[12px] h-[40px] items-center relative w-[139.038px]">
                <div className="bg-gradient-to-b from-[#5570f1] relative rounded-[16px] shadow-[0px_4px_6px_-1px_rgba(74,108,247,0.2),0px_2px_4px_-2px_rgba(74,108,247,0.2)] shrink-0 size-[40px] to-[#4a6cf7]">
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[40px]">
                    <svg
                      className="relative shrink-0 size-[24px]"
                      fill="none"
                      preserveAspectRatio="none"
                      viewBox="0 0 24 24"
                    >
                      <g>
                        <path
                          d="M8 22H16"
                          stroke="white"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                        <path
                          d="M7 10H17"
                          stroke="white"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                        <path
                          d="M12 15V22"
                          stroke="white"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                        <path
                          d={svgPathsConsumer.p28adc680}
                          stroke="white"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </g>
                    </svg>
                  </div>
                </div>
                <div className="h-[28px] relative shrink-0 w-[87.037px]">
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[28px] relative w-[87.037px]">
                    <p className="absolute font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[28px] left-0 text-[#4a6cf7] text-[20px] text-nowrap top-[-2.2px] whitespace-pre">
                      후문 한잔
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onLoginClick}
                className="bg-white h-[41.6px] relative rounded-[2.68435e+07px] shrink-0 w-[107.6px]"
              >
                <div
                  aria-hidden="true"
                  className="absolute border-[#d4e1ff] border-[0.8px] border-solid inset-0 pointer-events-none rounded-[2.68435e+07px]"
                />
                <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[41.6px] items-center justify-center px-[32.8px] py-[20.8px] relative w-[107.6px]">
                  <p className="font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#5570f1] text-[14px] text-nowrap whitespace-pre">
                    로그인
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );

  return (
    <div
      className="min-h-screen overflow-auto relative w-full pb-20"
      style={{
        backgroundImage:
          "linear-gradient(rgb(240, 244, 255) 0%, rgb(255, 255, 255) 50%, rgb(232, 239, 255) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)",
      }}
    >
      <div className="absolute bg-[#4a6cf7] blur-3xl filter left-[675.2px] opacity-5 rounded-[2.68435e+07px] size-[500px] top-0" />
      <div className="absolute bg-[#3451d9] blur-3xl filter left-0 opacity-5 rounded-[2.68435e+07px] size-[500px] top-[874.8px]" />

      <Header />

      <div className="content-stretch flex flex-col gap-[48px] items-center pt-[48px] px-4 max-w-[896px] mx-auto">
        {/* 타이틀 */}
        <div className="content-stretch flex flex-col gap-[12px] items-center w-full">
          <p className="font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[48px] text-[#4a6cf7] text-[48px] text-center">
            회원가입
          </p>
          <p className="font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[28px] text-[#8b9dc3] text-[18px] text-center">
            후문 한잔과 함께 시작하세요
          </p>
        </div>

        {/* 계정 유형 선택 카드 */}
        <div className="bg-[rgba(255,255,255,0.9)] rounded-[24px] w-full p-7 relative">
          <div className="absolute border-[#d4e1ff] border-[0.8px] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
          <div className="relative flex flex-col gap-5">
            <p className="font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[14px] text-[#5570f1] text-[14px]">
              계정 유형을 선택하세요
            </p>

            <div className="grid grid-cols-2 gap-4">
              {/* 소비자 선택 */}
              <button
                onClick={() => handleTypeChange("consumer")}
                className={`rounded-[16px] p-7 border-[1.6px] transition-all ${
                  selectedType === "consumer"
                    ? "bg-gradient-to-b from-[#e8efff] to-[#ffffff] border-[#5570f1] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]"
                    : "bg-white border-[#d4e1ff] hover:border-[#5570f1]"
                }`}
              >
                <div className="flex flex-col gap-6 items-center">
                  <div
                    className={`rounded-[24px] size-[75.6px] flex items-center justify-center ${
                      selectedType === "consumer"
                        ? "bg-gradient-to-b from-[#5570f1] to-[#4a6cf7] shadow-[0px_20px_25px_-5px_rgba(74,108,247,0.3),0px_8px_10px_-6px_rgba(74,108,247,0.3)]"
                        : "bg-[#e8efff]"
                    }`}
                  >
                    <svg
                      className="size-[37.8px]"
                      fill="none"
                      preserveAspectRatio="none"
                      viewBox="0 0 38 38"
                    >
                      <g>
                        <path
                          d={svgPathsConsumer.p27801a80}
                          stroke={
                            selectedType === "consumer"
                              ? "white"
                              : "#5570F1"
                          }
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3.15"
                        />
                        <path
                          d={svgPathsConsumer.p2f848200}
                          stroke={
                            selectedType === "consumer"
                              ? "white"
                              : "#5570F1"
                          }
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3.15"
                        />
                      </g>
                    </svg>
                  </div>
                  <p className="font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[14px] text-[#5570f1] text-[14px]">
                    소비자
                  </p>
                  <p className="font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[20px] text-[#8b9dc3] text-[14px]">
                    예약하고 즐기기
                  </p>
                </div>
              </button>

              {/* 매장 선택 */}
              <button
                onClick={() => handleTypeChange("restaurant")}
                className={`rounded-[16px] p-7 border-[1.6px] transition-all ${
                  selectedType === "restaurant"
                    ? "bg-gradient-to-b from-[#e8efff] to-[#ffffff] border-[#5570f1] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]"
                    : "bg-white border-[#d4e1ff] hover:border-[#5570f1]"
                }`}
              >
                <div className="flex flex-col gap-6 items-center">
                  <div
                    className={`rounded-[24px] size-[72px] flex items-center justify-center ${
                      selectedType === "restaurant"
                        ? "bg-gradient-to-b from-[#5570f1] to-[#4a6cf7] shadow-[0px_20px_25px_-5px_rgba(74,108,247,0.3),0px_8px_10px_-6px_rgba(74,108,247,0.3)]"
                        : "bg-[#e8efff]"
                    }`}
                  >
                    <svg
                      className="size-[36px]"
                      fill="none"
                      preserveAspectRatio="none"
                      viewBox="0 0 36 36"
                    >
                      <g>
                        <path
                          d={svgPathsConsumer.p38167800}
                          stroke={
                            selectedType === "restaurant"
                              ? "white"
                              : "#5570F1"
                          }
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                        />
                        <path
                          d={svgPathsConsumer.p4699f80}
                          stroke={
                            selectedType === "restaurant"
                              ? "white"
                              : "#5570F1"
                          }
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                        />
                        <path
                          d={svgPathsConsumer.p11625a00}
                          stroke={
                            selectedType === "restaurant"
                              ? "white"
                              : "#5570F1"
                          }
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                        />
                      </g>
                    </svg>
                  </div>
                  <p className="font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[14px] text-[#5570f1] text-[14px]">
                    매장
                  </p>
                  <p className="font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[20px] text-[#8b9dc3] text-[14px]">
                    예약 관리하기
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 소비자 회원가입 폼 */}
        {selectedType === "consumer" && (
          <div className="bg-[rgba(255,255,255,0.9)] rounded-[32px] w-full p-[40px] relative animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="absolute border-[#d4e1ff] border-[0.8px] border-solid inset-0 pointer-events-none rounded-[32px] shadow-[0px_25px_50px_-12px_rgba(74,108,247,0.1)]" />

            <form
              onSubmit={handleSubmit}
              className="relative flex flex-col gap-8"
            >
              {/* 헤더 */}
              <div className="flex flex-col items-center gap-6">
                <div className="bg-gradient-to-b from-[#5570f1] rounded-[24px] shadow-[0px_20px_25px_-5px_rgba(74,108,247,0.3),0px_8px_10px_-6px_rgba(74,108,247,0.3)] size-[72px] to-[#4a6cf7] flex items-center justify-center">
                  <svg
                    className="size-[36px]"
                    fill="none"
                    viewBox="0 0 36 36"
                  >
                    <g>
                      <path
                        d={svgPathsConsumer.p10a9e180}
                        stroke="white"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                      />
                      <path
                        d={svgPathsConsumer.p17df6a80}
                        stroke="white"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                      />
                    </g>
                  </svg>
                </div>
                <div className="flex flex-col gap-3 items-center">
                  <p className="font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[36px] text-[#4a6cf7] text-[30px]">
                    소비자 회원가입
                  </p>
                  <p className="font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[24px] text-[#8b9dc3] text-[16px]">
                    계정 정보를 입력해주세요
                  </p>
                </div>
              </div>

              {/* 폼 필드 */}
              <div className="flex flex-col gap-5">
                {/* 아이디 & 비밀번호 */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col gap-[10px]">
                    <label className="font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[20px] text-[#5570f1] text-[14px]">
                      아이디
                    </label>
                    <div className="bg-[rgba(255,255,255,0.9)] h-[56px] rounded-[16px] relative">
                      <div className="absolute border-[#d4e1ff] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
                      <input
                        type="text"
                        value={formData.userId}
                        onChange={(e) =>
                          handleInputChange(
                            "userId",
                            e.target.value,
                          )
                        }
                        placeholder="아이디 입력"
                        className="w-full h-full px-[20px] bg-transparent font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal text-[14px] outline-none placeholder:text-[#c3cfe5]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-[10px]">
                    <label className="font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[20px] text-[#5570f1] text-[14px]">
                      비밀번호
                    </label>
                    <div className="bg-[rgba(255,255,255,0.9)] h-[56px] rounded-[16px] relative">
                      <div className="absolute border-[#d4e1ff] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange(
                            "password",
                            e.target.value,
                          )
                        }
                        placeholder="비밀번호 생성 (8자 이상)"
                        className="w-full h-full px-[20px] bg-transparent font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal text-[14px] outline-none placeholder:text-[#c3cfe5]"
                      />
                    </div>
                  </div>
                </div>

                {/* 이메일 & 전화번호 */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col gap-[10px]">
                    <label className="font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[20px] text-[#5570f1] text-[14px]">
                      이메일
                    </label>
                    <div className="bg-[rgba(255,255,255,0.9)] h-[56px] rounded-[16px] relative">
                      <div className="absolute border-[#d4e1ff] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange(
                            "email",
                            e.target.value,
                          )
                        }
                        placeholder="이메일 입력"
                        className="w-full h-full px-[20px] bg-transparent font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal text-[14px] outline-none placeholder:text-[#c3cfe5]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-[10px]">
                    <label className="font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[20px] text-[#5570f1] text-[14px]">
                      전화번호
                    </label>
                    <div className="bg-[rgba(255,255,255,0.9)] h-[56px] rounded-[16px] relative">
                      <div className="absolute border-[#d4e1ff] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange(
                            "phone",
                            e.target.value,
                          )
                        }
                        placeholder="010-1234-5678"
                        className="w-full h-full px-[20px] bg-transparent font-['Arimo:Regular',sans-serif] font-normal text-[14px] outline-none placeholder:text-[#c3cfe5]"
                      />
                    </div>
                  </div>
                </div>

                {/* 이��� */}
                <div className="flex flex-col gap-[10px]">
                  <label className="font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[20px] text-[#5570f1] text-[14px]">
                    이름
                  </label>
                  <div className="bg-[rgba(255,255,255,0.9)] h-[56px] rounded-[16px] relative">
                    <div className="absolute border-[#d4e1ff] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange(
                          "name",
                          e.target.value,
                        )
                      }
                      placeholder="이름 입력"
                      className="w-full h-full px-[20px] bg-transparent font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal text-[14px] outline-none placeholder:text-[#c3cfe5]"
                    />
                  </div>
                </div>
              </div>

              {/* 구분선 */}
              <div className="flex gap-[12px] h-[32px] items-center">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4e1ff] to-transparent" />
                <svg
                  className="size-[16px]"
                  fill="none"
                  viewBox="0 0 16 16"
                >
                  <g clipPath="url(#clip0_6002_392)">
                    <path
                      d={svgPathsConsumer.pca5b500}
                      stroke="#4A6CF7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity="0.5"
                      strokeWidth="1.33333"
                    />
                    <path
                      d="M13.3333 1.33333V4"
                      stroke="#4A6CF7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity="0.5"
                      strokeWidth="1.33333"
                    />
                    <path
                      d="M14.6667 2.66667H12"
                      stroke="#4A6CF7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity="0.5"
                      strokeWidth="1.33333"
                    />
                    <path
                      d={svgPathsConsumer.p22966600}
                      stroke="#4A6CF7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity="0.5"
                      strokeWidth="1.33333"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_6002_392">
                      <rect
                        fill="white"
                        height="16"
                        width="16"
                      />
                    </clipPath>
                  </defs>
                </svg>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4e1ff] to-transparent" />
              </div>

              {/* 제출 버튼 */}
              <button
                type="submit"
                className="bg-gradient-to-b from-[#5570f1] h-[64px] rounded-[16px] shadow-[0px_10px_15px_-3px_rgba(74,108,247,0.3),0px_4px_6px_-4px_rgba(74,108,247,0.3)] to-[#4a6cf7] flex items-center justify-center"
              >
                <p className="font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[24px] text-[16px] text-white">
                  계정 만들기
                </p>
                <svg
                  className="size-[16px] ml-2"
                  fill="none"
                  viewBox="0 0 16 16"
                >
                  <g>
                    <path
                      d="M3.33333 8H12.6667"
                      stroke="white"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.33333"
                    />
                    <path
                      d={svgPathsConsumer.p1d405500}
                      stroke="white"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.33333"
                    />
                  </g>
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* 매장 회원가입 폼 */}
        {selectedType === "restaurant" && (
          <div className="bg-[rgba(255,255,255,0.9)] rounded-[32px] w-full p-[40px] relative animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="absolute border-[#d4e1ff] border-[0.8px] border-solid inset-0 pointer-events-none rounded-[32px] shadow-[0px_25px_50px_-12px_rgba(74,108,247,0.1)]" />

            <form
              onSubmit={handleSubmit}
              className="relative flex flex-col gap-8"
            >
              {/* 헤더 */}
              <div className="flex flex-col items-center gap-6">
                <div className="bg-gradient-to-b from-[#5570f1] rounded-[24px] shadow-[0px_20px_25px_-5px_rgba(74,108,247,0.3),0px_8px_10px_-6px_rgba(74,108,247,0.3)] size-[72px] to-[#4a6cf7] flex items-center justify-center">
                  <svg
                    className="size-[36px]"
                    fill="none"
                    viewBox="0 0 36 36"
                  >
                    <g>
                      <path
                        d={svgPathsRestaurant.p38167800}
                        stroke="white"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                      />
                      <path
                        d={svgPathsRestaurant.p4699f80}
                        stroke="white"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                      />
                      <path
                        d={svgPathsRestaurant.p11625a00}
                        stroke="white"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                      />
                    </g>
                  </svg>
                </div>
                <div className="flex flex-col gap-3 items-center">
                  <p className="font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[36px] text-[#4a6cf7] text-[30px]">
                    매장 회원가입
                  </p>
                  <p className="font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[24px] text-[#8b9dc3] text-[16px]">
                    매장 정보와 관리자 정보를 입력해주세요
                  </p>
                </div>
              </div>

              {/* 로고 업로드 */}
              <div className="flex flex-col gap-4 items-center py-6 border-b border-[#d4e1ff]">
                <div className="bg-gradient-to-b from-[#e8efff] rounded-[24px] size-[112px] to-[#ffffff] border-[1.6px] border-[#c3cfe5] flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="매장 로고 미리보기"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="size-[56px]"
                      fill="none"
                      viewBox="0 0 56 56"
                    >
                      <g>
                        <path
                          d={svgPathsRestaurant.p11c92100}
                          stroke="#C3CFE5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="4.66667"
                        />
                        <path
                          d={svgPathsRestaurant.p26ef800}
                          stroke="#C3CFE5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="4.66667"
                        />
                        <path
                          d={svgPathsRestaurant.p1f968000}
                          stroke="#C3CFE5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="4.66667"
                        />
                      </g>
                    </svg>
                  )}
                </div>
                <label
                  htmlFor="restaurant-image-upload"
                  className="bg-white h-[36px] rounded-[16px] px-4 border-[1.6px] border-[#d4e1ff] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex items-center gap-2 cursor-pointer hover:bg-[#f0f4ff] transition-colors"
                >
                  <svg
                    className="size-[16px]"
                    fill="none"
                    viewBox="0 0 16 16"
                  >
                    <g>
                      <path
                        d="M8 2V10"
                        stroke="#5570F1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.33333"
                      />
                      <path
                        d={svgPathsRestaurant.p26e09a00}
                        stroke="#5570F1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.33333"
                      />
                      <path
                        d={svgPathsRestaurant.p23ad1400}
                        stroke="#5570F1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.33333"
                      />
                    </g>
                  </svg>
                  <p className="font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[20px] text-[#5570f1] text-[14px]">
                    {imagePreview
                      ? "이미지 변경"
                      : "매장 로고 업로드"}
                  </p>
                </label>
                <input
                  id="restaurant-image-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {imagePreview && (
                  <p className="text-xs text-[#8b9dc3]">
                    이미지가 업로드되었습니다
                  </p>
                )}
              </div>

              {/* 기본 정보 */}
              <div className="flex flex-col gap-5">
                <p className="font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[24px] text-[#4a6cf7] text-[16px]">
                  기본 정보
                </p>

                {/* 아이디 & 비밀번호 */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col gap-[10px]">
                    <label className="font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[20px] text-[#5570f1] text-[14px]">
                      아이디
                    </label>
                    <div className="bg-[rgba(255,255,255,0.9)] h-[56px] rounded-[16px] relative">
                      <div className="absolute border-[#d4e1ff] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
                      <input
                        type="text"
                        value={formData.userId}
                        onChange={(e) =>
                          handleInputChange(
                            "userId",
                            e.target.value,
                          )
                        }
                        placeholder="아이디 입력"
                        className="w-full h-full px-[20px] bg-transparent font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal text-[14px] outline-none placeholder:text-[#c3cfe5]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-[10px]">
                    <label className="font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[20px] text-[#5570f1] text-[14px]">
                      비밀번호
                    </label>
                    <div className="bg-[rgba(255,255,255,0.9)] h-[56px] rounded-[16px] relative">
                      <div className="absolute border-[#d4e1ff] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange(
                            "password",
                            e.target.value,
                          )
                        }
                        placeholder="비밀번호 생성 (8자 이상)"
                        className="w-full h-full px-[20px] bg-transparent font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal text-[14px] outline-none placeholder:text-[#c3cfe5]"
                      />
                    </div>
                  </div>
                </div>

                {/* 매장명 & 관리자명 */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col gap-[10px]">
                    <label className="font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[20px] text-[#5570f1] text-[14px]">
                      매장명
                    </label>
                    <div className="bg-[rgba(255,255,255,0.9)] h-[56px] rounded-[16px] relative">
                      <div className="absolute border-[#d4e1ff] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
                      <input
                        type="text"
                        value={formData.restaurantName}
                        onChange={(e) =>
                          handleInputChange(
                            "restaurantName",
                            e.target.value,
                          )
                        }
                        placeholder="식당 이름 입력"
                        className="w-full h-full px-[20px] bg-transparent font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal text-[14px] outline-none placeholder:text-[#c3cfe5]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-[10px]">
                    <label className="font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[20px] text-[#5570f1] text-[14px]">
                      담당자명
                    </label>
                    <div className="bg-[rgba(255,255,255,0.9)] h-[56px] rounded-[16px] relative">
                      <div className="absolute border-[#d4e1ff] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
                      <input
                        type="text"
                        value={formData.managerName}
                        onChange={(e) =>
                          handleInputChange(
                            "managerName",
                            e.target.value,
                          )
                        }
                        placeholder="담당자 이름 입력"
                        className="w-full h-full px-[20px] bg-transparent font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal text-[14px] outline-none placeholder:text-[#c3cfe5]"
                      />
                    </div>
                  </div>
                </div>

                {/* 이메일 & 전화번호 */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col gap-[10px]">
                    <label className="font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[20px] text-[#5570f1] text-[14px]">
                      이메일
                    </label>
                    <div className="bg-[rgba(255,255,255,0.9)] h-[56px] rounded-[16px] relative">
                      <div className="absolute border-[#d4e1ff] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange(
                            "email",
                            e.target.value,
                          )
                        }
                        placeholder="이메일 입력"
                        className="w-full h-full px-[20px] bg-transparent font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal text-[14px] outline-none placeholder:text-[#c3cfe5]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-[10px]">
                    <label className="font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[20px] text-[#5570f1] text-[14px]">
                      매장 전화번호
                    </label>
                    <div className="bg-[rgba(255,255,255,0.9)] h-[56px] rounded-[16px] relative">
                      <div className="absolute border-[#d4e1ff] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange(
                            "phone",
                            e.target.value,
                          )
                        }
                        placeholder="010-1234-5678"
                        className="w-full h-full px-[20px] bg-transparent font-['Arimo:Regular',sans-serif] font-normal text-[14px] outline-none placeholder:text-[#c3cfe5]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 매장 상세 정보 */}
              <div className="flex flex-col gap-5 pt-4 border-t border-[#d4e1ff]">
                <p className="font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[24px] text-[#4a6cf7] text-[16px]">
                  매장 상세 정보
                </p>

                {/* 매장 주소 */}
                <div className="flex flex-col gap-[10px]">
                  <label className="font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[20px] text-[#5570f1] text-[14px]">
                    매장 주소
                  </label>
                  <div className="bg-[rgba(255,255,255,0.9)] h-[56px] rounded-[16px] relative">
                    <div className="absolute border-[#d4e1ff] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange(
                          "address",
                          e.target.value,
                        )
                      }
                      placeholder="인천 미추홀구 인하로 100"
                      className="w-full h-full px-[20px] bg-transparent font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal text-[14px] outline-none placeholder:text-[#c3cfe5]"
                    />
                  </div>
                </div>

                {/* 좌석 수 */}
                <div className="flex flex-col gap-[10px]">
                  <label className="font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[20px] text-[#5570f1] text-[14px]">
                    좌석 수
                  </label>
                  <div className="bg-[rgba(255,255,255,0.9)] h-[56px] rounded-[16px] relative">
                    <div className="absolute border-[#d4e1ff] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
                    <input
                      type="number"
                      step="5"
                      value={formData.seats}
                      onChange={(e) =>
                        handleInputChange(
                          "seats",
                          e.target.value,
                        )
                      }
                      onKeyDown={(e) => e.preventDefault()}
                      placeholder="20"
                      className="w-full h-full px-[20px] bg-transparent font-['Arimo:Regular',sans-serif] font-normal text-[14px] outline-none placeholder:text-[#c3cfe5]"
                    />
                  </div>
                  <p className="text-xs text-[#8b96a5]">
                    화살표로 5씩 조정 가능
                  </p>
                </div>
              </div>

              {/* 구분선 */}
              <div className="flex gap-[12px] h-[32px] items-center">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4e1ff] to-transparent" />
                <svg
                  className="size-[16px]"
                  fill="none"
                  viewBox="0 0 16 16"
                >
                  <g clipPath="url(#clip0_6002_392)">
                    <path
                      d={svgPathsRestaurant.pca5b500}
                      stroke="#4A6CF7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity="0.5"
                      strokeWidth="1.33333"
                    />
                    <path
                      d="M13.3333 1.33333V4"
                      stroke="#4A6CF7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity="0.5"
                      strokeWidth="1.33333"
                    />
                    <path
                      d="M14.6667 2.66667H12"
                      stroke="#4A6CF7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity="0.5"
                      strokeWidth="1.33333"
                    />
                    <path
                      d={svgPathsRestaurant.p22966600}
                      stroke="#4A6CF7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity="0.5"
                      strokeWidth="1.33333"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_6002_392">
                      <rect
                        fill="white"
                        height="16"
                        width="16"
                      />
                    </clipPath>
                  </defs>
                </svg>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4e1ff] to-transparent" />
              </div>

              {/* 제출 버튼 */}
              <button
                type="submit"
                className="bg-gradient-to-b from-[#5570f1] h-[64px] rounded-[16px] shadow-[0px_10px_15px_-3px_rgba(74,108,247,0.3),0px_4px_6px_-4px_rgba(74,108,247,0.3)] to-[#4a6cf7] flex items-center justify-center"
              >
                <p className="font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[24px] text-[16px] text-white">
                  계정 만들기
                </p>
                <svg
                  className="size-[16px] ml-2"
                  fill="none"
                  viewBox="0 0 16 16"
                >
                  <g>
                    <path
                      d="M3.33333 8H12.6667"
                      stroke="white"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.33333"
                    />
                    <path
                      d={svgPathsRestaurant.p1d405500}
                      stroke="white"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.33333"
                    />
                  </g>
                </svg>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}