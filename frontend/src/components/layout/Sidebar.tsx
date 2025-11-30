"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import classNames from "classnames";
import {
  House,
  Article,
  Images,
  Plus,
  Star,
  Folder,
  Gear,
  X,
} from "@phosphor-icons/react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const mainLinks = [
    { href: "/dashboard", label: "Dashboard", icon: House },
    { href: "/generate", label: "Generate", icon: Plus },
    { href: "/prompts", label: "My Prompts", icon: Article },
    { href: "/gallery", label: "Gallery", icon: Images },
  ];

  const secondaryLinks = [
    { href: "/prompts?isFavorite=true", label: "Favorites", icon: Star },
    { href: "/prompts?status=archived", label: "Archived", icon: Folder },
  ];

  const isActive = (href: string) => {
    if (href.includes("?")) {
      return pathname + window.location.search === href;
    }
    return pathname === href;
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={classNames(
          "fixed top-16 left-0 bottom-0 w-64 bg-surface-900/50 backdrop-blur-xl border-r border-surface-800 z-40 transform transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Close button for mobile */}
          <div className="lg:hidden flex justify-end p-4">
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-800 transition-colors"
            >
              <X className="w-5 h-5" weight="bold" />
            </button>
          </div>

          {/* Main navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            <div className="mb-4">
              <p className="px-3 text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
                Main
              </p>
              {mainLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={classNames(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-primary-500/10 text-primary-400 shadow-sm"
                        : "text-surface-400 hover:text-surface-100 hover:bg-surface-800"
                    )}
                  >
                    <Icon
                      className="w-5 h-5"
                      weight={active ? "fill" : "regular"}
                    />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div>
              <p className="px-3 text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
                Collections
              </p>
              {secondaryLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={classNames(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-primary-500/10 text-primary-400"
                        : "text-surface-400 hover:text-surface-100 hover:bg-surface-800"
                    )}
                  >
                    <Icon
                      className="w-5 h-5"
                      weight={active ? "fill" : "regular"}
                    />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom section */}
          <div className="p-3 border-t border-surface-800">
            <Link
              href="/settings"
              onClick={onClose}
              className={classNames(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                pathname === "/settings"
                  ? "bg-primary-500/10 text-primary-400"
                  : "text-surface-400 hover:text-surface-100 hover:bg-surface-800"
              )}
            >
              <Gear className="w-5 h-5" />
              Settings
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
