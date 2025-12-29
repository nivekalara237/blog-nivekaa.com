import React from 'react';

const MEDIA_CONFIG = {
    x: {
        color: 'bg-[#000000] text-white',
        icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13.6823 10.6218L20.2391 3H18.6854L13.0482 9.59904L8.45265 3H3L9.89434 13.036L3 21H4.49886L10.5281 13.983L15.3526 21H20.7391L13.6819 10.6218H13.6823ZM11.3323 13.0478L10.7411 12.2036L5.03964 4.06205H7.34812L11.8576 10.5012L12.4487 11.3454L18.4119 19.8596H16.1034L11.3323 13.0478Z" /></svg>
    },
    github: {
        color: 'bg-[#24292e] text-white',
        icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
    },
    gitlab: {
        color: 'bg-[#FC6D26] text-white',
        icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="m22.1 12.4-.1-.1-2.9-8.8c-.1-.3-.4-.4-.7-.4-.3 0-.5.2-.6.5l-2.1 6.3H8.3l-2-6.3c-.1-.3-.4-.5-.7-.5-.3 0-.6.2-.7.5l-2.9 8.8c0 .1-.1.1-.1.2 0 2.4.9 4.7 2.4 6.3l.1.1 4.7 4.7c.3.3.6.4.9.4.4 0 .7-.1.9-.4l4.8-4.7 2.4-1.9c1.6-1.3 2.5-3.1 2.5-5.1.1-.1.1-.2.1-.3z" /></svg>
    },
    linkedin: {
        color: 'bg-[#0077b5] text-white',
        icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" /></svg>
    },
    website: {
        color: 'bg-indigo-600 text-white',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8"></path><path strokeLinecap="round" strokeLinejoin="round" d="M12 3a17 17 0 000 18 17 17 0 000-18z"></path></svg>
    },
    instagram: {
        color: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white',
        icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
    },
    facebook: {
        color: 'bg-[#1877f2] text-white',
        icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
    },
    default: {
        color: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
    }
};

export default function AuthorCard({ author }) {
    const hideName = author.hideName === true || author.hideName === 'true';

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 border border-indigo-100 dark:border-gray-700 shadow-sm transition-all duration-300">
            <h3 className="text-xl !mt-0 font-bold text-gray-900 dark:text-gray-100 mb-6">À propos de l'auteur</h3>
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6">
                <img
                    src={author.avatar}
                    alt={hideName ? "Auteur" : author.name}
                    className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-700 shadow-xl flex-shrink-0 object-cover"
                />
                <div className="flex-1">
                    {!hideName && (
                        <h4 className="text-xl !m-0 font-bold text-gray-900 dark:text-gray-100">{author.name}</h4>
                    )}
                    {author.jobPositions && author.jobPositions.length > 0 ? (
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                            {author.jobPositions.map((job, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-indigo-100 dark:border-indigo-800"
                                >
                                    {job}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-indigo-600 dark:text-indigo-400 font-semibold mb-2">{author.role}</p>
                    )}
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4 text-sm">{author.bio}</p>

                    {author.medias && author.medias.length > 0 && (
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                            {author.medias.map((media, idx) => {
                                const config = MEDIA_CONFIG[media.type] || MEDIA_CONFIG.default;
                                return (
                                    <a
                                        key={idx}
                                        href={media.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-9 h-9 rounded-full ${config.color} hover:scale-110 active:scale-95 transition-all text-xs font-bold flex items-center justify-center shadow-sm`}
                                        title={media.type}
                                    >
                                        <span>{config.icon}</span>
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
