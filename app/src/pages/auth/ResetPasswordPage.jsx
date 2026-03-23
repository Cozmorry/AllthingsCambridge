import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Label from '../../components/Label'

const ResetPasswordPage = () => {
    const { resetPassword } = useAuth()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        const { error: err } = await resetPassword(email)
        setLoading(false)
        if (err) return setError(err.message)
        setSent(true)
    }

    if (sent) return (
        <div className="text-center">
            <div className="text-5xl mb-4">📨</div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Reset link sent</h2>
            <p className="text-gray-500 text-sm">Check <strong>{email}</strong> for the password reset link.</p>
            <Link to="/login" className="block mt-6 text-primary-600 font-semibold hover:underline text-sm">Back to Login</Link>
        </div>
    )

    return (
        <>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Reset password</h2>
            <p className="text-sm text-gray-500 mb-7">Enter your email and we'll send you a reset link.</p>

            {error && <p className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <Label>Email</Label>
                    <input
                        type="email" required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                        placeholder="yourname@email.com"
                    />
                </div>
                <button type="submit" disabled={loading}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-60"
                >
                    {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
                <Link to="/login" className="text-primary-600 font-semibold hover:underline">← Back to Login</Link>
            </p>
        </>
    )
}

export default ResetPasswordPage
