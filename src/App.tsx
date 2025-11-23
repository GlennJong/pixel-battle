import Console from '@/components/Console'
import Wrapper from '@/components/Wrapper';
import GameScene from '@/components/GameScene';
import { EventBus } from '@/game/EventBus';
import './App.css'
import { useEffect, useState } from 'react';
import { ModalBox } from './components/ModalBox';


async function postData(data: { name: string; content: string }) {
  const url = 'https://script.google.com/macros/s/AKfycbxI1QK1DhjOQQARkiEx2iNLUBYRsvTLHbvJTzeCiLpKUB4GeinC4jkN6vMWmKVue1B6/exec';
  fetch(url, {
    method: 'POST',
    body: JSON.stringify({data}),
  });
}


function App() {
  const [inputs, setInputs] = useState<string[]>([]);
  const [isInfoDisplay, setIsInfoDisplay] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsInfoDisplay(true);
    window.addEventListener('game-finish', handler);
    return () => window.removeEventListener('game-finish', handler);
  }, []);

  useEffect(() => {
    if (inputs.length < 9) return;
    if (inputs.slice(-9).join('') === '^^vv<><>B') {
      EventBus.emit('game-preinput-secret-mode');
    }
    else if (inputs.slice(-10).join('') === '^^vv<><>BA') {
      EventBus.emit('game-input-secret-mode');
    }
    else {
      EventBus.emit('game-cancel-secret-mode');
    }
  }, [inputs])
  
  return (
    <Wrapper>
      <ModalBox
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (name, content) => {
          await postData({name, content});
        }}
      />
      <div style={{
        maxWidth: '480px',
        width: '100%',
        height: '100%',
        margin: 'auto',
        overflow: 'hidden',
        boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.5)'
      }}>
        <Console
          onClick={(key) => {
            if (key === 'up') {
              EventBus.emit('game-up-keydown');
              setInputs([...inputs, '^'].slice(-10));
            }
            else if (key === 'down') {
              EventBus.emit('game-down-keydown');
              setInputs([...inputs, 'v'].slice(-10));
            }
            else if (key === 'left') {
              setInputs([...inputs, '<'].slice(-10));
            }
            else if (key === 'right') {
              setInputs([...inputs, '>'].slice(-10));
            }
            else if (key === 'A') {
              EventBus.emit('game-select-keydown');
              setInputs([...inputs, 'A'].slice(-10));
            }
            else if (key === 'B') {
              setInputs([...inputs, 'B'].slice(-10));
            }
            else if (key === 'select') {
              setIsInfoDisplay(!isInfoDisplay);
            }
          }}
        >
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '0',
            paddingBottom: '90%',
          }}>
            <GameScene />
            { isInfoDisplay &&
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                gap: '24px',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.8)'
              }}>
                <a
                  className="link"
                  href="https://www.twitch.tv/jenniecongee"
                  target="_blank"
                >
                  <img src="./assets/twitch-tile.svg" alt="" />
                  <span>jenniecongee</span>
                </a>
                <div className="link"
                  onClick={() => setIsModalOpen(!isModalOpen)}
                >
                  <img className="pencil" src="./assets/pen-solid-full.svg" alt="" />
                  <span>feedback</span>
                </div>
              </div>
            }
          </div>
        </Console>
      </div>
    </Wrapper>
  )
}

export default App
