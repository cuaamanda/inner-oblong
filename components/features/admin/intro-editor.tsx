'use client'

import { useState } from 'react'
import { updateIntroMessage } from '@/app/actions/introductions'

interface IntroEditorProps {
    introductionId: string
    initialMessage: string
    isOpen: boolean
    onClose: () => void
}

export function IntroEditor({ introductionId, initialMessage, isOpen, onClose }: IntroEditorProps) {
    const [message, setMessage] = useState(initialMessage)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleSave = async () => {
        setIsSaving(true)
        setError(null)
        try {
            const result = await updateIntroMessage(introductionId, message)
            if (result.success) {
                onClose()
            } else {
                setError(result.message)
            }
        } catch (err) {
            setError('An unexpected error occurred')
            console.error(err)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-xl font-semibold text-gray-900">Edit Introduction Message</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-700">
                        <p className="font-medium mb-1">💡 Match Reasoning:</p>
                        <p>{initialMessage}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Custom Introduction Message
                        </label>
                        <textarea
                            className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-400"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write a personalized intro message here..."
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 p-3 rounded-lg text-sm text-red-600">
                            {error}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all font-medium"
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all font-semibold shadow-sm hover:shadow-md"
                    >
                        {isSaving ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </span>
                        ) : 'Update Message'}
                    </button>
                </div>
            </div>
        </div>
    )
}
