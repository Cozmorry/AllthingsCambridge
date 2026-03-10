import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const PaymentCallbackPage = () => {
    const [searchParams] = useSearchParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [status, setStatus] = useState('verifying')
    const reference = searchParams.get('reference')

    useEffect(() => {
        const verify = async () => {
            if (!reference || !user) return

            // Record payment in DB
            const { error } = await supabase.from('payments').insert({
                user_id: user.id,
                paystack_reference: reference,
                status: 'success',
                plan: 'monthly',
                amount: 2000,
            })

            if (!error) {
                // Mark user as subscribed
                await supabase.from('profiles').update({
                    is_subscribed: true,
                    subscribed_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                }).eq('id', user.id)

                setStatus('success')
                setTimeout(() => navigate('/account'), 3000)
            } else {
                setStatus('error')
            }
        }
        verify()
    }, [reference, user, navigate])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
            {status === 'verifying' && (
                <>
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-6" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
                    <p className="text-gray-500">Please wait while we confirm your payment…</p>
                </>
            )}
            {status === 'success' && (
                <>
                    <div className="text-6xl mb-5">🎉</div>
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Payment Successful!</h2>
                    <p className="text-gray-500 mb-2">Your subscription is now active.</p>
                    <p className="text-sm text-gray-400">Redirecting to your account…</p>
                </>
            )}
            {status === 'error' && (
                <>
                    <div className="text-6xl mb-5">❌</div>
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-500">We couldn't verify your payment. Please contact support.</p>
                </>
            )}
        </div>
    )
}

export default PaymentCallbackPage
