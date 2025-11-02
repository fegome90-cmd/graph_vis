import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="flex shrink-0 items-center justify-between whitespace-nowrap border-b border-solid border-white/10 dark:border-white/10 px-6 py-3 bg-background-light dark:bg-[#101622]">
            <div className="flex items-center gap-4 text-black dark:text-white">
                <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
                <h2 className="text-black dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Unified Development Command Post</h2>
            </div>
            <div className="flex flex-1 justify-end gap-8">
                <div className="flex items-center gap-9">
                    <a className="text-black/70 dark:text-white/70 hover:text-primary dark:hover:text-primary text-sm font-medium leading-normal" href="#">Dashboard</a>
                    <a className="text-primary dark:text-primary text-sm font-bold leading-normal" href="#">MesoView</a>
                    <a className="text-black/70 dark:text-white/70 hover:text-primary dark:hover:text-primary text-sm font-medium leading-normal" href="#">Settings</a>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-white/10 text-black dark:text-white hover:bg-white/20">
                        <span className="material-symbols-outlined text-xl">notifications</span>
                    </button>
                    <button className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-white/10 text-black dark:text-white hover:bg-white/20">
                        <span className="material-symbols-outlined text-xl">help</span>
                    </button>
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDLjeQyVnJWsT3qkTMCDaTb_KRoa2FV8vmszMaVTSS8tWayACb4qb18YtuTKkZp2EP0HokMwnGyXMDqm9AEx-DnVnXkQ8K-PyQMisLocbZWSu2u3grcbuwglf8eZbd1Vn7zJESh_FQHLDMvhvp84bg8zBTMpAxALfd3oms6SVDXHl0Cvbc5vrIrXxViQdVdd5MgZpP6dSonjggv9WJUDsm0zWaNYHfLNO7QxweRbODHF_2VnG353VQs_NEsQ5RmBzKfGf18RiSCJc4")'}}></div>
                </div>
            </div>
        </header>
    );
};