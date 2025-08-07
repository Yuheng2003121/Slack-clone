import React, { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { SignInFlow } from "../types";
import { TriangleAlert } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { ConvexError } from "convex/values";

interface SignUpCardProps {
  setState: (state: SignInFlow) => void;
}
export default function SignUpCard({ setState }: SignUpCardProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const { signIn } = useAuthActions();

  const handleProviderSignUp = async (value: "google" | "github") => {
    setPending(true);
    await signIn(value);
    setPending(false);
  };
  const onProviderSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    try {
      await signIn("password", { email, password, flow: "signup" });
    } catch {
      setError("Invalid Email or Password");
    }
    setPending(false);
  };

  const onPasswordSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setPending(true);
    try {
      await signIn("password", { name, email, password, flow: "signUp" });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message; // 获取完整错误消息
        const convexErrorMsg = errorMessage.split("Uncaught ConvexError: ")[1] || errorMessage;
        setError(convexErrorMsg);
      }
      else {
        setError("Something went wrong");
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <Card className="w-full p-8">
      <CardHeader className="px-0">
        <CardTitle className="text-lg">Sign up to continue</CardTitle>
        <CardDescription className="mt-1">
          Use your Email or service to continue
        </CardDescription>
      </CardHeader>
      {error && (
        <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-2 text-sm text-destructive ">
          <TriangleAlert className="size-4" />
          {error}
        </div>
      )}
      <CardContent className="flex flex-col gap-4 px-0 pb-0">
        <form className="space-y-4" onSubmit={onPasswordSignUp}>
          <Input
            disabled={pending}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            required={true}
          />
          <Input
            disabled={pending}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required={true}
          />
          <Input
            disabled={pending}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            type="password"
            required={true}
          />
          <Input
            disabled={pending}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            type="password"
            required={true}
          />
          <Button
            type="submit"
            className="w-full mt-2"
            size={"lg"}
            disabled={pending}
          >
            Continue
          </Button>
        </form>
        <Separator />
        <div className="flex flex-col gap-3">
          <Button
            disabled={pending}
            onClick={() => handleProviderSignUp("google")}
            variant={"outline"}
            size={"lg"}
            className="w-full relative cursor-pointer"
          >
            <FcGoogle className="size-5 absolute left-5 top-1/2 transform -translate-1/2" />
            Continue with Google
          </Button>
          <Button
            disabled={pending}
            onClick={() => handleProviderSignUp("github")}
            variant={"outline"}
            size={"lg"}
            className="w-full relative cursor-pointer"
          >
            <FaGithub className="size-5 absolute left-5 top-1/2 transform -translate-1/2" />
            Continue with Github
          </Button>
        </div>
        <p className="text-xs text-muted-foreground flex gap-1">
          <span className="hover:underline cursor-pointer">
            Already have an account?
          </span>
          <span
            className="hover:underline cursor-pointer text-sky-700"
            onClick={() => setState("signIn")}
          >
            Sign In
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
