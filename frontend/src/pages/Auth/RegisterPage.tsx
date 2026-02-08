import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/Auth.context'
import { authService } from '../../services/auth.service'
import { BrainCircuit, Mail, Lock, ArrowRight, User } from 'lucide-react'
import toast from 'react-hot-toast'

const RegisterPage = () => {
    const [userData, setUserData] = useState<{ username: string, email: string; password: string }>({ username: '', email: '', password: '' })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [focusedField, setFocusedField] = useState<string | null>(null)

    const navigate = useNavigate()
    const { register } = useAuth()

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserData({ ...userData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (userData.password.length < 6) {
            setError('Password must be at least 6 characters long.')
            toast.error('Password must be at least 6 characters long.')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const { data: { user, token } } = await authService.register(userData.username, userData.email, userData.password)
            register(user, token)
            toast.success('Registration successful!')
            navigate('/dashboard')
        } catch (err: any) {
            setError(err.error || 'Registration failed. Please try again.')
            toast.error(err.error || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30"></div>
            <div className="relative w-full max-w-md px-6">
                <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-10">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-200 to-teal-500 shadow-lg shadow-emerald-500/25 mb-6">
                            <BrainCircuit className="w-7 h-7 text-white" strokeWidth={2} />
                        </div>
                        <h1 className='text-2xl font-medium text-slate-900 tracking-tight mb-2'>Create an account</h1>
                        <p className='text-slate-500 text-sm'>Start your AI-powered learning journey</p>
                    </div>
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username Fields */}
                        <div className="space-y-2">
                            <label htmlFor="username" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Username</label>
                            <div className="relative group">
                                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${focusedField === 'username' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                    <User className='w-5 h-5' strokeWidth={2} />
                                </div>
                                <input
                                    id="username"
                                    name='username'
                                    className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
                                    placeholder="John Doe"
                                    value={userData.username}
                                    onChange={handleOnChange}
                                    onFocus={() => setFocusedField('username')}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </div>
                        </div>
                        {/* Email Fields */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Email Address</label>
                            <div className="relative group">
                                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${focusedField === 'email' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                    <Mail className='w-5 h-5' strokeWidth={2} />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name='email'
                                    className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
                                    placeholder="you@example.com"
                                    value={userData.email}
                                    onChange={handleOnChange}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </div>
                        </div>
                        {/* Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Password</label>
                            <div className="relative group">
                                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${focusedField === 'password' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                    <Lock className='w-5 h-5' strokeWidth={2} />
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    name='password'
                                    className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
                                    placeholder="********"
                                    value={userData.password}
                                    onChange={handleOnChange}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </div>
                        </div>
                        {/* Error Message */}
                        {error && <div className="rounded-l bg-red-50 border border-red-200 p-3"><p className="text-xs text-red-600 font-medium text-center">{error}</p></div>}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="group relative w-full h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg shadow-emerald-500/25 overflow-hidden hover:cursor-pointer"
                            disabled={loading}
                        >
                            <span className='relative z-10 flex items-center justify-center gap-2'>
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Create account
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" strokeWidth={2} />
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-slate-200/60">
                        <p className="text-center text-sm text-slate-600">
                            Alreadt have an account?{' '}
                            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                <p className='text-center text-xs text-slate-400 mt-6'>
                    By continuing, you agree to our terms of service and privacy policy.
                </p>
            </div>
        </div>
    )
}

export default RegisterPage