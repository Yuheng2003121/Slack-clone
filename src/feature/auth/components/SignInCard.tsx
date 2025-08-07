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
import { useAuthActions } from "@convex-dev/auth/react";
import { TriangleAlert } from "lucide-react";

interface SignInCardProps {
  setState: (state: SignInFlow) => void;
}
export default function SignInCard({ setState }: SignInCardProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useAuthActions();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const handleProviderSignIn = async (value: "google" | "github") => {
    setPending(true);
    await signIn(value);
    setPending(false);
  };

  const onPasswordSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    try {
      await signIn("password", { email, password, flow: "signIn" });
    } catch {
      setError("Invalid Email or Password");
    } finally {
      setPending(false);
    }
  };

  return (
    <Card className="w-full p-8">
      <CardHeader className="px-0">
        <CardTitle className="text-lg">Login to continue</CardTitle>
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
        <form className="space-y-4" onSubmit={onPasswordSignIn}>
          <Input
            disabled={pending}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if(error) setError("");
            }}
            placeholder="Email"
            type="email"
            required={true}
          />
          <Input
            disabled={pending}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if(error) setError("");
            }}
            placeholder="password"
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
            onClick={() => handleProviderSignIn("google")}
            variant={"outline"}
            size={"lg"}
            className="w-full relative cursor-pointer"
          >
            <FcGoogle className="size-5 absolute left-5 top-1/2 transform -translate-1/2" />
            Continue with Google
          </Button>
          <Button
            disabled={pending}
            onClick={() => handleProviderSignIn("github")}
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
            Dont&apos;t have an account?
          </span>
          <span
            className="hover:underline cursor-pointer text-sky-700"
            onClick={() => setState("signUp")}
          >
            Sign Up
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
