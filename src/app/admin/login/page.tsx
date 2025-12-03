import { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin Giriş | Kolay Seyahat",
  description: "Admin panel giriş sayfası",
};

export default function AdminLoginPage() {
  return <LoginForm />;
}
