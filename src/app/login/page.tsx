import LoginForm from "./LoginForm";

export const metadata = { title: "Login | Tvarise" };

export default function LoginPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <LoginForm />
    </main>
  );
}
