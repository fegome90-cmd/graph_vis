import React from 'react';

const NavItem: React.FC<{ icon: string; label: string; active?: boolean }> = ({ icon, label, active }) => {
    const baseClasses = "flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-colors";
    const activeClasses = "bg-primary/20 text-primary";
    const inactiveClasses = "text-black/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5";

    return (
        <div className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
            <span className="material-symbols-outlined text-xl">{icon}</span>
            <p className="text-sm font-medium leading-normal">{label}</p>
        </div>
    );
};

export const LeftSidebar: React.FC = () => {
    return (
        <aside className="flex h-full w-72 shrink-0 flex-col justify-between border-r border-white/10 bg-background-light dark:bg-background-dark p-4">
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-10" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBTMq_I2ZDhtD4M5H5U689EjNUJcplBhuyCf3iom3K43FPrpbVBwwq0ApbeN18Sf04u3UpUO_TVV33iGo5pSSJAifKfBQr3e-DeJthNm1VoL_V8Z1pKkw6-MxEA2FbSlET-jwweDzV5Ga5Lx4TS9_sh5ekP31CPZtGmnUYTdN8vY_F4m0ZJnY22RPNHlXJAJYfdQwjDgr5mS5IpvNDm1Fuhw3dlfwjxw-j_e93Il0NuUJsNNAyKCrGKou_G4u7yUMFU_6p3xDxOHgw")'}}></div>
                    <div className="flex flex-col">
                        <h1 className="text-black dark:text-white text-base font-medium leading-normal">Current Repository</h1>
                        <p className="text-black/60 dark:text-white/60 text-sm font-normal leading-normal">project-name/repo-name</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <NavItem icon="rebase" label="PR Navigator" />
                    <NavItem icon="tune" label="Filter Controls" active />
                    <NavItem icon="visibility" label="View Options" />
                </div>
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5">
                <span className="material-symbols-outlined">chevron_left</span>
                Collapse Sidebar
            </button>
        </aside>
    );
};