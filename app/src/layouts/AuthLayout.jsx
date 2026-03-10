import { Outlet, Link } from 'react-router-dom'

const AuthLayout = () => (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <Link to="/" className="inline-flex items-center gap-2 font-extrabold text-2xl text-gray-900">
                    <span className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold">A</span>
                    AllThingsCambridge
                </Link>
            </div>
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-900/5 border border-gray-100 p-8">
                <Outlet />
            </div>
        </div>
    </div>
)

export default AuthLayout
