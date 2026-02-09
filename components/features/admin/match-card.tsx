'use client'

import { useState } from 'react'
import { approveMatch, declineMatch, sendIntroduction } from '@/app/actions/introductions'
import { IntroEditor } from './intro-editor'

interface MatchCardProps {
    match: {
        id: string
        status: string
        intro_message: string | null
        member_a: {
            name: string
            member_profiles: {
                company: string | null
                role_title: string | null
            }[]
        }
        member_b: {
            name: string
            member_profiles: {
                company: string | null
                role_title: string | null
            }[]
        }
        month_year: string
    }
}

export function MatchCard({ match }: MatchCardProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleAction = async (action: () => Promise<any>) => {
        setIsLoading(true)
        try {
            await action()
        } finally {
            setIsLoading(false)
        }
    }

    const { member_a, member_b } = match
    const profileA = member_a.member_profiles[0]
    const profileB = member_b.member_profiles[0]

    const statusColors: any = {
        suggested: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        approved: 'bg-blue-100 text-blue-800 border-blue-200',
        sent: 'bg-green-100 text-green-800 border-green-200',
        declined: 'bg-red-100 text-red-800 border-red-200',
        completed: 'bg-gray-100 text-gray-800 border-gray-200',
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className={`px-4 py-1 text-xs font-semibold uppercase tracking-wider border-b ${statusColors[match.status] || 'bg-gray-100'}`}>
                {match.status}
            </div>

            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex-1 text-center">
                        <h4 className="font-bold text-gray-900 text-lg mb-1">{member_a.name}</h4>
                        <p className="text-sm text-gray-500">{profileA?.role_title}</p>
                        <p className="text-xs font-medium text-blue-600">{profileA?.company}</p>
                    </div>

                    <div className="px-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex-1 text-center">
                        <h4 className="font-bold text-gray-900 text-lg mb-1">{member_b.name}</h4>
                        <p className="text-sm text-gray-500">{profileB?.role_title}</p>
                        <p className="text-xs font-medium text-blue-600">{profileB?.company}</p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Match Reasoning / Intro Message</h5>
                    <p className="text-sm text-gray-700 italic leading-relaxed">
                        {match.intro_message || 'No reasoning provided.'}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-50">
                    {match.status === 'suggested' && (
                        <>
                            <button
                                onClick={() => handleAction(() => sendIntroduction(match.id))}
                                disabled={isLoading}
                                className="flex-1 min-w-[140px] bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                            >
                                Approve & Send
                            </button>
                            <button
                                onClick={() => setIsEditing(true)}
                                disabled={isLoading}
                                className="flex-1 min-w-[100px] bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                Edit Intro
                            </button>
                            <button
                                onClick={() => handleAction(() => declineMatch(match.id))}
                                disabled={isLoading}
                                className="bg-red-50 text-red-600 font-semibold py-2 px-4 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                            >
                                Decline
                            </button>
                        </>
                    )}

                    {match.status === 'approved' && (
                        <>
                            <button
                                onClick={() => handleAction(() => sendIntroduction(match.id))}
                                disabled={isLoading}
                                className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                Send Intro Email
                            </button>
                            <button
                                onClick={() => setIsEditing(true)}
                                disabled={isLoading}
                                className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                Edit
                            </button>
                        </>
                    )}

                    {match.status === 'sent' && (
                        <div className="w-full text-center py-2 text-sm text-green-600 font-medium bg-green-50 rounded-lg border border-green-100">
                            ✓ Introduction Email Sent
                        </div>
                    )}
                </div>
            </div>

            <IntroEditor
                introductionId={match.id}
                initialMessage={match.intro_message || ''}
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
            />
        </div>
    )
}
