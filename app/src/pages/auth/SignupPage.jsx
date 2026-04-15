import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

const SignupPage = () => {
    const { signUp } = useAuth()
    const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' })
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (form.password !== form.confirm) return setError('Passwords do not match.')
        if (form.password.length < 6) return setError('Password must be at least 6 characters.')
        setLoading(true)
        const { error: err } = await signUp({ email: form.email.trim(), password: form.password, fullName: form.fullName })
        setLoading(false)
        if (err) return setError(err.message)
        setSuccess(true)
    }

    if (success) return (
        <>
            <div className="text-center">
                <div className="text-5xl mb-4">📬</div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Check your email</h2>
                <p className="text-gray-500 text-sm">We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account.</p>
                <Link to="/login" className="block mt-6 text-primary-600 font-semibold hover:underline text-sm">Back to Login</Link>
            </div>
        </>
    )

    return (
        <>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Create account</h2>
            <p className="text-sm text-gray-500 mb-7">Start your study journey today</p>

            {error && <p className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                    <input
                        type="text" required
                        value={form.fullName}
                        onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                        placeholder="Jane Smith"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                    <input
                        type="email" required
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                        placeholder="jane@email.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                        <input
                            type={showPw ? 'text' : 'password'} required
                            value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                            className="w-full px-4 py-2.5 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-primary-600 focus:ring-2 focus:ring-primary-400 focus:ring-offset-1 rounded-sm transition-colors"
                            aria-label={showPw ? "Hide password" : "Show password"}
                            title={showPw ? "Hide password" : "Show password"}
                        >
                            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                    <input
                        type="password" required
                        value={form.confirm}
                        onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                        placeholder="••••••••"
                    />
                </div>
                <button type="submit" disabled={loading}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-60"
                >
                    {loading ? 'Creating account…' : 'Create Account'}
                </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 font-semibold hover:underline">Log In</Link>
            </p>
        </>
    )
}

export default SignupPage
