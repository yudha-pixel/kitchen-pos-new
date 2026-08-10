'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  LayoutGrid,
  Search,
  CheckCircle2,
  ArrowUpCircle,
  AlertCircle,
  Filter,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  Home,
  Layers,
  Users,
  FileText,
  Activity,
  Settings as SettingsIcon,
  ShoppingCart,
  Monitor,
  Box,
  HeartHandshake,
  Clock,
  Wallet,
  BarChart3,
  ShoppingBag,
  AlertTriangle,
  RotateCcw,
  X,
  ExternalLink,
  Check,
  MoreVertical,
  LogOut,
} from 'lucide-react';

import {
  INTERNAL_MODULES,
  InternalModule,
  getModuleDependents,
} from '@/src/features/modules/module-manager';
import { OutletSelector } from '@/src/components/outlet/OutletSelector';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';

const ADMIN_NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: Home, active: false },
  { id: 'modules', label: 'Internal Modules', icon: Layers, active: true },
  { id: 'roles', label: 'Roles & Permissions', icon: Users, active: false },
  { id: 'audit', label: 'Audit Logs', icon: FileText, active: false },
  { id: 'health', label: 'System Health', icon: Activity, active: false },
  { id: 'config', label: 'Configuration', icon: SettingsIcon, active: false },
];

const MODULE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pos_core: ShoppingCart,
  kds_core: Monitor,
  inventory_core: Box,
  crm_core: HeartHandshake,
  attendance_core: Clock,
  finance_core: Wallet,
  reporting_core: BarChart3,
  purchase_core: ShoppingBag,
};

export default function InternalModuleManagerPage() {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [modules, setModules] = useState<InternalModule[]>(INTERNAL_MODULES);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('kds_core');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailTab, setDetailTab] = useState<'overview' | 'routes' | 'permissions' | 'settings' | 'migrations' | 'health'>('overview');

  // Modal State
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [targetDisableModule, setTargetDisableModule] = useState<InternalModule | null>(null);
  const [rollbackConfirmed, setRollbackConfirmed] = useState(false);

  const selectedModule = useMemo(
    () => modules.find((m) => m.id === selectedModuleId) || modules[0],
    [modules, selectedModuleId]
  );

  const filteredModules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return modules;
    return modules.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.technicalName.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
    );
  }, [modules, searchQuery]);

  const enabledCount = useMemo(() => modules.filter((m) => m.enabled).length, [modules]);
  const updatesCount = useMemo(() => modules.filter((m) => m.health === 'update_available').length, [modules]);
  const issuesCount = useMemo(() => modules.filter((m) => m.health === 'issue_detected').length, [modules]);

  const handlePromptDisable = (mod: InternalModule) => {
    setTargetDisableModule(mod);
    setRollbackConfirmed(false);
    setDisableModalOpen(true);
  };

  const handleConfirmDisable = () => {
    if (!targetDisableModule) return;
    if (!rollbackConfirmed) {
      toast('error', 'Silakan konfirmasi bahwa Anda memahami proses rollback diperlukan.');
      return;
    }

    setModules((prev) =>
      prev.map((m) => (m.id === targetDisableModule.id ? { ...m, enabled: false } : m))
    );
    setDisableModalOpen(false);
    toast('info', `Modul ${targetDisableModule.name} (${targetDisableModule.technicalName}) telah dinonaktifkan.`);
  };

  const handleToggleEnable = (mod: InternalModule) => {
    if (mod.enabled) {
      handlePromptDisable(mod);
    } else {
      setModules((prev) =>
        prev.map((m) => (m.id === mod.id ? { ...m, enabled: true } : m))
      );
      toast('success', `Modul ${mod.name} diaktifkan kembali.`);
    }
  };

  const targetDependents = useMemo(() => {
    if (!targetDisableModule) return [];
    return getModuleDependents(targetDisableModule.technicalName);
  }, [targetDisableModule]);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Top Header Bar */}
      <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 py-2 shadow-xs shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white shadow-xs">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">Kitchen POS ERP</span>
        </div>

        <div className="flex items-center gap-4">
          <OutletSelector />
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-700 text-xs font-bold text-white uppercase">
              {user?.username?.charAt(0) || 'A'}
            </div>
            <span className="text-xs font-semibold text-slate-800 hidden sm:block">{user?.username || 'admin'}</span>
          </div>
        </div>
      </header>

      {/* Main Body Area: System Admin Sub-Rail + Central Workspace + Right Detail Panel */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        {/* Left Sub-Navigation Rail */}
        <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0">
          <div className="p-3">
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              SYSTEM ADMINISTRATION
            </span>
            <nav className="mt-2 space-y-1">
              {ADMIN_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors cursor-pointer ${
                      item.active
                        ? 'bg-violet-50 text-violet-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${item.active ? 'text-violet-600' : 'text-slate-400'}`} />
                    <span className="text-xs">{item.label}</span>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-100 text-xs text-slate-400">
            <span className="font-semibold text-slate-700 block">Nusantara Resto</span>
            <span className="text-[10px]">v3.18.0</span>
          </div>
        </aside>

        {/* Central Workspace: Modules List & Table */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 bg-slate-50/70">
          {/* Header Title & Badge */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Internal Modules</h1>
              <span className="flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Trusted only</span>
              </span>
            </div>
          </div>

          {/* 3 KPI Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Enabled</span>
                <span className="text-2xl font-bold text-slate-900">{enabledCount}</span>
                <span className="text-xs text-slate-400 block">of {modules.length} modules</span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Updates</span>
                <span className="text-2xl font-bold text-slate-900">{updatesCount}</span>
                <span className="text-xs text-slate-400 block">modules available</span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <ArrowUpCircle className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Health issues</span>
                <span className="text-2xl font-bold text-slate-900">{issuesCount}</span>
                <span className="text-xs text-slate-400 block">requires attention</span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:outline-hidden"
              />
            </div>
            <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
            </button>
            <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700">
              <option>All Status</option>
              <option>Enabled</option>
              <option>Disabled</option>
            </select>
            <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700">
              <option>All Health</option>
              <option>Healthy</option>
              <option>Update available</option>
              <option>Issue detected</option>
            </select>
          </div>

          {/* Modules Data Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden flex-1">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Compatibility</th>
                  <th className="py-3 px-4">Dependencies</th>
                  <th className="py-3 px-4">Health</th>
                  <th className="py-3 px-4 text-right">Status</th>
                  <th className="py-3 px-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredModules.map((mod) => {
                  const Icon = MODULE_ICONS[mod.technicalName] || Box;
                  const isSelected = mod.id === selectedModuleId;
                  return (
                    <tr
                      key={mod.id}
                      onClick={() => setSelectedModuleId(mod.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-violet-50/70 font-medium' : 'hover:bg-slate-50/60'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                            isSelected ? 'bg-violet-600 text-white' : 'bg-violet-50 text-violet-600'
                          }`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="block font-semibold text-slate-900 text-xs">{mod.name}</span>
                            <span className="block text-[10px] text-slate-400 font-mono">{mod.technicalName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{mod.version}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{mod.compatibility}</td>
                      <td className="py-3.5 px-4 text-slate-600">{mod.dependencies.length} modules</td>
                      <td className="py-3.5 px-4">
                        {mod.health === 'healthy' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                            Healthy
                          </span>
                        )}
                        {mod.health === 'update_available' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-700 font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
                            Update available
                          </span>
                        )}
                        {mod.health === 'issue_detected' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-red-700 font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block" />
                            Issue detected
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleEnable(mod);
                          }}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                            mod.enabled ? 'bg-violet-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                              mod.enabled ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="py-3.5 px-2 text-slate-300">
                        <ChevronRight className="h-4 w-4" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Showing 1 to {filteredModules.length} of {modules.length} modules
          </span>
        </main>

        {/* Right Detail Panel (Matching Wireframe 04) */}
        <aside className="w-96 border-l border-slate-200 bg-white p-6 overflow-y-auto flex flex-col justify-between shrink-0">
          {selectedModule ? (
            <div className="space-y-6">
              {/* Module Header Details */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-white shadow-xs">
                    {(() => {
                      const Icon = MODULE_ICONS[selectedModule.technicalName] || Box;
                      return <Icon className="h-6 w-6" />;
                    })()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">{selectedModule.name}</h2>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 uppercase">
                        {selectedModule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono block">Technical name: {selectedModule.technicalName}</span>
                    <span className="text-[11px] text-slate-400 block">
                      Version: {selectedModule.version} &bull; Installed on: {selectedModule.installedOn}
                    </span>
                  </div>
                </div>
                {selectedModule.enabled && (
                  <button
                    onClick={() => handlePromptDisable(selectedModule)}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Disable module
                  </button>
                )}
              </div>

              {/* Sub-Tabs */}
              <div className="border-b border-slate-100 flex gap-4 text-xs font-medium text-slate-500 overflow-x-auto">
                <button
                  onClick={() => setDetailTab('overview')}
                  className={`pb-2 transition-colors border-b-2 ${
                    detailTab === 'overview' ? 'border-violet-600 text-violet-700 font-bold' : 'border-transparent hover:text-slate-800'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setDetailTab('permissions')}
                  className={`pb-2 transition-colors border-b-2 ${
                    detailTab === 'permissions' ? 'border-violet-600 text-violet-700 font-bold' : 'border-transparent hover:text-slate-800'
                  }`}
                >
                  Permissions
                </button>
                <button
                  onClick={() => setDetailTab('settings')}
                  className={`pb-2 transition-colors border-b-2 ${
                    detailTab === 'settings' ? 'border-violet-600 text-violet-700 font-bold' : 'border-transparent hover:text-slate-800'
                  }`}
                >
                  Settings
                </button>
                <button
                  onClick={() => setDetailTab('health')}
                  className={`pb-2 transition-colors border-b-2 ${
                    detailTab === 'health' ? 'border-violet-600 text-violet-700 font-bold' : 'border-transparent hover:text-slate-800'
                  }`}
                >
                  Health
                </button>
              </div>

              {/* Detail Content */}
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Description</span>
                  <p className="mt-1 text-slate-700 leading-relaxed">{selectedModule.description}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Compatibility</span>
                  <span className="font-mono text-slate-800">{selectedModule.compatibility}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Dependencies</span>
                  <div className="mt-1 space-y-1">
                    {selectedModule.dependencies.map((d) => (
                      <span key={d.name} className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-700 mr-1.5">
                        {d.name} ({d.constraint})
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Permissions / Capabilities</span>
                  <div className="mt-1 space-y-1">
                    <span className="font-mono text-slate-700">{selectedModule.permissions.join(', ')}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Settings scope</span>
                  <span className="text-slate-800 font-semibold">{selectedModule.settingsScope}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Migrations</span>
                  <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 uppercase mt-1">
                    {selectedModule.migrationsStatus === 'up_to_date' ? 'Up to date' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Failure Isolation Info Card (Matching Wireframe 04) */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                <span className="font-bold text-slate-900 block">Failure isolation</span>
                <p className="text-[11px] text-slate-500">This module runs in an isolated context.</p>
                <div className="space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Errors are contained and will not impact other modules.</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Communication via defined APIs and message bus only.</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/80 text-[11px] text-amber-800">
                  <div className="flex items-start gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold block">Rollback required</span>
                      <span className="text-slate-600">Disabling this module requires a rollback to maintain system integrity.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 text-xs py-10">Pilih modul untuk melihat rincian.</div>
          )}
        </aside>
      </div>

      {/* Disable Module Confirmation Modal (Matching Wireframe 04) */}
      {disableModalOpen && targetDisableModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Disable module</h3>
              <button onClick={() => setDisableModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to disable <strong className="text-slate-900">{targetDisableModule.name} ({targetDisableModule.technicalName})</strong>?
            </p>

            {/* Alert 1: Dependency Impact */}
            {targetDependents.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>Dependency impact</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  The following modules depend on this module and may be affected:
                </p>
                <ul className="list-disc list-inside text-[11px] font-mono text-amber-900 font-semibold">
                  {targetDependents.map((dep) => (
                    <li key={dep.id}>{dep.name} ({dep.technicalName})</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Alert 2: Rollback Required */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 space-y-1.5">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Rollback required</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Disabling this module requires a rollback to maintain system integrity. This action cannot be undone without a rollback.
              </p>
            </div>

            {/* Confirmation Checkbox */}
            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={rollbackConfirmed}
                onChange={(e) => setRollbackConfirmed(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              <span>I understand that a rollback will be required to disable this module.</span>
            </label>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDisableModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDisable}
                disabled={!rollbackConfirmed}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Disable module
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
