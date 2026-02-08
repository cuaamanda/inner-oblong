'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { approveApplication, rejectApplication, resetApplicationStatus } from '@/app/actions/applications'
import { Loader2, Check, X, Undo } from 'lucide-react'

// ... imports remain the same

interface ApplicationActionsProps {
    applicationId: string
    status: string
}

export function ApplicationActions({ applicationId, status }: ApplicationActionsProps) {
    const [loading, setLoading] = useState(false)

    const handleApprove = async (tier: 'basic' | 'prestige') => {
        if (!confirm(`Are you sure you want to approve this application for the ${tier} tier?`)) return
        setLoading(true)
        try {
            const result = await approveApplication(applicationId, tier)
            if (result.success) {
                // Success handled by revalidatePath
            } else {
                alert(result.message)
            }
        } catch (error) {
            alert('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleReject = async () => {
        if (!confirm('Are you sure you want to reject this application?')) return
        setLoading(true)
        try {
            const result = await rejectApplication(applicationId)
            if (result.success) {
                // Success handled by revalidatePath
            } else {
                alert(result.message)
            }
        } catch (error) {
            alert('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleUndo = async () => {
        if (!confirm('Undo this action? This will cancel the scheduled email if within 5 minutes.')) return
        setLoading(true)
        try {
            const result = await resetApplicationStatus(applicationId)
            if (result.success) {
                // Success
            } else {
                alert(result.message)
            }
        } catch (error) {
            alert('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    if (status !== 'pending') {
        return (
            <div className="flex items-center gap-2">
                <span className={`capitalize px-2 py-1 rounded-full text-xs font-medium ${status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {status}
                </span>
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    onClick={handleUndo}
                    disabled={loading}
                    title="Undo Action"
                >
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Undo className="h-3 w-3" />}
                </Button>
            </div>
        )
    }

    return (
        <div className="flex gap-2">
            <Button
                size="sm"
                variant="outline"
                className="px-2 h-8 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 text-xs flex gap-1 items-center"
                onClick={() => handleApprove('basic')}
                disabled={loading}
                title="Approve Basic ($20/mo)"
            >
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                Basic
            </Button>
            <Button
                size="sm"
                variant="outline"
                className="px-2 h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200 text-xs flex gap-1 items-center"
                onClick={() => handleApprove('prestige')}
                disabled={loading}
                title="Approve Prestige ($98/mo)"
            >
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                Prestige
            </Button>
            <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={handleReject}
                disabled={loading}
                title="Reject"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            </Button>
        </div>
    )
}
