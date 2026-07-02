import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const { activeUser, login, register, showNotification } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (activeUser) {
            navigate('/');
        }
        
        document.body.classList.add('auth-mode');
        return () => {
            document.body.classList.remove('auth-mode');
        };
    }, [activeUser, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cleanEmail = email.trim();
        if (!cleanEmail || !password) return;

        setIsLoading(true);

        if (isRegistering) {
            const cleanUser = username.trim();
            if (!cleanUser) {
                showNotification('Por favor, informe seu nome de atleta.', 'error');
                setIsLoading(false);
                return;
            }
            const result = await register(cleanEmail, password, cleanUser);
            if (result.success) {
                showNotification('Conta criada com sucesso.', 'success');
                navigate('/');
            } else {
                showNotification(`Erro ao registrar: ${result.message}`, 'error');
            }
        } else {
            const result = await login(cleanEmail, password);
            if (result.success) {
                showNotification('Login realizado com sucesso.', 'success');
                navigate('/');
            } else {
                showNotification(`Erro ao entrar: ${result.message}`, 'error');
            }
        }
        
        setIsLoading(false);
    };

    return (
        <main className="app-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <section id="view-auth" style={{ width: '100%', maxWidth: '400px', padding: '20px' }}>
                <div className="auth-container">
                    <div className="auth-header-logo">
                        <h1 className="auth-title">LIGA DO FERRO</h1>
                        <p className="auth-subtitle">CONTROLE DE TREINOS & EVOLUÇÃO</p>
                    </div>
                    
                    <div className="auth-box">
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label style={{ textAlign: 'left', display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600' }}>E-MAIL</label>
                                <input 
                                    type="email" 
                                    placeholder="seu@email.com" 
                                    required 
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            {isRegistering && (
                                <div className="input-group" style={{ marginTop: '16px' }}>
                                    <label style={{ textAlign: 'left', display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600' }}>NOME DO ATLETA</label>
                                    <input 
                                        type="text" 
                                        placeholder="Seu nome ou apelido" 
                                        required 
                                        autoComplete="off"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            )}
                            <div className="input-group" style={{ marginTop: '16px' }}>
                                <label style={{ textAlign: 'left', display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600' }}>SENHA</label>
                                <input 
                                    type="password" 
                                    placeholder="Sua senha" 
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn-primary auth-btn" style={{ marginTop: '24px' }} disabled={isLoading}>
                                {isLoading ? "AGUARDE..." : (isRegistering ? "Criar Conta" : "Entrar")}
                            </button>
                        </form>
                        
                        <p className="auth-switch">
                            {isRegistering ? "Já possui conta? " : "Não tem conta? "}
                            <a 
                                href="#" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsRegistering(!isRegistering);
                                    setEmail('');
                                    setUsername('');
                                    setPassword('');
                                }}
                            >
                                {isRegistering ? "Fazer login" : "Criar conta"}
                            </a>
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Login;
