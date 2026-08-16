"use client";

import { useActionState, useEffect, useState } from "react";
import { signIn } from "@/features/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, LockKeyhole, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

// Using a wrapper around signIn to adapt it for useActionState
const signInAction = async (prevState: any, formData: FormData) => {
  return await signIn(formData);
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signInAction, null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4 relative z-0 overflow-hidden">
      {/* Decorative blurred circle in the background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gray-50/80 rounded-full blur-[100px] -z-10" />

      <Card className="w-full max-w-md bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 rounded-[32px] overflow-hidden">
        <CardHeader className="space-y-3 pt-12 pb-8 px-10 text-center">
          <div className="mx-auto rounded-[100px] flex items-center justify-center mb-4">
            <Image
              src="/jyLogo.png"
              alt="Lock"
              width={80}
              height={80}
            />
          </div>
          <CardTitle className="text-3xl font-bold font-heading tracking-tight text-gray-900">
            Welcome back
          </CardTitle>
          <CardDescription className="text-gray-500 font-medium text-sm">
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>

        <form action={formAction}>
          <CardContent className="space-y-6 px-10">
            {state?.error && (
              <Alert variant="destructive" className="bg-red-50/50 text-red-600 border border-red-100 rounded-2xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium text-xs ml-2">{state.error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Email Address</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  className="pl-11 h-14 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Password</Label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockKeyhole className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="pl-11 h-14 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium tracking-widest placeholder:text-gray-400 placeholder:font-normal placeholder:tracking-normal"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="px-10 pb-12 pt-6">
            <Button
              className="w-full h-14 bg-gray-900 hover:bg-black text-white font-semibold text-base rounded-2xl shadow-[0_8px_20px_-8px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : "Sign in"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
