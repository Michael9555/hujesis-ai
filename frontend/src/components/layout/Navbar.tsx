'use client';

import React, { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import classNames from 'classnames';
import {
  Sparkle,
  User,
  SignOut,
  Gear,
  CaretDown,
  List,
  House,
  Article,
  Images,
  Plus,
} from '@phosphor-icons/react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

interface NavbarProps {
  onMenuClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: House },
    { href: '/prompts', label: 'Prompts', icon: Article },
    { href: '/gallery', label: 'Gallery', icon: Images },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-800 transition-colors"
            >
              <List className="w-6 h-6" weight="bold" />
            </button>
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow">
                <Sparkle className="w-6 h-6 text-white" weight="fill" />
              </div>
              <span className="font-display font-bold text-xl text-surface-100 hidden sm:block">
                Hujesis<span className="text-primary-400">AI</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={classNames(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive(link.href)
                        ? 'bg-primary-500/10 text-primary-400'
                        : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800'
                    )}
                  >
                    <Icon className="w-5 h-5" weight={isActive(link.href) ? 'fill' : 'regular'} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/generate">
                  <Button size="sm" leftIcon={<Plus className="w-4 h-4" weight="bold" />}>
                    <span className="hidden sm:inline">Generate</span>
                  </Button>
                </Link>

                <Menu as="div" className="relative">
                  <MenuButton className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-800 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <CaretDown className="w-4 h-4 text-surface-400 hidden sm:block" weight="bold" />
                  </MenuButton>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-surface-800 border border-surface-700 shadow-xl focus:outline-none py-1">
                      <div className="px-4 py-3 border-b border-surface-700">
                        <p className="text-sm font-medium text-surface-100">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-surface-400 truncate">
                          {user?.email}
                        </p>
                      </div>

                      <MenuItem>
                        {({ active }) => (
                          <Link
                            href="/settings"
                            className={classNames(
                              'flex items-center gap-2 px-4 py-2.5 text-sm transition-colors',
                              active ? 'bg-surface-700 text-surface-100' : 'text-surface-300'
                            )}
                          >
                            <Gear className="w-5 h-5" />
                            Settings
                          </Link>
                        )}
                      </MenuItem>

                      <MenuItem>
                        {({ active }) => (
                          <Link
                            href="/profile"
                            className={classNames(
                              'flex items-center gap-2 px-4 py-2.5 text-sm transition-colors',
                              active ? 'bg-surface-700 text-surface-100' : 'text-surface-300'
                            )}
                          >
                            <User className="w-5 h-5" />
                            Profile
                          </Link>
                        )}
                      </MenuItem>

                      <div className="border-t border-surface-700 mt-1 pt-1">
                        <MenuItem>
                          {({ active }) => (
                            <button
                              onClick={logout}
                              className={classNames(
                                'flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-colors',
                                active ? 'bg-danger-500/10 text-danger-400' : 'text-surface-300'
                              )}
                            >
                              <SignOut className="w-5 h-5" />
                              Sign out
                            </button>
                          )}
                        </MenuItem>
                      </div>
                    </MenuItems>
                  </Transition>
                </Menu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


