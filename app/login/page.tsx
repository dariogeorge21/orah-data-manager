"use client";

import { useActionState, useEffect, useState } from "react";
import { signIn } from "@/features/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4">
      <Card className="w-full max-w-sm shadow-xl shadow-gray-200/50 border-gray-100">
        <CardHeader className="space-y-1 pb-6 text-center">
          <CardTitle className="text-2xl font-bold font-heading tracking-tight text-gray-900">
            Admin Dashboard
          </CardTitle>
          <CardDescription className="text-gray-500">
            Enter your email and password to log in
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            {state?.error && (
              <Alert variant="destructive" className="bg-red-50 text-red-600 border-red-200 text-sm">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
                className="bg-white border-gray-200 focus:border-gray-400 focus:ring-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-white border-gray-200 focus:border-gray-400 focus:ring-gray-400"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium"
              type="submit"
              disabled={isPending}
            >
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
