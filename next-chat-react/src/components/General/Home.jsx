import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [faqOpen, setFaqOpen] = useState(null);

    const toggleFaq = (index) => {
        setFaqOpen(faqOpen === index ? null : index);
    };

    return (
        <div id="gpage-home" className="g-page active">
            {/* HERO */}
            <section className="g-hero">
                <div className="container">
                    <div className="row align-items-center g-5">
                        <div className="col-lg-6">
                            <div className="g-hero-badge mb-3">
                                <span className="g-hero-badge-dot"></span> Now with HD video calling
                            </div>
                            <h1>Chat smarter.<br />Work <span>together.</span></h1>
                            <p className="g-hero-sub">NexChat brings your team's conversations, files, and calls into one clean, fast, secure workspace — available anywhere.</p>
                            <div className="d-flex gap-3 flex-wrap mb-4">
                                <button className="cta-primary" onClick={() => navigate('/register')}>Start for free</button>
                                <button className="cta-secondary">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                                    Watch demo
                                </button>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div className="d-flex" style={{ gap: '-6px' }}>
                                    <span className="avatar sm green" style={{ border: '2px solid #fff' }}>JD</span>
                                    <span className="avatar sm purple" style={{ border: '2px solid #fff', marginLeft: '-8px' }}>MK</span>
                                    <span className="avatar sm amber" style={{ border: '2px solid #fff', marginLeft: '-8px' }}>RP</span>
                                    <span className="avatar sm" style={{ border: '2px solid #fff', marginLeft: '-8px' }}>AL</span>
                                </div>
                                <span className="trust-text">Trusted by <strong>12,000+</strong> users worldwide</span>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="mock-window">
                                <div className="mock-titlebar">
                                    <span className="mock-dot" style={{ background: '#FF5F57' }}></span>
                                    <span className="mock-dot" style={{ background: '#FFBD2E' }}></span>
                                    <span className="mock-dot" style={{ background: '#28CA41' }}></span>
                                    NexChat — Project Alpha
                                </div>
                                <div className="mock-chat p-3">
                                    <div className="mock-msg d-flex align-items-end gap-2 mb-2">
                                        <span className="avatar sm green">JD</span>
                                        <span className="mock-bubble theirs">Hey team! The new design is ready for review 🎉</span>
                                    </div>
                                    <div className="mock-msg r d-flex align-items-end gap-2 mb-2 justify-content-end">
                                        <span className="mock-bubble mine">Looks great! Leaving comments now.</span>
                                        <span className="avatar sm purple">MK</span>
                                    </div>
                                    <div className="mock-msg d-flex align-items-end gap-2 mb-2">
                                        <span className="avatar sm amber">RP</span>
                                        <span className="mock-bubble theirs">Love the new color scheme. Ship it! 🚀</span>
                                    </div>
                                    <div className="mock-msg r d-flex align-items-end gap-2 justify-content-end">
                                        <span className="mock-bubble mine">Agreed. Let's hop on a quick call?</span>
                                        <span className="avatar sm purple">MK</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-white border-top" style={{ borderColor: '#F3F4F6!important' }}>
                                    <div className="d-flex align-items-center gap-2 chat-input-wrap">
                                        <input type="text" placeholder="Type a message…" />
                                        <button className="send-btn" style={{ width: '30px', height: '30px' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS STRIP */}
            <section className="stats-strip">
                <div className="container">
                    <div className="row text-center g-4">
                        <div className="col-6 col-md-3"><div className="stat-num">12K+</div><div className="stat-lbl">Active Users</div></div>
                        <div className="col-6 col-md-3"><div className="stat-num">4.9M</div><div className="stat-lbl">Messages Sent</div></div>
                        <div className="col-6 col-md-3"><div className="stat-num">99.9%</div><div className="stat-lbl">Uptime SLA</div></div>
                        <div className="col-6 col-md-3"><div className="stat-num">&lt;100ms</div><div className="stat-lbl">Message Latency</div></div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="g-section">
                <div className="container">
                    <div className="text-center mb-5">
                        <span className="section-tag">Features</span>
                        <div className="section-title">Everything your team needs</div>
                        <p className="section-sub mx-auto" style={{ maxWidth: '520px' }}>From quick DMs to full-scale video conferences — NexChat has every communication tool built in.</p>
                    </div>
                    <div className="row g-4">
                        {[
                            { color: '#EFF6FF', stroke: '#3B82F6', icon: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />, title: "Real-Time Messaging", desc: "Instant messages with typing indicators, read receipts, reactions, and threaded replies." },
                            { color: '#ECFDF5', stroke: '#10B981', icon: <><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></>, title: "HD Video & Audio Calls", desc: "Crystal-clear one-to-one and group calls with screen sharing and background blur." },
                            { color: '#F5F3FF', stroke: '#8B5CF6', icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /></>, title: "Group Chat Rooms", desc: "Public and private channels for teams, projects, or any community you want to build." },
                            { color: '#FFFBEB', stroke: '#F59E0B', icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></>, title: "File & Media Sharing", desc: "Drag and drop documents, images, audio, and video directly into any conversation." },
                            { color: '#FEF2F2', stroke: '#EF4444', icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, title: "End-to-End Encryption", desc: "All messages and calls are fully encrypted. Your data is private and secure by default." },
                            { color: '#EFF6FF', stroke: '#3B82F6', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>, title: "Searchable Chat History", desc: "Full message history with powerful search — find any file, link, or message in seconds." },
                        ].map((feat, idx) => (
                            <div className="col-md-6 col-lg-4" key={idx}>
                                <div className="feat-card h-100">
                                    <div className="feat-icon" style={{ background: feat.color }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={feat.stroke} strokeWidth="2">{feat.icon}</svg>
                                    </div>
                                    <h3>{feat.title}</h3>
                                    <p>{feat.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="g-section-alt">
                <div className="container">
                    <div className="text-center mb-5">
                        <span className="section-tag">How it works</span>
                        <div className="section-title">Up and running in minutes</div>
                        <p className="section-sub">No complex setup. Just sign up and start chatting.</p>
                    </div>
                    <div className="row g-4">
                        {[
                            { num: 1, title: "Create an account", desc: "Sign up with your email in under 30 seconds — no credit card required." },
                            { num: 2, title: "Invite your team", desc: "Add teammates by email or share a room invite link instantly." },
                            { num: 3, title: "Set up your rooms", desc: "Create channels for projects, topics, or departments in one click." },
                            { num: 4, title: "Start communicating", desc: "Message, call, and collaborate in real time from any device." },
                        ].map((step, idx) => (
                            <div className="col-6 col-md-3" key={idx}>
                                <div className="how-step">
                                    <div className="how-num">{step.num}</div>
                                    <h4>{step.title}</h4>
                                    <p>{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="g-section">
                <div className="container">
                    <div className="text-center mb-5">
                        <span className="section-tag">Testimonials</span>
                        <div className="section-title">Loved by teams everywhere</div>
                        <p className="section-sub">Here's what our users say about NexChat.</p>
                    </div>
                    <div className="row g-4">
                        {[
                            { stars: "★★★★★", quote: "\"NexChat replaced our three separate tools overnight. The interface is clean, fast, and our whole team actually uses it.\"", name: "Sarah R.", role: "Engineering Lead, Acme Co.", initial: "SR", color: "green" },
                            { stars: "★★★★★", quote: "\"The admin panel is a game changer. I can see everything happening across 200+ users and keep things running smoothly.\"", name: "Tom W.", role: "IT Manager, GlobalTech", initial: "TW", color: "purple" },
                            { stars: "★★★★★", quote: "\"Best final year project platform I've used. The UI is modern, the features are complete, and it's genuinely fun to use.\"", name: "Priya K.", role: "CS Student, IIT Delhi", initial: "PK", color: "amber" },
                        ].map((testi, idx) => (
                            <div className="col-md-4" key={idx}>
                                <div className="testi-card h-100">
                                    <div className="testi-stars">{testi.stars}</div>
                                    <p className="testi-quote">{testi.quote}</p>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className={`avatar sm ${testi.color}`}>{testi.initial}</span>
                                        <div><div className="testi-name">{testi.name}</div><div className="testi-role">{testi.role}</div></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="g-section-alt">
                <div className="container" style={{ maxWidth: '720px' }}>
                    <div className="text-center mb-4">
                        <span className="section-tag">FAQ</span>
                        <div className="section-title">Common questions</div>
                    </div>
                    {[
                        { q: "Is NexChat free to use?", a: "Yes — NexChat is free to get started with core messaging and calling features included." },
                        { q: "How secure is NexChat?", a: "All messages are end-to-end encrypted using AES-256. We do not access your message content, and all data is stored on servers with SOC2 compliance." },
                        { q: "Can I use NexChat on mobile?", a: "Yes! NexChat works in any modern browser and is fully responsive. Native Android and iOS apps are coming soon." },
                        { q: "What is the Admin Zone?", a: "The Admin Zone is a dedicated dashboard for administrators to manage users, monitor chat sessions, moderate content, and view analytics — all in one place." },
                    ].map((item, idx) => (
                        <div className={`faq-item ${faqOpen === idx ? 'open' : ''}`} onClick={() => toggleFaq(idx)} key={idx}>
                            <div className="faq-q">{item.q} <span className="faq-chevron">▼</span></div>
                            <div className="faq-a">{item.a}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA BANNER */}
            <section className="cta-banner">
                <div className="container">
                    <h2>Ready to transform<br />how your team communicates?</h2>
                    <p>Join 12,000+ users already on NexChat. Sign up in seconds — it's completely free to start.</p>
                    <div>
                        <button className="banner-btn-primary" onClick={() => navigate('/register')}>Create free account</button>
                        <button className="banner-btn-ghost" onClick={() => navigate('/login')}>Sign in now</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
