import React, { useState } from 'react';
import { frame } from './Frame';

interface ModalBoxProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, content: string) => void;
}

export const ModalBox: React.FC<ModalBoxProps> = ({ isOpen, onClose, onSubmit }) => {
  const [isSending, setIsSending] = useState(false);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          padding: '2rem',
          minWidth: '300px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          borderImage: `url(${frame})`,
          borderImageSlice: '49% 49% fill',
          borderImageWidth: '32px',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{
          color: '#000'
        }}>回饋</h2>
        <div style={{ marginBottom: '1rem' }}>
          <label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: '100%',
              }}
              placeholder="請輸入您的名字"
            />
          </label>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              style={{ width: '100%', minHeight: '80px' }}
              placeholder="請輸入您的意見"
            />
          </label>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            style={{
              border: 'none',
              background: '#6441a5',
              color: '#fff',
              padding: '12px',
              width: '100%',
              fontFamily: 'BoutiqueBitmap'
            }}
            onClick={async () => {
              setIsSending(true);
              await onSubmit(name, content);
              setName('');
              setContent('');
              setIsSending(false);
              onClose();
            }}
            disabled={!name || !content || isSending}
          >{
            isSending ? '送出中...' : '送出'
          }</button>
        </div>
      </div>
    </div>
  );
};
