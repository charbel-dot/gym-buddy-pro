import { Dumbbell, Users, BarChart3, CreditCard, LogOut, Heart, Wallet, Store, Settings, Bell } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Members", url: "/members", icon: Users },
  { title: "Plans", url: "/plans", icon: CreditCard },
  { title: "Renewals", url: "/renewals", icon: Bell },
  { title: "Store (POS)", url: "/pos", icon: Store },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

export function AppSidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent cursor-default pointer-events-none">
              <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-primary overflow-hidden border border-border shrink-0">
                <img src="/logo.jpg" alt="MY GYM Logo" className="w-full h-full object-cover" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight ml-1">
                <span className="truncate font-bold text-base tracking-tight">MY GYM</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground uppercase text-[10px] tracking-widest">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} className="h-11 sm:h-9">
                    <NavLink
                      to={item.url}
                      end
                      className="transition-colors duration-150"
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/settings")} className="h-11 sm:h-9">
              <NavLink
                to="/settings"
                className="transition-colors duration-150"
                activeClassName="bg-accent text-accent-foreground font-medium"
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span>Settings</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={logout}
              className="text-muted-foreground hover:text-destructive active:scale-[0.97] h-11 sm:h-9"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="mt-4 text-center text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          Developed with <Heart className="w-3 h-3 inline text-red-500 fill-red-500 mx-0.5 relative -top-[1px]" /> by{" "}
          <a href="https://www.instagram.com/charbel.nasseh" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors font-medium">
            Charbel
          </a>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
