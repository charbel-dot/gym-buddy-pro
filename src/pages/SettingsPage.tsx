import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings as SettingsIcon, Shield, Key } from "lucide-react";

export default function SettingsPage() {
  const { updateCredentials } = useAuth();
  
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Passwords do not match", {
        description: "Please check your typed passwords and try again.",
      });
      return;
    }

    // Only update fields that are provided
    updateCredentials(
      newUsername.trim() || undefined,
      newPassword || undefined
    );

    toast.success("Settings Updated", {
      description: "Admin credentials have been updated successfully.",
    });

    setNewUsername("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto w-full transition-all duration-200 ease-linear">
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6" /> Settings
        </h1>
        <p className="text-sm text-muted-foreground">Manage your gym system configurations and security.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-primary" /> Security & Credentials
            </CardTitle>
            <CardDescription>
              Update your administrator login details to keep your system secure. Leave blank any field you don't wish to change.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="username">New Admin Username</Label>
                <Input 
                  id="username" 
                  placeholder="Enter new username..." 
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              
              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter new password..." 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    placeholder="Confirm new password..." 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full mt-4">Save Changes</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
