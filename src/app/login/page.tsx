"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ShoppingBasket } from "lucide-react";
import { useAdminAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { setUser, setToken } = useAdminAuthStore();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || "Failed to login");
      }

      // Check if user is actually admin
      if (!responseData.user.isAdmin) {
        throw new Error("Unauthorized: Admin access required.");
      }

      // Valid admin -> Save session & redirect
      setUser(responseData.user);
      setToken(responseData.token);
      toast.success("Welcome Admin!");
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      toast.error(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="flex bg-white items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 rounded-lg border shadow-sm">
        <div className="flex flex-col items-center">
          <div className="p-3 bg-blue-100 rounded-full mb-4">
            <ShoppingBasket className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-center">Admin Login</h2>
          <p className="text-sm text-gray-500 mt-2">Sign in to access the control panel</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4 text-center">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
