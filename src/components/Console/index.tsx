import { useState } from 'react';
import './style2.css';

type ConsoleProps = {
  onClick: (key: string) => void
  children: React.ReactNode
}

const Console = ({ onClick, children }: ConsoleProps) => {
  const [ isFilterOpen, setIsFilterOpen ] = useState(false);
  
  return (
    <div className="console">
      <div className="base">
        <div className="monitor">
          <div className="monitor-inner" style={{ width: '100%', height: '100%' }}>
            <div className={`filter-greenscreen ${isFilterOpen ? 'active' : ''}`}>
              <div className={`filter-grayscale ${isFilterOpen ? 'active' : ''}`}>
                { children }
              </div>
            </div>
          </div>
        </div>
        <div className="controller">
          <div className="buttons middle" style={{
            position: 'relative',
            zIndex: '1'
          }}>

            <div className="direction">
              <div className="direction-btn-wrapper top">
                <button className="direction-btn top" onClick={() => {
                  onClick('up')
                }}></button>
              </div>
              <div className="direction-btn-wrapper right">
                <button className="direction-btn right" onClick={() => {
                  onClick('right')
                }}></button>
              </div>
              <div className="direction-btn-wrapper bottom">
                <button className="direction-btn bottom" onClick={() => {
                  onClick('down')
                }}></button>
              </div>
              <div className="direction-btn-wrapper left">
                <button className="direction-btn left" onClick={() => {
                  onClick('left')
                }}></button>
              </div>
            </div>

            <div className="selection">
              <div className="circle-btn-wrapper">
                <button className="circle-btn" onClick={() => {
                  onClick('B')
                }}>
                </button>
              </div>
              <div className="circle-btn-wrapper">
                <button className="circle-btn" onClick={() => {
                  onClick('A')
                }}>
                </button>
              </div>
            </div>
          </div>
          <div className="buttons bottom" style={{
            position: 'relative',
            zIndex: '1'
          }}>
            <div className="circle-btn-wrapper">
              <button className="circle-btn special" onClick={() => {
                onClick('select');
              }}></button>
            </div>
            <div className="circle-btn-wrapper">
              <button className="circle-btn special" onClick={() => {
                onClick('start');
                setIsFilterOpen(!isFilterOpen)
              }}></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Console;