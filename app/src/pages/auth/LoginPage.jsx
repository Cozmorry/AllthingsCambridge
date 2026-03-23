import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Eye, EyeOff } from 'lucide-react'
import Label from '../../components/Label'

const LoginPage = () => {
    const { signIn } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from?.pathname ?? '/'
    const [form, setForm] = useState({ email: '', password: '' })
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        const { error: err } = await signIn(form)
        setLoading(false)
        if (err) return setError(err.message)
        navigate(from, { replace: true })
    }

    return (
        <>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-sm text-gray-500 mb-7">Log in to your account</p>

            {error && <p className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <Label>Email</Label>
                    <input
                        type="email" required
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
                        placeholder="yourname@email.com"
                    />
                </div>
                <div>
                    <Label>Password</Label>
                    <div className="relative">
                        <input
                            type={showPw ? 'text' : 'password'} required
                            value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                            className="w-full px-4 py-2.5 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
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
                    <div className="text-right mt-1.5">
                        <Link to="/reset-password" className="text-xs text-primary-600 hover:underline">Forgot password?</Link>
                    </div>
                </div>
                <button type="submit" disabled={loading}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-60"
                >
                    {loading ? 'Logging in…' : 'Log In'}
                </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary-600 font-semibold hover:underline">Sign Up</Link>
            </p>
        </>
    )
}

export default LoginPage
