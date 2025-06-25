import React, { useState, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronRight, Check, Settings, Camera, Video, Clock, Sun, Moon, CalendarDays, GripHorizontal, BatteryFull, BatteryCharging, Power, HardDrive } from 'lucide-react';

// 定義相機的預設設定
const defaultCameraSettings = {
  mode: 'TRAIL CAM',
  photoResolution: '12MP',
  videoResolution: '1920x1080 30fps',
  videoLength: '30s',
  photoDelay: '1s',
  multiShotMode: 'SINGLE',
  tempUnits: 'Fahrenheit',
  cameraName: 'BROWNING CAM',
  imageDataStrip: true,
  motionTest: false,
  motionDetection: 'NORMAL RANGE',
  triggerSpeed: 'NORMAL',
  batteryType: 'Alkaline',
  timeLapseEnabled: false,
  timeLapseFreq: '5s',
  timeLapsePeriod: 'ALL DAY',
  smartIRVideo: false,
  sdManagement: false,
  language: 'English',
  captureTimer: {
    enabled: false,
    startTime: '00:00',
    stopTime: '23:59',
  },
  hdr: false,
  // 模擬日期和時間，使用 Date 物件
  currentDate: new Date(),
};

// 所有設定選單的結構 (Page 4, Table of Contents)
const SETTINGS_MENU_OPTIONS = [
  'SETUP DATE/TIME',
  'OPERATION MODE',
  'PHOTO QUALITY',
  'VIDEO LENGTH',
  'VIDEO QUALITY',
  'PHOTO DELAY',
  'MULTI SHOT MODE',
  'TEMP UNITS',
  'CAMERA NAME',
  'IMAGE DATA STRIP',
  'MOTION TEST',
  'MOTION DETECTION',
  'TRIGGER SPEED',
  'BATTERY TYPE',
  'TIMELAPSE SETTINGS', // 組合 Timelapse Freq 和 Period
  'IR FLASH RANGE',
  'SMART IR VIDEO',
  'SD MANAGEMENT',
  'LANGUAGE',
  'CAPTURE TIMER',
  'HDR',
  'DEFAULT SETTINGS',
  'DELETE ALL',
  'FIRMWARE UPGRADE',
];

// 常用選項的對應值
const PHOTO_RESOLUTIONS = ['4MP', '8MP', '12MP', '24MP'];
const VIDEO_RESOLUTIONS = ['1920x1080 30fps', '1920x1080 60fps']; // High, Ultra
const VIDEO_LENGTHS = ['5s', '10s', '20s', '30s', '1min', '2min'];
const PHOTO_DELAYS = ['1s', '5s', '10s', '20s', '30s', '1min', '5min', '10min', '30min', '60min'];
const MULTI_SHOT_MODES = ['SINGLE', 'MULTI SHOT', 'RAPID FIRE'];
const TEMP_UNITS = ['Fahrenheit', 'Celsius'];
const MOTION_DETECTION_RANGES = ['NORMAL RANGE', 'LONG RANGE'];
const TRIGGER_SPEEDS = ['NORMAL', 'FAST'];
const BATTERY_TYPES = ['Alkaline', 'Lithium', 'Rechargeable'];
const TIMELAPSE_FREQS = ['5s', '10s', '20s', '30s', '1min', '2min', '5min', '10min', '30min', '60min'];
const TIMELAPSE_PERIODS = ['ALL DAY', '1 HOUR', '2 HOUR', '3 HOUR', '4 HOUR'];
const IR_FLASH_RANGES = ['Economy', 'Long Range', 'Fast Motion'];
const LANGUAGES = ['English']; // 手冊中只有英文

// 將日期格式化為 MM/DD/YY
const formatDate = (date) => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  return `${month}/${day}/${year}`;
};

// 將時間格式化為 HH:MM AM/PM
const formatTime = (date) => {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours}:${minutes} ${ampm}`;
};

// LCD 螢幕組件
const LCDScreen = ({ settings, currentScreen, countdown }) => {
  const { mode, photoResolution, videoResolution, videoLength, multiShotMode, batteryType, currentDate, motionTest, sdManagement } = settings;
  const isVideoMode = mode === 'VIDEO';
  const isTimelapsePlusMode = mode === 'TIMELAPSE PLUS';

  // 模擬SD卡已使用/總容量
  const sdCardUsage = '0123/1550';
  const batteryPercentage = '100%'; // 簡化為固定100%

  // 模擬即時影像背景
  const LiveImageMock = () => (
    <div className="absolute inset-0 bg-gray-700 flex items-center justify-center text-gray-500 text-sm overflow-hidden">
      <span className="opacity-50">Live View Mock</span>
      {motionTest && (
        <div className="absolute top-2 right-2 flex items-center text-red-500 animate-pulse">
          <GripHorizontal className="h-4 w-4 mr-1" /> MOTION DETECTED
        </div>
      )}
    </div>
  );

  return (
    <div className="relative w-full h-full bg-gray-800 text-white rounded-lg p-4 font-mono text-xs flex flex-col justify-between overflow-hidden">
      <LiveImageMock />
      <div className="relative z-10 flex flex-col h-full">
        {currentScreen === 'MAIN' && (
          <>
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-bold">MODE: {mode}</span>
              <span className="text-sm font-bold">{countdown !== null ? `00:${countdown.toString().padStart(2, '0')}` : '00:00'}</span>
            </div>
            <div className="text-xs">
              {isVideoMode ? (
                <>
                  <div>Video Resolution {videoResolution}</div>
                  <div>Video Length {videoLength}</div>
                </>
              ) : isTimelapsePlusMode ? (
                <>
                  <div>Timelapse Plus</div>
                  <div>Resolution {photoResolution}</div>
                </>
              ) : (
                <>
                  <div>Resolution {photoResolution}</div>
                  <div>Shot {multiShotMode === 'SINGLE' ? '1' : `${multiShotMode}`}</div>
                </>
              )}
            </div>
            <div className="flex-grow flex items-end justify-between mt-auto text-xs">
              <span>{batteryPercentage}</span>
              <span>{sdCardUsage}</span>
            </div>
          </>
        )}
        {currentScreen === 'SETTINGS_MENU' && (
          <div className="flex flex-col h-full">
            <h2 className="text-base font-bold text-yellow-400 mb-2 border-b border-yellow-400 pb-1">CAMERA SETUP</h2>
            <div className="flex-grow overflow-y-auto custom-scrollbar">
              {SETTINGS_MENU_OPTIONS.map((option, index) => (
                <div key={option} className={`py-1 ${settings.selectedMenuOption === option ? 'bg-blue-600 rounded px-1' : ''}`}>
                  {option}
                </div>
              ))}
            </div>
          </div>
        )}
        {currentScreen === 'SETUP DATE/TIME' && (
          <div className="flex flex-col h-full items-center justify-center">
            <h2 className="text-base font-bold mb-4">SET TIME AND DATE</h2>
            <div className="text-sm">
              <div className="mb-2">DATE {formatDate(currentDate)}</div>
              <div>TIME {formatTime(currentDate)}</div>
            </div>
          </div>
        )}
        {currentScreen === 'OPTION_DETAIL' && settings.selectedMenuOption === 'PHOTO QUALITY' && (
          <div className="flex flex-col h-full items-center justify-center">
            <h2 className="text-base font-bold mb-4">PHOTO QUALITY</h2>
            <div className="text-sm">
              {PHOTO_RESOLUTIONS.map((res, index) => (
                <div key={res} className={`py-1 ${settings.photoResolution === res ? 'bg-blue-600 rounded px-1' : ''}`}>
                  {res}
                </div>
              ))}
            </div>
          </div>
        )}
        {currentScreen === 'OPTION_DETAIL' && settings.selectedMenuOption === 'OPERATION MODE' && (
          <div className="flex flex-col h-full items-center justify-center">
            <h2 className="text-base font-bold mb-4">OPERATION MODE</h2>
            <div className="text-sm">
              {['TRAIL CAM', 'TIMELAPSE PLUS', 'VIDEO'].map((modeOpt) => (
                <div key={modeOpt} className={`py-1 ${settings.mode === modeOpt ? 'bg-blue-600 rounded px-1' : ''}`}>
                  {modeOpt}
                </div>
              ))}
            </div>
          </div>
        )}
         {currentScreen === 'OPTION_DETAIL' && settings.selectedMenuOption === 'VIDEO LENGTH' && (
          <div className="flex flex-col h-full items-center justify-center">
            <h2 className="text-base font-bold mb-4">VIDEO LENGTH</h2>
            <div className="text-sm">
              {VIDEO_LENGTHS.map((len) => (
                <div key={len} className={`py-1 ${settings.videoLength === len ? 'bg-blue-600 rounded px-1' : ''}`}>
                  {len}
                </div>
              ))}
            </div>
          </div>
        )}
        {currentScreen === 'OPTION_DETAIL' && settings.selectedMenuOption === 'SD MANAGEMENT' && (
          <div className="flex flex-col h-full items-center justify-center">
            <h2 className="text-base font-bold mb-4">SD MANAGEMENT</h2>
            <div className="text-sm">
              <div className={`py-1 ${settings.sdManagement === true ? 'bg-blue-600 rounded px-1' : ''}`}>ON</div>
              <div className={`py-1 ${settings.sdManagement === false ? 'bg-blue-600 rounded px-1' : ''}`}>OFF</div>
            </div>
          </div>
        )}
         {currentScreen === 'OPTION_DETAIL' && settings.selectedMenuOption === 'MOTION TEST' && (
          <div className="flex flex-col h-full items-center justify-center">
            <h2 className="text-base font-bold mb-4">MOTION TEST</h2>
            <div className="text-sm">
              <div className={`py-1 ${settings.motionTest === true ? 'bg-blue-600 rounded px-1' : ''}`}>ON</div>
              <div className={`py-1 ${settings.motionTest === false ? 'bg-blue-600 rounded px-1' : ''}`}>OFF</div>
            </div>
          </div>
        )}
        {/* TODO: 添加更多 OPTION_DETAIL 螢幕的顯示邏輯 */}

      </div>
    </div>
  );
};


// 相機主應用程式
const App = () => {
  const [settings, setSettings] = useState(() => {
    // 從 Local Storage 載入設定，如果沒有則使用預設值
    const savedSettings = localStorage.getItem('trailCameraSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultCameraSettings;
  });

  const [currentScreen, setCurrentScreen] = useState('MAIN'); // 'MAIN', 'SETTINGS_MENU', 'OPTION_DETAIL'
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0); // 在 SETTINGS_MENU 中的索引
  const [countdown, setCountdown] = useState(null); // 模擬啟動倒數

  // 儲存設定到 Local Storage
  useEffect(() => {
    localStorage.setItem('trailCameraSettings', JSON.stringify(settings));
  }, [settings]);

  // 處理按鈕點擊事件
  const handleButtonClick = useCallback((buttonType) => {
    setSettings(prevSettings => {
      let newSettings = { ...prevSettings };
      let newSelectedMenuIndex = selectedMenuIndex;
      let newCurrentScreen = currentScreen;

      if (buttonType === 'MODE') {
        if (currentScreen === 'MAIN') {
          newCurrentScreen = 'SETTINGS_MENU';
          // 確保進入設定菜單時選中第一個選項
          newSettings.selectedMenuOption = SETTINGS_MENU_OPTIONS[0];
          setSelectedMenuIndex(0);
        } else if (currentScreen === 'SETTINGS_MENU') {
          newCurrentScreen = 'MAIN';
          newSettings.selectedMenuOption = null; // 清除選中的菜單項
        } else if (currentScreen === 'OPTION_DETAIL') {
          // 從詳細設定返回設定菜單
          newCurrentScreen = 'SETTINGS_MENU';
        }
      } else if (buttonType === 'UP') {
        if (currentScreen === 'SETTINGS_MENU') {
          newSelectedMenuIndex = (selectedMenuIndex - 1 + SETTINGS_MENU_OPTIONS.length) % SETTINGS_MENU_OPTIONS.length;
          newSettings.selectedMenuOption = SETTINGS_MENU_OPTIONS[newSelectedMenuIndex];
          setSelectedMenuIndex(newSelectedMenuIndex);
        } else if (currentScreen === 'OPTION_DETAIL') {
          // 根據當前選中的選項類型，調整其值
          switch (newSettings.selectedMenuOption) {
            case 'PHOTO QUALITY':
              const currentPhotoResIndex = PHOTO_RESOLUTIONS.indexOf(newSettings.photoResolution);
              newSettings.photoResolution = PHOTO_RESOLUTIONS[(currentPhotoResIndex - 1 + PHOTO_RESOLUTIONS.length) % PHOTO_RESOLUTIONS.length];
              break;
            case 'OPERATION MODE':
                const currentModeIndex = ['TRAIL CAM', 'TIMELAPSE PLUS', 'VIDEO'].indexOf(newSettings.mode);
                newSettings.mode = ['TRAIL CAM', 'TIMELAPSE PLUS', 'VIDEO'][(currentModeIndex - 1 + 3) % 3];
                break;
            case 'VIDEO LENGTH':
                const currentVideoLenIndex = VIDEO_LENGTHS.indexOf(newSettings.videoLength);
                newSettings.videoLength = VIDEO_LENGTHS[(currentVideoLenIndex - 1 + VIDEO_LENGTHS.length) % VIDEO_LENGTHS.length];
                break;
            case 'SD MANAGEMENT':
                newSettings.sdManagement = !newSettings.sdManagement; // 切換 ON/OFF
                break;
            case 'MOTION TEST':
                newSettings.motionTest = !newSettings.motionTest; // 切換 ON/OFF
                break;
            case 'SETUP DATE/TIME':
                // 增加日期時間（這裡只做簡單的增加天數示範）
                const newDateUp = new Date(newSettings.currentDate);
                newDateUp.setDate(newDateUp.getDate() + 1);
                newSettings.currentDate = newDateUp;
                break;
            // TODO: 為其他選項添加 UP 按鈕邏輯
            default:
              break;
          }
        }
      } else if (buttonType === 'DOWN') {
        if (currentScreen === 'SETTINGS_MENU') {
          newSelectedMenuIndex = (selectedMenuIndex + 1) % SETTINGS_MENU_OPTIONS.length;
          newSettings.selectedMenuOption = SETTINGS_MENU_OPTIONS[newSelectedMenuIndex];
          setSelectedMenuIndex(newSelectedMenuIndex);
        } else if (currentScreen === 'OPTION_DETAIL') {
          // 根據當前選中的選項類型，調整其值
          switch (newSettings.selectedMenuOption) {
            case 'PHOTO QUALITY':
              const currentPhotoResIndex = PHOTO_RESOLUTIONS.indexOf(newSettings.photoResolution);
              newSettings.photoResolution = PHOTO_RESOLUTIONS[(currentPhotoResIndex + 1) % PHOTO_RESOLUTIONS.length];
              break;
            case 'OPERATION MODE':
                const currentModeIndex = ['TRAIL CAM', 'TIMELAPSE PLUS', 'VIDEO'].indexOf(newSettings.mode);
                newSettings.mode = ['TRAIL CAM', 'TIMELAPSE PLUS', 'VIDEO'][(currentModeIndex + 1) % 3];
                break;
            case 'VIDEO LENGTH':
                const currentVideoLenIndex = VIDEO_LENGTHS.indexOf(newSettings.videoLength);
                newSettings.videoLength = VIDEO_LENGTHS[(currentVideoLenIndex + 1) % VIDEO_LENGTHS.length];
                break;
            case 'SD MANAGEMENT':
                newSettings.sdManagement = !newSettings.sdManagement; // 切換 ON/OFF
                break;
            case 'MOTION TEST':
                newSettings.motionTest = !newSettings.motionTest; // 切換 ON/OFF
                break;
            case 'SETUP DATE/TIME':
                // 減少日期時間（這裡只做簡單的減少天數示範）
                const newDateDown = new Date(newSettings.currentDate);
                newDateDown.setDate(newDateDown.getDate() - 1);
                newSettings.currentDate = newDateDown;
                break;
            // TODO: 為其他選項添加 DOWN 按鈕邏輯
            default:
              break;
          }
        }
      } else if (buttonType === 'ENTER') {
        if (currentScreen === 'SETTINGS_MENU') {
          const selectedOption = newSettings.selectedMenuOption;
          // 對於某些需要詳細調整的選項，切換到 'OPTION_DETAIL' 螢幕
          if (['SETUP DATE/TIME', 'PHOTO QUALITY', 'OPERATION MODE', 'VIDEO LENGTH', 'SD MANAGEMENT', 'MOTION TEST'].includes(selectedOption)) {
            newCurrentScreen = 'OPTION_DETAIL';
          } else if (selectedOption === 'DEFAULT SETTINGS') {
            // 恢復預設設定
            alert('Settings have been reset to default.'); // 模擬提示
            newSettings = defaultCameraSettings;
            newCurrentScreen = 'MAIN'; // 回到主螢幕
          } else if (selectedOption === 'DELETE ALL') {
            // 模擬刪除操作
            alert('All images deleted and SD card reformatted.'); // 模擬提示
            newCurrentScreen = 'MAIN'; // 回到主螢幕
          } else {
             // 對於不需要詳細界面的選項，直接在菜單中確認
            newCurrentScreen = 'SETTINGS_MENU'; // 保持在設定菜單
          }
        } else if (currentScreen === 'OPTION_DETAIL') {
            // 從詳細設定返回設定菜單
            newCurrentScreen = 'SETTINGS_MENU';
        }
        // 如果在主螢幕按 ENTER，則開始倒數
        if (currentScreen === 'MAIN' && countdown === null) {
          setCountdown(30);
        }
      } else if (buttonType === 'RIGHT') {
        // RIGHT 箭頭主要用於日期/時間或相機名稱等輸入型設定，此範例中暫不完全實現複雜的欄位切換邏輯
        // 在 SETUP DATE/TIME 螢幕中，可以模擬切換到下一個日期/時間欄位
        if (currentScreen === 'OPTION_DETAIL' && newSettings.selectedMenuOption === 'SETUP DATE/TIME') {
            // 簡單示範：每次按 RIGHT 都往前推進一個小時
            const newTime = new Date(newSettings.currentDate);
            newTime.setHours(newTime.getHours() + 1);
            newSettings.currentDate = newTime;
        }
      } else if (buttonType === 'POWER_ON') {
        // 開機，開始30秒倒數
        if (countdown === null) {
          setCountdown(30);
        }
      } else if (buttonType === 'POWER_OFF') {
        // 關機，停止倒數
        setCountdown(null);
        setCurrentScreen('MAIN'); // 關機回到主螢幕
      }

      return { ...newSettings, currentScreen: newCurrentScreen };
    });
  }, [settings, currentScreen, selectedMenuIndex, countdown]);

  // 倒數計時器效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCountdown(null); // 倒數結束
    }
  }, [countdown]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-4 font-inter">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 mt-4 md:mt-0">Browning 紅外線相機模擬器</h1>

      <div className="relative bg-gray-600 rounded-3xl shadow-2xl p-6 border-4 border-gray-700 w-full max-w-lg md:max-w-2xl lg:max-w-3xl aspect-video min-h-[400px] flex flex-col items-center justify-center">
        {/* 相機頂部裝飾 */}
        <div className="absolute top-0 w-full h-12 bg-gray-700 rounded-t-2xl flex items-center justify-center -translate-y-full">
          <span className="text-gray-400 text-lg font-bold">BROWNING</span>
        </div>

        {/* 實際的相機身體，包含螢幕和按鈕 */}
        <div className="relative w-full h-full flex flex-col items-center justify-center py-4 px-6 md:px-10">
          {/* LCD 螢幕區 */}
          <div className="w-full h-3/5 bg-gray-900 rounded-lg shadow-inner border-2 border-gray-700 overflow-hidden">
            <LCDScreen settings={settings} currentScreen={currentScreen} countdown={countdown} />
          </div>

          {/* 控制按鈕區 */}
          <div className="w-full flex-grow flex items-center justify-center mt-6">
            {/* 左側功能按鈕 */}
            <div className="flex flex-col items-center mr-8">
              <button
                className="control-button bg-gray-700 text-white p-3 rounded-xl shadow-md hover:bg-gray-800 transition-all duration-200 transform hover:scale-105"
                onClick={() => handleButtonClick('POWER_ON')}
                aria-label="Power On"
              >
                <Power className="w-6 h-6" />
                <span className="text-xs mt-1">ON</span>
              </button>
              <button
                className="control-button bg-gray-700 text-white p-3 rounded-xl shadow-md hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 mt-4"
                onClick={() => handleButtonClick('POWER_OFF')}
                aria-label="Power Off"
              >
                <Power className="w-6 h-6 rotate-180" />
                <span className="text-xs mt-1">OFF</span>
              </button>
            </div>

            {/* 導航按鈕 (UP, DOWN, RIGHT, MODE, ENTER) */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1"></div> {/* Placeholder */}
              <button
                className="control-button bg-blue-600 text-white p-3 rounded-full shadow-md hover:bg-blue-700 transition-all duration-200 transform hover:scale-110"
                onClick={() => handleButtonClick('UP')}
                aria-label="Up"
              >
                <ChevronUp className="w-6 h-6" />
              </button>
              <div className="col-span-1"></div> {/* Placeholder */}

              <button
                className="control-button bg-gray-700 text-white p-3 rounded-full shadow-md hover:bg-gray-800 transition-all duration-200 transform hover:scale-110"
                onClick={() => handleButtonClick('MODE')}
                aria-label="Mode"
              >
                <Settings className="w-6 h-6" />
              </button>
              <button
                className="control-button bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-110"
                onClick={() => handleButtonClick('ENTER')}
                aria-label="Enter"
              >
                <Check className="w-8 h-8" />
              </button>
              <button
                className="control-button bg-gray-700 text-white p-3 rounded-full shadow-md hover:bg-gray-800 transition-all duration-200 transform hover:scale-110"
                onClick={() => handleButtonClick('RIGHT')}
                aria-label="Right"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="col-span-1"></div> {/* Placeholder */}
              <button
                className="control-button bg-blue-600 text-white p-3 rounded-full shadow-md hover:bg-blue-700 transition-all duration-200 transform hover:scale-110"
                onClick={() => handleButtonClick('DOWN')}
                aria-label="Down"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
              <div className="col-span-1"></div> {/* Placeholder */}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Share+Tech+Mono&display=swap');

        .font-inter {
          font-family: 'Inter', sans-serif;
        }

        .font-mono {
          font-family: 'Share Tech Mono', monospace; /* 模擬 LCD 字體 */
        }

        .control-button {
          min-width: 60px;
          min-height: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem; /* text-xs */
          line-height: 1;
        }

        /* Custom Scrollbar for Settings Menu */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #333;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #555;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #777;
        }
      `}</style>
    </div>
  );
};

export default App;