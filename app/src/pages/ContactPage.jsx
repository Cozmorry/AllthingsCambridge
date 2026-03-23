import { useState } from 'react'
import { Mail, MapPin, MessageCircle } from 'lucide-react'
import Label from '../components/Label'

const ContactPage = () => {
    const [form, setForm] = useState({ name: '', email: '', message: '' })
    const [sent, setSent] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        // TODO: wire up to email service (e.g. Resend or Supabase Edge Function)
        setSent(true)
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-14">
            <div className="grid md:grid-cols-2 gap-12">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Contact Us</h1>
                    <p className="text-gray-500 mb-8">Have a question or feedback? We'd love to hear from you.</p>
                    <div className="space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center"><Mail size={18} /></div>
                            <div><p className="text-sm font-semibold text-gray-700">Email</p><p className="text-sm text-gray-500">support@allthingscambridge.com</p></div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center"><MessageCircle size={18} /></div>
                            <div><p className="text-sm font-semibold text-gray-700">Community</p><p className="text-sm text-gray-500">Join the forums to ask questions</p></div>
                        </div>
                    </div>
                </div>

                <div>
                    {sent ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="text-5xl mb-4">✅</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Thanks for reaching out!</h3>
                            <p className="text-gray-500">We'll get back to you within 24 hours.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-8 space-y-5">
                            <div>
                                <Label>Name</Label>
                                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                                    placeholder="Your name" />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                                    placeholder="your@email.com" />
                            </div>
                            <div>
                                <Label>Message</Label>
                                <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                                    placeholder="How can we help?" />
                            </div>
                            <button type="submit" className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-colors">
                                Send Message
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ContactPage
