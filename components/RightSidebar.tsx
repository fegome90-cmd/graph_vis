import React from 'react';

const ModifiedFileItem: React.FC<{name: string, additions: number, deletions: number, active?: boolean}> = ({ name, additions, deletions, active }) => (
    <li className={`flex items-center justify-between rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer ${active ? 'bg-primary/20' : ''}`}>
        <div className={`flex items-center gap-2 text-sm ${active ? 'text-primary' : 'text-black dark:text-white'}`}>
            <span className="material-symbols-outlined text-base">description</span>
            <span>{name}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
            <span className="text-green-500">+{additions}</span>
            <span className="text-red-500">-{deletions}</span>
        </div>
    </li>
);

export const RightSidebar: React.FC = () => {
    return (
        <aside className="w-96 shrink-0 border-l border-white/10 bg-background-light dark:bg-background-dark flex flex-col">
            <div className="p-6 border-b border-white/10">
                <h2 className="text-black dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">PR #12345: Refactor Authentication Logic</h2>
                <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-400">Merged</span>
                    <p className="text-sm text-black/60 dark:text-white/60">by <span className="font-medium text-black dark:text-white">@username</span></p>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-col gap-6">
                    <div>
                        <h3 className="text-sm font-medium text-black/60 dark:text-white/60 mb-2">Description</h3>
                        <p className="text-sm text-black dark:text-white">This PR refactors the core authentication service to improve security and performance. It introduces a new JWT handling mechanism and updates the user session management.</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-black/60 dark:text-white/60 mb-3">Details</h3>
                        <div className="flex flex-col gap-2 text-sm">
                            <div className="flex justify-between"><span className="text-black/80 dark:text-white/80">Author:</span><span className="text-black dark:text-white">@username</span></div>
                            <div className="flex justify-between"><span className="text-black/80 dark:text-white/80">Created:</span><span className="text-black dark:text-white">3 days ago</span></div>
                            <div className="flex justify-between"><span className="text-black/80 dark:text-white/80">Reviewers:</span><span className="text-black dark:text-white">@reviewer1, @reviewer2</span></div>
                            <div className="flex justify-between"><span className="text-black/80 dark:text-white/80">Link:</span><a className="text-primary hover:underline" href="#">View on GitHub</a></div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-black/60 dark:text-white/60 mb-3">Modified Files (12)</h3>
                        <ul className="flex flex-col gap-1">
                           <ModifiedFileItem name="services/auth.js" additions={120} deletions={85} />
                           <ModifiedFileItem name="utils/jwtHelper.js" additions={250} deletions={15} active />
                           <ModifiedFileItem name="models/user.js" additions={5} deletions={2} />
                           <ModifiedFileItem name="controllers/authController.js" additions={48} deletions={90} />
                        </ul>
                    </div>
                </div>
            </div>
        </aside>
    );
};