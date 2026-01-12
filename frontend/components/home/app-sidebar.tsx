"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  FileText,
  FolderPlus,
  Grid3X3,
  Library,
  Plus,
  Search,
  Settings2,
  Smartphone,
} from "lucide-react";
import Image from "next/image";

function SidebarLogo() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  if (isCollapsed) {
    // 折叠状态：显示小 logo 居中，悬停时显示折叠按钮
    return (
      <div className="relative group/logo flex items-center justify-center w-full">
        <Image
          src="/logo.png"
          alt="Logo"
          width={40}
          height={40}
          className="group-hover/logo:opacity-0 transition-opacity"
        />
        <SidebarTrigger className="h-10 w-10 absolute opacity-0 group-hover/logo:opacity-100 transition-opacity" />
      </div>
    );
  }

  // 展开状态：显示 logo + 文字 + 折叠按钮
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <Image src="/logo.png" alt="Logo" width={40} height={40} />
        <span className="text-xl font-semibold text-foreground">toto</span>
      </div>
      <SidebarTrigger className="h-10 w-10" />
    </div>
  );
}

export function AppSidebar() {
  return (
    <Sidebar className="border-r-0 overflow-hidden" collapsible="icon">
      <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2">
        <SidebarLogo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="bg-sidebar-accent h-12 text-base"
                tooltip="新建任务"
              >
                <Plus className="h-5 w-5" />
                <span>新建任务</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="h-12 text-base" tooltip="搜索">
                <Search className="h-5 w-5" />
                <span>搜索</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="h-12 text-base" tooltip="库">
                <Library className="h-5 w-5" />
                <span>库</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between group-data-[collapsible=icon]:hidden text-base h-10">
            <span>项目</span>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="h-4 w-4" />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-12 text-base" tooltip="新项目">
                  <FolderPlus className="h-5 w-5" />
                  <span>新项目</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between group-data-[collapsible=icon]:hidden text-base h-10">
            <span>所有任务</span>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Settings2 className="h-4 w-4" />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex flex-col items-center justify-center py-12 text-center group-data-[collapsible=icon]:hidden">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30">
                <FileText className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-base text-muted-foreground">
                新建一个任务以开始
              </p>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[state=expanded]:flex-row group-data-[state=expanded]:justify-between">
          <div className="flex gap-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[state=expanded]:flex-row">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              title="设置"
            >
              <Settings2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              title="网格视图"
            >
              <Grid3X3 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              title="移动端"
            >
              <Smartphone className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
