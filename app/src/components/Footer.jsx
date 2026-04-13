import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react'

const Footer = () => {
    return (
        <footer className="w-full bg-white dark:bg-[#080d17] border-t border-gray-100 dark:border-gray-800 pt-14 pb-8">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
                            <img src="/icon.png" alt="ATC" className="w-8 h-8 rounded-lg shrink-0" />
                            <span className="font-extrabold text-base text-[#015e53] dark:text-teal-400 leading-tight">
                                AllThingCambridge
                            </span>
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6 pr-2">
                            Your premier resource for Cambridge curriculum educational materials.{' '}
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Helping students excel worldwide.</span>
                        </p>
                        <div className="flex items-center gap-4 text-gray-400 dark:text-gray-500">
                            <a href="#" aria-label="Facebook" className="hover:text-[#015e53] dark:hover:text-teal-400 transition-colors">
                                <Facebook size={18} />
                            </a>
                            <a href="#" aria-label="Twitter" className="hover:text-[#015e53] dark:hover:text-teal-400 transition-colors">
                                <Twitter size={18} />
                            </a>
                            <a href="#" aria-label="Instagram" className="hover:text-[#015e53] dark:hover:text-teal-400 transition-colors">
                                <Instagram size={18} />
                            </a>
                            <a href="#" aria-label="LinkedIn" className="hover:text-[#015e53] dark:hover:text-teal-400 transition-colors">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Level */}
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-5">Level</h3>
                        <ul className="space-y-3.5">
                            {[
                                { label: 'A Level', slug: 'a-level' },
                                { label: 'IGCSE', slug: 'igcse' },
                                { label: 'O Level', slug: 'o-level' },
                                { label: 'Lower sec checkpoint', slug: 'lower-sec-checkpoint' },
                                { label: 'Primary checkpoint', slug: 'primary-checkpoint' },
                            ].map(({ label, slug }) => (
                                <li key={slug}>
                                    <Link
                                        to={`/levels/${slug}`}
                                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#015e53] dark:hover:text-teal-400 transition-colors"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-5">Resources</h3>
                        <ul className="space-y-3.5">
                            {['Flashcards', 'Topical Questions', 'Notes', 'Past Papers'].map((item) => (
                                <li key={item}>
                                    <a
                                        href="#"
                                        className="text-sm text-[#015e53] dark:text-teal-400 hover:underline font-medium"
                                    >
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-5">Quick Links</h3>
                        <ul className="space-y-3.5">
                            <li><Link to="/about" className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#015e53] dark:hover:text-teal-400 transition-colors">About Us</Link></li>
                            <li><Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#015e53] dark:hover:text-teal-400 transition-colors">All Levels</Link></li>
                            <li><Link to="/forums" className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#015e53] dark:hover:text-teal-400 transition-colors">Community Forums</Link></li>
                            <li><Link to="/blog" className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#015e53] dark:hover:text-teal-400 transition-colors">Blog</Link></li>
                            <li><Link to="/contact" className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#015e53] dark:hover:text-teal-400 transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Contact + Newsletter */}
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-5">Contact Us</h3>
                        <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 mb-8">
                            <Mail size={16} className="shrink-0 text-gray-400" />
                            <a
                                href="mailto:info@allthingcambridge.com"
                                className="hover:text-[#015e53] dark:hover:text-teal-400 transition-colors break-all"
                            >
                                info@allthingcambridge.com
                            </a>
                        </div>

                        <h4 className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-3">
                            Subscribe to our newsletter
                        </h4>
                        <form className="flex" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Your email"
                                className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-l-lg outline-none focus:border-[#015e53] dark:focus:border-teal-500 transition-colors"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-semibold bg-[#015e53] hover:bg-[#014e45] text-white rounded-r-lg transition-colors shrink-0"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>

                </div>

                {/* Copyright */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-6 text-center">
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        © 2025 AllThingCambridge. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
