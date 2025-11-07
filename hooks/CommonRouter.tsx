import { useRouter } from "next/navigation";

const CommonRouter = () => {
  const router = useRouter();

  // 공통 라우팅 핸들러
  const handleRoute = (type: string) => {
    switch (type) {
      case "schedule":
        router.push("/schedules");
        break;

      case "admin":
        router.push("/settings");
        break;

      case "dashboard":
        router.push("/dashboard");
        break;

      case "data":
        router.push("/data-management");
        break;

      case "robot":
        router.push("/robots");
        break;

      case "setting":
        router.push("/settings");
        break;

      default:
        router.push("/");
        break;
    }
  };

  return { handleRoute };
};

export default CommonRouter;