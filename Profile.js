import React, { useState, useEffect } from 'react';

function Profile() {
    //fetches auth token from local storage for the API call.
    const token = localStorage.getItem('token');
    const [userBookings, setUserBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [animatingId, setAnimatingId] = useState(null);

    //gets username and fullname from local storage.
    useEffect(() => {
        const u = localStorage.getItem('username');
        const f = localStorage.getItem('fullName');
        if (u) setUsername(u);
        if (f && f !== 'undefined') setFullName(f);
    }, []);

    //spin animations.
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
        @keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
        @keyframes redSweep{0%{background:linear-gradient(145deg,#0077be 0%,#003f5c 100%);color:#fff}100%{background:#d62828;color:#fff}}`;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    //spinner animation during loading.
    const spinner = (
        <div
            style={{
                border: '6px solid rgba(255,255,255,0.2)',
                borderTop: '6px solid #29abe2',
                borderRadius: '50%',
                width: 50,
                height: 50,
                animation: 'spin 1s linear infinite',
                margin: '80px auto'
            }}
        />
    );

    //fetches username bookings whenever username, token is set
    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const resp = await fetch(
                    `http://127.0.0.1:5000/user_bookings?userName=${username}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const data = await resp.json();
                if (resp.ok) {
                    const now = new Date();
                    const active = [];
                    const expiredIds = [];
                    //seperates active vs expired bookings.
                    data.bookings.forEach(b => {
                        const dt = new Date(`${b.bookingDate}T${b.bookingTime}:00`);
                        dt > now ? active.push(b) : expiredIds.push(b._id);
                    });
                    //updates
                    setUserBookings(active);
                    //cleans expired bookings in backend.
                    if (expiredIds.length) {
                        await Promise.all(
                            expiredIds.map(id =>
                                fetch(`http://127.0.0.1:5000/bookings/${id}`, {
                                    method: 'DELETE',
                                    headers: { Authorization: `Bearer ${token}` }
                                })
                            )
                        );
                    }
                } else setError(data.error || 'Error.');
            } catch {
                setError('Error.');
            } finally {
                setLoading(false);
            }
        };
        if (username) fetchBookings();
    }, [username, token]);

    //delete a single booking with animation delay.
    const deleteBooking = async id => {
        setAnimatingId(id);
        setTimeout(async () => {
            try {
                const resp = await fetch(`http://127.0.0.1:5000/bookings/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (resp.ok)
                    //removes from ui list.
                    setUserBookings(prev => prev.filter(b => b._id !== id));
            } catch {}
            setAnimatingId(null);
        }, 900);
    };

    //base styles for each booking card/
    const cardBase = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 22,
        borderRadius: '14px 14px 40px 40px',
        background: 'linear-gradient(145deg,#0077be 0%,#003f5c 100%)',
        color: '#fff',
        marginBottom: 18,
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        transition: 'transform 0.12s'
    };

    return (
        <div
            style={{
                backgroundImage:
                    'url("https://bpb-us-e1.wpmucdn.com/sites.nova.edu/dist/c/2/files/2016/01/DSC_00371.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '100vh',
                position: 'relative'
            }}
        >
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }}></div>

            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: 900,
                    margin: '0 auto',
                    padding: '40px 24px'
                }}
            >
                <h1 style={{ textAlign: 'center', marginBottom: 30, fontSize: 36, color: '#fff' }}>
                    {fullName ? `${fullName}'s Bookings` : 'My Bookings'}
                </h1>

                {loading ? (
                    spinner
                ) : error ? (
                    <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
                ) : userBookings.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#fff', fontSize: 18 }}>
                        No bookings found.
                    </p>
                ) : (
                    userBookings.map(b => {
                        const deleting = animatingId === b._id;
                        return (
                            <div
                                key={b._id}
                                style={{
                                    ...cardBase,
                                    animation: deleting ? 'redSweep 0.9s forwards' : undefined
                                }}
                            >
                                {deleting ? (
                                    <div style={{ width: '100%', textAlign: 'center', fontSize: 20 }}>
                                        Deleting...
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ lineHeight: 1.4 }}>
                                            <p style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                                                🦈 {b.room} | Floor {b.floor}
                                            </p>
                                            <p style={{ margin: 0, fontSize: 17 }}>
                                                {b.bookingDate} at {b.bookingTime}
                                            </p>
                                            <p style={{ margin: 0, fontSize: 15 }}>
                                                For: {b.fullName || b.userName}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => deleteBooking(b._id)}
                                            style={{
                                                background: 'rgba(255,255,255,0.25)',
                                                border: '1px solid rgba(255,255,255,0.6)',
                                                color: '#fff',
                                                borderRadius: 8,
                                                padding: '8px 14px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                backdropFilter: 'blur(4px)'
                                            }}
                                            onMouseEnter={e =>
                                                (e.currentTarget.style.background =
                                                    'rgba(255,255,255,0.4)')
                                            }
                                            onMouseLeave={e =>
                                                (e.currentTarget.style.background =
                                                    'rgba(255,255,255,0.25)')
                                            }
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default Profile;
