import React, { useState } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText, BarChart3, Briefcase, Layers,
  Route,
  Award, BookMarked, ChevronLeft, ChevronRight,
  Zap, LogOut, User, GraduationCap, ShieldCheck,
  Wand2, Building2, Star, Network, ClipboardList, LayoutList, DollarSign, Brain, Activity,
  Database, FlaskConical,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ── Navigation groups ─────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: 'Resume',
    items: [
      { name: 'Resume Analyzer',  href: '/resume',               icon: FileText,    },
      { name: 'Resume Score',     href: '/score',                icon: Award,       },
      { name: 'Resume Insights',  href: '/analytics',            icon: BarChart3,   },
      { name: 'ATS Checker',      href: '/ats',                  icon: ShieldCheck, },
      { name: 'Resume Builder',   href: '/builder',              icon: FileText,    },
      { name: 'Auto Improver',    href: '/improver',             icon: Wand2,       },
    ],
  },
  {
    label: 'Matching',
    items: [
      { name: 'Job Tracker',         href: '/job-tracker',  icon: LayoutList, },
      { name: 'Job Matching',        href: '/job-matching', icon: Briefcase,  },
      { name: 'Job Recommendations', href: '/job-matches',  icon: Star,       },
      { name: 'Skill Gap',           href: '/skill-gap',    icon: Layers,     },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { name: 'Employer Dashboard',   href: '/employer',            icon: Building2,  },
      { name: 'Salary Insights',      href: '/salary-insights',     icon: DollarSign, },
      { name: 'Advanced Analytics',   href: '/advanced-analytics',  icon: Activity,   },
      { name: 'ML Training',          href: '/ml-training',         icon: Brain,      },
      { name: 'DBMS Analytics',       href: '/dbms-analytics',      icon: Database,   },
      { name: 'Prod Analytics',       href: '/production-analytics',icon: FlaskConical,},
    ],
  },
  {
    label: 'Learning',
    items: [
      { name: 'Courses',        href: '/courses',     icon: GraduationCap, },
      { name: 'Assessments',    href: '/assessments', icon: ClipboardList, },
      { name: 'Career Roadmap', href: '/roadmap',     icon: Route,         },
      { name: 'Networking',     href: '/networking',  icon: Network,       },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Project Summary', href: '/summary', icon: BookMarked, },
    ],
  },
]

// ── Component ─────────────────────────────────────────────────

export function Sidebar() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { user, profile, signOut, userRole, isEmployer } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  // Employer sees Analytics first, then limited resume tools
  const EMPLOYER_NAV_GROUPS = [
    {
      label: 'Analytics',
      items: [
        { name: 'Employer Dashboard', href: '/employer',        icon: Building2,  },
        { name: 'Salary Insights',    href: '/salary-insights', icon: DollarSign, },
      ],
    },
    {
      label: 'Recruitment',
      items: [
        { name: 'Job Matching', href: '/job-matching', icon: Briefcase, },
        { name: 'Skill Gap',    href: '/skill-gap',    icon: Layers,    },
      ],
    },
    {
      label: 'System',
      items: [
        { name: 'Project Summary', href: '/summary', icon: BookMarked, },
      ],
    },
  ]

  const activeGroups = isEmployer ? EMPLOYER_NAV_GROUPS : NAV_GROUPS

  const handleSignOut = async () => {
    try { await signOut() } catch { /* ignore */ }
  }

  const getUserInitials = () => {
    if (profile?.full_name) return profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    if (user?.email) return user.email[0].toUpperCase()
    return 'G'
  }

  const sidebarWidth = collapsed ? 64 : 240

  return (
    <motion.aside
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen shrink-0 overflow-hidden"
      style={{
        background: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center h-14 px-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div
          className="flex items-center gap-2.5 cursor-pointer min-w-0"
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <Zap className="h-4 w-4 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="font-display font-bold text-sm text-sidebar-foreground leading-tight whitespace-nowrap">Next Step</p>
                <p className="text-xs whitespace-nowrap text-sidebar-foreground/60">Career AI</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 rounded-md transition-colors text-sidebar-foreground/60 hover:text-sidebar-foreground"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <ChevronRight className="h-4 w-4" />
            : <ChevronLeft className="h-4 w-4" />
          }
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin px-2">
        {activeGroups.map((group, gi) => (
          <div key={group.label} className={gi > 0 ? 'mt-1' : ''}>
            {/* Group label */}
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider"
                >
                  {group.label}
                </motion.div>
              )}
            </AnimatePresence>
            {collapsed && gi > 0 && <div className="mx-1 my-2 h-px bg-sidebar-border" />}

            {/* Items */}
            {group.items.map(item => {
              const isActive = location.pathname === item.href
              return (
                <NavLink key={item.href} to={item.href} aria-label={item.name}>
                  <motion.div
                    whileHover={{ translateX: 4 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                      isActive 
                        ? 'text-white font-medium' 
                        : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                    )}
                    style={isActive ? {
                      background: 'rgba(255,255,255,0.07)',
                    } : undefined}
                    title={collapsed ? item.name : undefined}
                  >
                    <item.icon
                      className={cn(
                        'h-4 w-4 shrink-0',
                        isActive ? 'text-white' : 'text-white/40'
                      )}
                      aria-hidden="true"
                    />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden whitespace-nowrap text-sm"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {isActive && !collapsed && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full shrink-0 bg-primary-foreground"
                      />
                    )}
                  </motion.div>
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      {/* ── User Profile ── */}
      <div className="shrink-0 p-2 border-t border-sidebar-border">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="w-full flex items-center gap-2.5 p-2 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent"
                aria-label="User menu"
              >
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
                  <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex-1 text-left overflow-hidden"
                    >
                      <p className="text-xs font-semibold truncate text-sidebar-foreground">
                        {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs truncate text-sidebar-foreground/60">
                        {profile?.job_title || 'Professional'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" /> Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button
            onClick={() => navigate('/auth')}
            className="w-full flex items-center gap-2.5 p-2 rounded-lg transition-colors text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label="Login"
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-sidebar-accent">
              <User className="h-3.5 w-3.5 text-sidebar-foreground/60" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs font-medium whitespace-nowrap text-sidebar-foreground/60">
                    Login (Optional)
                  </p>
                  <p className="text-xs whitespace-nowrap text-sidebar-foreground/35">
                    Demo Mode Active
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        )}
      </div>
    </motion.aside>
  )
}
