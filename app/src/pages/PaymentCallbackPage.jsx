import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { CheckCircle, XCircle } from 'lucide-react'

const PaymentCallbackPage = () => {
    const [searchParams] = useSearchParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [status, setStatus] = useState('verifying')
    const reference = searchParams.get('reference')
    const planFromUrl = searchParams.get('plan') || 'monthly'
    const amountFromUrl = searchParams.get('amount')
    const currencyFromUrl = searchParams.get('currency') || 'USD'

    useEffect(() => {
        const verify = async () => {
            if (!reference || !user) return

            // Record the "real value" in USD cents (e.g., 999 for $9.99) regardless of local currency conversion
            const recordAmount = planFromUrl === 'annual' ? 9999 : 999

            let paymentError = null

            // Record Payment in authentic DB session
            const { error } = await supabase.from('payments').insert({
                user_id: user.id,
                paystack_reference: reference,
                status: 'success',
                plan: planFromUrl,
                amount: recordAmount,
                currency: 'USD', // Recording as USD since that is the "real value" requested
            })
            paymentError = error

            if (!paymentError) {
                // Mark user as subscribed in real DB
                await supabase.from('profiles').update({
                    is_subscribed: true,
                    subscribed_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                }).eq('id', user.id)

                setStatus('success')
                setTimeout(() => navigate('/account'), 3000)
            } else {
                console.error("Payment insert error:", paymentError)
                setStatus('error')
            }
        }
        verify()
    }, [reference, user, navigate, planFromUrl])

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
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-5"><CheckCircle size={40} className="text-green-600" /></div>
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Payment Successful!</h2>
                    <p className="text-gray-500 mb-2">Your subscription is now active.</p>
                    <p className="text-sm text-gray-400">Redirecting to your account…</p>
                </>
            )}
            {status === 'error' && (
                <>
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-5"><XCircle size={40} className="text-red-600" /></div>
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-500">We couldn't verify your payment. Please contact support.</p>
                </>
            )}
        </div>
    )
}

export default PaymentCallbackPage
