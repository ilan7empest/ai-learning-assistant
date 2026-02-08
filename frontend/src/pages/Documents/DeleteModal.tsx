import React from 'react'
import { Trash2, X } from 'lucide-react'

type Props = {
    setIsDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    selectedDoc: {
        id: string
        title: string
    }
    deleting: boolean
    handleConfirmDelete: () => void
}

const DeleteModal = ({ setIsDeleteModalOpen, selectedDoc, deleting, handleConfirmDelete }: Props) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-2xl shadow-slate-900/20 p-6">
                {/* Close btn */}
                <button onClick={() => setIsDeleteModalOpen(false)} className='absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 cursor-pointer'>
                    <X className="w-5 h-5" strokeWidth={2} />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <div className="w-12 h-12 rounded-xl bg-linear-to-r from-red-100 to-red-200 flex items-center justify-center mb-4">
                        <Trash2 className="w-6 h-6 text-red-600" strokeWidth={2} />
                    </div>
                    <h2 className="text-xl font-medium text-slate-900 tracking-tight">Confirm Deletion</h2>
                </div>

                {/* Content */}
                <p className="text-sm text-slate-600 mb-6">
                    Are you sure you want to delete this document{' '}
                    <span className="font-semibold text-slate-900">{selectedDoc.title}</span>
                    ? This action cannot be undone.
                </p>

                {/* Action btn */}
                <div className="flex gap-3">
                    <button type='button' onClick={() => setIsDeleteModalOpen(false)} disabled={deleting} className='flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>Cancel</button>
                    <button onClick={handleConfirmDelete} disabled={deleting} className='flex-1 h-11 px-4 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'>
                        {deleting ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                'Deleting...'
                            </div>
                        ) : 'Delete Document'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteModal