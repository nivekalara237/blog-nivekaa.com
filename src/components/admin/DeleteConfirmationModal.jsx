import React, { useState, useEffect } from 'react';

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title, slug, isDeleting }) {
    const [challenge, setChallenge] = useState({ num1: 0, num2: 0, sum: 0 });
    const [answer, setAnswer] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);

    useEffect(() => {
        if (isOpen) {
            generateChallenge();
            setAnswer('');
            setIsCorrect(false);
        }
    }, [isOpen]);

    const generateChallenge = () => {
        const num1 = Math.floor(Math.random() * 20) + 1;
        const num2 = Math.floor(Math.random() * 20) + 1;
        setChallenge({ num1, num2, sum: num1 + num2 });
    };

    const handleAnswerChange = (e) => {
        const value = e.target.value;
        setAnswer(value);
        setIsCorrect(parseInt(value) === challenge.sum);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-500 mb-6 mx-auto">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
                        Supprimer l'article ?
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-6">
                        Vous êtes sur le point de supprimer <span className="font-bold text-gray-900 dark:text-gray-200">"{title}"</span>.<br />
                        L'article sera déplacé dans le dossier des éléments supprimés sur S3.
                    </p>

                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 mb-6">
                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 text-center">
                            Défi cryptogramme
                        </label>
                        <div className="flex flex-col items-center gap-4">
                            <span className="text-2xl font-black text-gray-700 dark:text-gray-300 tabular-nums">
                                {challenge.num1} + {challenge.num2} = ?
                            </span>
                            <input
                                type="number"
                                value={answer}
                                onChange={handleAnswerChange}
                                placeholder="Résultat..."
                                className="w-full text-center text-xl font-bold bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:border-red-500 outline-none transition-all dark:text-white"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-2xl font-bold transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={!isCorrect || isDeleting}
                            className={`flex-1 px-4 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${isCorrect && !isDeleting
                                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {isDeleting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Suppression...
                                </>
                            ) : (
                                'Confirmer'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
