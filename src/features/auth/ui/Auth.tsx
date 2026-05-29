import { useState, useEffect, useRef } from 'react';
import { Button } from '../../../shared/ui/button';
import { useAuth } from '../model/useAuth';
import './auth.styles.css';

interface AuthProps {
  open: boolean;
  onToggle: () => void;
}

export const Auth = ({ open, onToggle }: AuthProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        onToggle();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onToggle]);

  useEffect(() => {
    if (!open) {
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name);
      }
      onToggle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка авторизации');
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithGoogle();
      onToggle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка авторизации');
    }
  };

  const userLetter = user?.displayName?.[0]?.toUpperCase() ?? null;

  return (
    <div ref={wrapperRef} className='auth-wrapper'>
      <Button mod={`circle icon ${userLetter ? 'avatar' : 'user'}`} onClick={onToggle}>
        {userLetter}
      </Button>
      <div className={`auth-menu ${open ? '' : 'hidden'}`}>
        {user ? (
          <>
            <p className='auth-menu__user'>{user.displayName ?? user.email}</p>
            <button type='button' className='auth-menu__item' onClick={signOut}>
              Выйти
            </button>
          </>
        ) : (
          <>
            <div className='auth-menu__tabs'>
              <button
                type='button'
                className={`auth-menu__tab ${mode === 'signin' ? 'active' : ''}`}
                onClick={() => setMode('signin')}
              >
                Войти
              </button>
              <button
                type='button'
                className={`auth-menu__tab ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => setMode('signup')}
              >
                Регистрация
              </button>
            </div>
            <form className='auth-menu__form' onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <input
                  className='auth-menu__input'
                  type='text'
                  placeholder='Имя'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              )}
              <input
                className='auth-menu__input'
                type='email'
                placeholder='Email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                className='auth-menu__input'
                type='password'
                placeholder='Пароль'
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              {mode === 'signup' && (
                <input
                  className='auth-menu__input'
                  type='password'
                  placeholder='Подтвердите пароль'
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              )}
              {error && <p className='auth-menu__error'>{error}</p>}
              <button type='submit' className='auth-menu__submit'>
                {mode === 'signin' ? 'Войти' : 'Создать аккаунт'}
              </button>
            </form>
            <button type='button' className='auth-menu__google' onClick={handleGoogle}>
              Войти через Google
            </button>
          </>
        )}
      </div>
    </div>
  );
};
