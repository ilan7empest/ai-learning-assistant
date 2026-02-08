import React from 'react'
import { Upload, X } from 'lucide-react'

import Button from '../../components/common/Button'

type Props = {
    setIsUploadModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    setUploadFile: React.Dispatch<React.SetStateAction<File | null>>
    setUploadTitle: React.Dispatch<React.SetStateAction<string>>
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleFileUpload: (e: React.FormEvent) => void
    uploadTitle: string
    uploadFile: File | null
    uploading: boolean
}

const UploadModal = ({ setIsUploadModalOpen, setUploadFile, setUploadTitle, handleFileChange, handleFileUpload, uploadTitle, uploadFile, uploading }: Props) => {
    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-2xl shadow-slate-900/20 w-full max-w-lg p-6 relative">
                {/* Close btn */}
                <button onClick={() => {
                    setIsUploadModalOpen(false)
                    setUploadFile(null)
                    setUploadTitle('')
                }} className='absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 cursor-pointer'>
                    <X className="w-5 h-5" strokeWidth={2} />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Upload New Document</h2>
                    <p className="text-sm text-slate-500 mt-1">Add a PDF file to your collection.</p>
                </div>

                <form onSubmit={handleFileUpload} className="space-y-5">
                    {/* title */}
                    <div className='space-y-2'>
                        <label htmlFor="document-title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Document Title</label>
                        <input id="document-title" type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} className="w-full h-12 border-2 border-slate-200 rounded-xl px-4 py-2 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10" required placeholder='e.g., React Interview Prep' />
                    </div>
                    {/* file input */}
                    <div className='space-y-2'>
                        <label htmlFor="file-upload" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">PDF File</label>
                        <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 hover:bg-emerald-50/30 hover:border-emerald-400 cursor-pointer transition-all duration-200">
                            <input id="file-upload" type="file" accept="application/pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" required />
                            <div className="flex flex-col items-center justify-center py-10 px-6">
                                <div className="w-14 h-14 rounded-xl bg-linear-to-r from-emerald-100 to-teal-100 flex items-center justify-center mb-4"><Upload className='w-7 h-7 text-emerald-600' strokeWidth={2} /></div>
                                <p className="text-sm font-medium text-slate-700 mb-1">
                                    {uploadFile ? (
                                        <span className="text-emerald-600">{uploadFile.name}</span>
                                    ) : (
                                        <>
                                            <span className="text-emerald-600">Click to upload a PDF file</span>{" "}
                                            or drag and drop here.
                                        </>
                                    )}
                                </p>
                                <p className="text-xs text-slate-500">PDF up to 10MB</p>
                            </div>
                        </div>
                    </div>
                    {/* Action btn */}
                    <div className="flex gap-3 pt-2">
                        <Button type="button" className='flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed' disabled={uploading} variant="secondary" onClick={() => {
                            setIsUploadModalOpen(false)
                            setUploadFile(null)
                            setUploadTitle('')
                        }}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={uploading} variant="primary" className='flex-1 h-11 px-4 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'>
                            {uploading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className='w-4 h-4 border-2 border-white/30 rounded-full animate-spin' />
                                    'Uploading...'
                                </div>
                            ) : 'Upload Document'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default UploadModal