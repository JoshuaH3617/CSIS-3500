import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

//gets users full name from local storage, if not available it defaults to profile
function NavBar() {
    const navigate = useNavigate();
    const fullName = localStorage.getItem('fullName');
    const displayName = fullName && fullName !== 'undefined' ? fullName : 'Profile';

    //tracks whether the dropdown is open and wrapper div which detects clicks outside of it.
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    //closes dropdown when clicking outside of it.
    useEffect(() => {
        const handleDocClick = e => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleDocClick);
        return () => document.removeEventListener('mousedown', handleDocClick);
    }, []);

    //clears the auth data and redirects user to landing page
    const handleLogout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('fullName');
        localStorage.removeItem('token');
        navigate('/');
        setOpen(false);
    };

    //button style used for bookings page.
    const btnBase = {
        padding: '8px 18px',
        border: '1px solid rgba(255,255,255,0.6)',
        borderRadius: 8,
        fontWeight: 600,
        fontSize: 15,
        cursor: 'pointer',
        color: '#000',
        background: 'rgba(255,255,255,0.25)',
        backdropFilter: 'blur(4px)',
        transition: 'background 0.25s, transform 0.15s'
    };

    return (
        <div
            ref={wrapperRef}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 24px',
                background:
                    'linear-gradient(135deg, rgba(106,168,255,0.75) 0%, rgba(176,210,255,0.75) 100%)',
                backdropFilter: 'blur(6px)',
                position: 'relative',
                zIndex: 1000,
                userSelect: 'none'
            }}
        >
            <img
                src="https://previews.us-east-1.widencdn.net/preview/39977711/assets/asset-view/0e314e2d-6729-4171-9332-d3a5a48f18b7/thumbnail/eyJ3Ijo0ODAsImgiOjQ4MCwic2NvcGUiOiJhcHAifQ==?sig.ver=1&sig.keyId=us-east-1.20240821&sig.expires=1745445600&sig=xyKTxA4h23Sr-e_c5uRdn2riPEXQNBr_V0E4xMdU9vQ"
                alt="Logo"
                style={{ height: 42, width: 'auto', objectFit: 'contain' }}
            />

            <button
                style={btnBase}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.4)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                onClick={() => navigate('/bookings')}
            >
                Bookings
            </button>

            <div style={{ position: 'relative' }}>
                <div
                    onClick={() => setOpen(prev => !prev)}
                    style={{ cursor: 'pointer', fontWeight: 700, fontSize: 17, color: '#000', marginLeft: 24 }}
                >
                    {displayName}
                </div>

                {open && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: 6,
                            background: 'rgba(255,255,255,0.9)',
                            borderRadius: 10,
                            minWidth: 160,
                            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                            overflow: 'hidden',
                            backdropFilter: 'blur(4px)',
                            zIndex: 10
                        }}
                    >
                        <Link
                            to="/profile"
                            onClick={() => setOpen(false)}
                            style={{
                                display: 'block',
                                padding: '12px 16px',
                                textDecoration: 'none',
                                color: '#333',
                                fontWeight: 500
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f2f4f8')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            My Bookings
                        </Link>

                        <div
                            onClick={handleLogout}
                            style={{
                                padding: '12px 16px',
                                cursor: 'pointer',
                                color: '#e63946',
                                fontWeight: 500,
                                borderTop: '1px solid #eee'
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#fceaea')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            Logout
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default NavBar;
