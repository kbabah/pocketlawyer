"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminSetupPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    try {
      setIsLoading(true);
      setResult(null);
      
      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to set up admin user");
      }
      
      setResult({
        success: true,
        message: data.message,
      });
      
      toast.success("Admin privileges granted successfully");
    } catch (error: any) {
      console.error("Failed to set up admin:", error);
      setResult({
        success: false,
        error: error.message,
      });
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <div className="w-full max-w-md">
        <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Admin Setup Tool</AlertTitle>
          <AlertDescription>
            This page is for development purposes. Use it to grant admin privileges to your account.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Admin Setup</CardTitle>
            <CardDescription>
              Grant admin privileges to a registered user
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="email">User Email</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter the email of the user to make admin"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              
              {result && (
                <div className={`mt-4 p-3 rounded-md ${
                  result.success ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"
                }`}>
                  {result.success ? result.message : result.error}
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-between">
              <div className="text-sm text-muted-foreground">
                {process.env.NODE_ENV === "production" && "This tool is only available in development mode"}
              </div>
              <Button type="submit" disabled={isLoading || !email || process.env.NODE_ENV === "production"}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Grant Admin Access"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}