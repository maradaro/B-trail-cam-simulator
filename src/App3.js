import React, { useState, useEffect, useCallback } from 'react';
import { Camera, Video, Clock, Sun, Moon, CalendarDays, GripHorizontal, BatteryFull, BatteryCharging, Thermometer, Info, Target, Zap, Gauge, Languages, Timer, ImagePlus, RefreshCcw, HardDrive } from 'lucide-react'; // 僅保留用於顯示的圖示

// 定義相機的預設設定 (值為英文，顯示時標籤會補中文)
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
  irFlashRange: 'Economy',
  sdManagement: false,
  language: 'English',
  captureTimer: {
    enabled: false,
    startTime: '19:00', // 預設 7 PM
    stopTime: '05:00',  // 預設 5 AM
  },
  hdr: false,
  // 模擬日期和時間，設定為1970年1月1日0時0分 (台灣時間, UTC+8)
  // Date.UTC(year, monthIndex, day, hours, minutes, seconds)
  // 1970/01/01 00:00 TST (UTC+8) 等同於 1969/12/31 16:00 UTC
  currentDate: new Date(Date.UTC(1969, 11, 31, 16, 0, 0)),
};

// 各選項的對應值 (僅英文)
const CAMERA_MODES = ['TRAIL CAM', 'TIMELAPSE PLUS', 'VIDEO'];
const PHOTO_RESOLUTIONS = ['4MP', '8MP', '12MP', '24MP'];
const VIDEO_RESOLUTIONS = ['1920x1080 30fps', '1920x1080 60fps'];
const VIDEO_LENGTHS = ['5s', '10s', '20s', '30s', '1min', '2min'];
const PHOTO_DELAYS = ['1s', '5s', '10s', '20s', '30s', '1min', '5min', '10min', '30min', '60min'];
const MULTI_SHOT_MODES = ['SINGLE', 'MULTI SHOT (2-8 shots)', 'RAPID FIRE (2-8 shots)'];
const TEMP_UNITS = ['Fahrenheit', 'Celsius'];
const MOTION_DETECTION_RANGES = ['NORMAL RANGE (60ft)', 'LONG RANGE (100ft)'];
const TRIGGER_SPEEDS = ['NORMAL (0.7s)', 'FAST (0.1s)'];
const BATTERY_TYPES = ['Alkaline', 'Lithium', 'Rechargeable'];
const TIMELAPSE_FREQS = ['5s', '10s', '20s', '30s', '1min', '2min', '5min', '10min', '30min', '60min'];
const TIMELAPSE_PERIODS = ['ALL DAY', '1 HOUR', '2 HOUR', '3 HOUR', '4 HOUR'];
const IR_FLASH_RANGES = ['Economy', 'Long Range', 'Fast Motion'];
const LANGUAGES = ['English'];

// 將日期格式化為YYYY/MM/DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
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

// LCD 螢幕組件 (現在作為儀表板顯示所有設定)
const LCDScreen = ({ settings }) => {
  const {
    mode, photoResolution, videoResolution, videoLength, multiShotMode, currentDate, motionTest, sdManagement,
    tempUnits, cameraName, imageDataStrip, motionDetection, triggerSpeed, batteryType, photoDelay,
    timeLapseEnabled, timeLapseFreq, timeLapsePeriod, smartIRVideo, irFlashRange,
    language, captureTimer, hdr
  } = settings;

  // 模擬SD卡已使用/總容量
  const sdCardUsage = '0123/1550';
  const batteryPercentage = '100%'; // 簡化為固定100%

  // 模擬即時影像背景
  const LiveImageMock = () => (
    <div className="absolute inset-0 bg-gray-700 flex items-center justify-center text-gray-500 text-sm overflow-hidden">
      <span className="opacity-50">Live View Mock</span>
      {motionTest && (
        <div className="absolute top-2 right-2 flex items-center text-red-500 animate-pulse">
          <GripHorizontal className="h-4 w-4 mr-1" /> 動作偵測!
        </div>
      )}
    </div>
  );

  return (
    <div className="relative w-full h-full bg-gray-800 text-white rounded-lg p-4 font-mono text-xs flex flex-col justify-between overflow-hidden">
      <LiveImageMock /> {/* 即時影像模擬背景 */}
      <div className="relative z-10 flex flex-col h-full p-2"> {/* 移除 overflow-y-auto custom-scrollbar */}
        <h2 className="text-base font-bold text-yellow-400 mb-3 border-b border-yellow-400 pb-1 text-center">相機狀態總覽</h2>

        {/* 調整後的電量、SD卡、日期時間顯示區塊 */}
        <div className="text-lg mb-3 flex justify-between items-center w-full flex-wrap"> {/* Adjusted font size to text-lg and added flex-wrap for responsiveness */}
            <span className="mr-4">SD 卡: {sdCardUsage}</span> {/* Moved SD Card first */}
            <span className="mr-4">{formatDate(currentDate)} {formatTime(currentDate)}</span> {/* Moved Time second */}
            <span>電量: {batteryPercentage}</span> {/* Moved Battery third */}
        </div>
        <div className="border-b-2 border-yellow-400 w-full mb-3"></div> {/* Increased border thickness and changed color to yellow */}


        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="col-span-2 flex justify-between">
            <span>模式:</span>
            <span className="font-bold text-green-300">{mode}</span>
          </div>
          {mode.includes('VIDEO') ? ( // 檢查是否為影片模式 (英文模式名也包含 'VIDEO')
            <>
              <div className="col-span-2 flex justify-between">
                <span>影片解析度:</span>
                <span className="font-bold">{videoResolution}</span>
              </div>
              <div className="col-span-2 flex justify-between">
                <span>影片長度:</span>
                <span className="font-bold">{videoLength}</span>
              </div>
            </>
          ) : ( // 非影片模式顯示照片相關
            <div className="col-span-2 flex justify-between">
              <span>照片品質:</span>
              <span className="font-bold">{photoResolution}</span>
            </div>
          )}
          <div className="col-span-2 flex justify-between">
            <span>多重拍攝:</span>
            <span className="font-bold">{multiShotMode}</span>
          </div>
          <div className="col-span-2 flex justify-between">
            <span>照片延遲:</span>
            <span className="font-bold">{photoDelay}</span>
          </div>
          <div className="col-span-2 flex justify-between">
            <span>動作偵測:</span>
            <span className="font-bold">{motionDetection}</span>
          </div>
          <div className="col-span-2 flex justify-between">
            <span>觸發速度:</span>
            <span className="font-bold">{triggerSpeed}</span>
          </div>
          <div className="col-span-2 flex justify-between">
            <span>溫度單位:</span>
            <span className="font-bold">{tempUnits}</span>
          </div>
          <div className="col-span-2 flex justify-between">
            <span>SD 卡管理:</span>
            <span className={`font-bold ${sdManagement ? 'text-green-400' : 'text-red-400'}`}>{sdManagement ? 'ON' : 'OFF'}</span>
          </div>
          <div className="col-span-2 flex justify-between">
            <span>影像資料條:</span>
            <span className={`font-bold ${imageDataStrip ? 'text-green-400' : 'text-red-400'}`}>{imageDataStrip ? 'ON' : 'OFF'}</span>
          </div>
          <div className="col-span-2 flex justify-between">
            <span>電池類型:</span>
            <span className="font-bold">{batteryType}</span>
          </div>
          <div className="col-span-2 flex justify-between">
            <span>IR 閃光範圍:</span>
            <span className="font-bold">{irFlashRange}</span>
          </div>
          <div className="col-span-2 flex justify-between">
            <span>智慧紅外線影片:</span>
            <span className={`font-bold ${smartIRVideo ? 'text-green-400' : 'text-red-400'}`}>{smartIRVideo ? 'ON' : 'OFF'}</span>
          </div>
          <div className="col-span-2 flex justify-between">
            <span>HDR:</span>
            <span className="font-bold">{hdr ? 'ON' : 'OFF'}</span>
          </div>
          <div className="col-span-2 flex justify-between">
            <span>語言:</span>
            <span className="font-bold">{language}</span>
          </div>
          <div className="col-span-2 flex justify-between">
            <span>相機名稱:</span>
            <span className="font-bold">{cameraName}</span>
          </div>

          <div className="col-span-2 mt-4 border-t border-gray-700 pt-2">
            <h3 className="font-bold text-blue-300">縮時攝影設定</h3>
            <div className="flex justify-between">
              <span>啟用:</span>
              <span className={`font-bold ${timeLapseEnabled ? 'text-green-400' : 'text-red-400'}`}>{timeLapseEnabled ? 'ON' : 'OFF'}</span>
            </div>
            <div className="flex justify-between">
              <span>頻率:</span>
              <span className="font-bold">{timeLapseFreq}</span>
            </div>
            <div className="flex justify-between">
              <span>時段:</span>
              <span className="font-bold">{timeLapsePeriod}</span>
            </div>
          </div>

          <div className="col-span-2 mt-4 border-t border-gray-700 pt-2">
            <h3 className="font-bold text-blue-300">拍攝定時器</h3>
            <div className="flex justify-between">
              <span>啟用:</span>
              <span className={`font-bold ${captureTimer.enabled ? 'text-green-400' : 'text-red-400'}`}>{captureTimer.enabled ? 'ON' : 'OFF'}</span>
            </div>
            <div className="flex justify-between">
              <span>開始時間:</span>
              <span className="font-bold">{captureTimer.startTime}</span>
            </div>
            <div className="flex justify-between">
              <span>結束時間:</span>
              <span className="font-bold">{captureTimer.stopTime}</span>
            </div>
          </div>
        </div>

        {/* 底部信息 (已移動到上方) */}
      </div>
    </div>
  );
};


// 設置控制面板組件
const SettingsControlPanel = ({ settings, setSettings }) => {
  // 本地狀態來處理時間調整的下拉選單值
  const [tempYear, setTempYear] = useState(settings.currentDate.getFullYear());
  const [tempMonth, setTempMonth] = useState(settings.currentDate.getMonth() + 1);
  const [tempDay, setTempDay] = useState(settings.currentDate.getDate());
  const [tempHour, setTempHour] = useState(settings.currentDate.getHours());
  const [tempMinute, setTempMinute] = useState(settings.currentDate.getMinutes());

  // 移除了監聽 settings.currentDate 變化以同步時間調整下拉選單的 useEffect
  // 這樣用戶在選擇時，值就不會被實時的 current Date 更新覆蓋而「跳掉」

  const handleChange = (e) => {
    const { name, value } = e.target; // 移除了 type, checked 因為不再直接使用

    setSettings(prevSettings => {
      let newSettings = { ...prevSettings };

      // 處理布林值設定
      if (['timeLapseEnabled', 'smartIRVideo', 'sdManagement', 'imageDataStrip', 'motionTest', 'hdr', 'captureTimerEnabled'].includes(name)) {
        if (name === 'captureTimerEnabled') {
          newSettings.captureTimer = {
            ...newSettings.captureTimer,
            enabled: value === 'true'
          };
        } else {
          newSettings[name] = value === 'true';
        }
      } else {
        // 處理其他一般設定
        newSettings[name] = value;
      }
      return newSettings;
    });
  };

  const handleConfirmTime = () => {
    const newDate = new Date(tempYear, tempMonth - 1, tempDay, tempHour, tempMinute);
    if (isNaN(newDate.getTime())) {
        alert("請選擇一個有效的日期和時間！");
        return;
    }
    setSettings(prevSettings => ({
      ...prevSettings,
      currentDate: newDate,
    }));
    alert("時間已更新！");
  };

  const handleResetDefaults = () => {
    if (window.confirm("確定要恢復所有預設設定嗎？")) {
      setSettings(defaultCameraSettings);
      alert("設定已恢復為預設值。");
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm("確定要刪除所有圖片並格式化 SD 卡嗎？這操作無法復原！")) {
      alert("所有圖片已刪除，SD 卡已格式化。");
    }
  };

  const handleFirmwareUpgrade = () => {
    alert("韌體已是最新版本，無需升級。");
  };

  // 生成年份選項 (例如從當前年份前5年到後5年)
  const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i);
  // 生成月份選項 (1-12)
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  // 生成日期選項 (動態根據月份和年份)
  const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
  const days = Array.from({ length: getDaysInMonth(tempYear, tempMonth) }, (_, i) => i + 1);
  // 生成小時選項 (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  // 生成分鐘選項 (0-59)
  const minutes = Array.from({ length: 60 }, (_, i) => i);


  return (
    <div className="p-6 bg-gray-700 rounded-lg shadow-inner w-full overflow-y-auto custom-scrollbar h-full">
      <h2 className="text-xl font-bold text-blue-300 mb-4 text-center">調整相機設定</h2>

      {/* 時間調整區塊 */}
      <div className="border-b border-gray-600 pt-4 mb-4">
        <h3 className="text-lg font-bold text-blue-200 mb-2">時間調整 (Time Adjustment)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
          <div>
            <label htmlFor="year" className="block text-gray-200 text-sm font-bold mb-1">年 (Year):</label>
            <select id="year" value={tempYear} onChange={(e) => setTempYear(parseInt(e.target.value))}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="month" className="block text-gray-200 text-sm font-bold mb-1">月 (Month):</label>
            <select id="month" value={tempMonth} onChange={(e) => setTempMonth(parseInt(e.target.value))}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="day" className="block text-gray-200 text-sm font-bold mb-1">日 (Day):</label>
            <select id="day" value={tempDay} onChange={(e) => setTempDay(parseInt(e.target.value))}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="hour" className="block text-gray-200 text-sm font-bold mb-1">時 (Hour):</label>
            <select id="hour" value={tempHour} onChange={(e) => setTempHour(parseInt(e.target.value))}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
              {hours.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="minute" className="block text-gray-200 text-sm font-bold mb-1">分 (Minute):</label>
            <select id="minute" value={tempMinute} onChange={(e) => setTempMinute(parseInt(e.target.value))}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
              {minutes.map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
            </select>
          </div>
        </div>
        <button
          className="w-full bg-blue-600 text-white p-3 rounded-md shadow-md hover:bg-blue-700 transition-all duration-200 flex items-center justify-center font-bold mb-4"
          onClick={handleConfirmTime}
        >
          確定時間 (Confirm Time)
        </button>
      </div>


      <div className="grid grid-cols-1 gap-4">
        {/* 操作模式 */}
        <div>
          <label htmlFor="mode" className="block text-gray-200 text-sm font-bold mb-1">操作模式 (Operation Mode):</label>
          <select id="mode" name="mode" value={settings.mode} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            {CAMERA_MODES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* 照片品質 */}
        <div>
          <label htmlFor="photoResolution" className="block text-gray-200 text-sm font-bold mb-1">照片品質 (Photo Quality):</label>
          <select id="photoResolution" name="photoResolution" value={settings.photoResolution} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            {PHOTO_RESOLUTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* 影片解析度 */}
        <div>
          <label htmlFor="videoResolution" className="block text-gray-200 text-sm font-bold mb-1">影片解析度 (Video Resolution):</label>
          <select id="videoResolution" name="videoResolution" value={settings.videoResolution} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            {VIDEO_RESOLUTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* 影片長度 */}
        <div>
          <label htmlFor="videoLength" className="block text-gray-200 text-sm font-bold mb-1">影片長度 (Video Length):</label>
          <select id="videoLength" name="videoLength" value={settings.videoLength} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            {VIDEO_LENGTHS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* 照片延遲 */}
        <div>
          <label htmlFor="photoDelay" className="block text-gray-200 text-sm font-bold mb-1">照片延遲 (Photo Delay):</label>
          <select id="photoDelay" name="photoDelay" value={settings.photoDelay} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            {PHOTO_DELAYS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* 多重拍攝模式 */}
        <div>
          <label htmlFor="multiShotMode" className="block text-gray-200 text-sm font-bold mb-1">多重拍攝模式 (Multi Shot Mode):</label>
          <select id="multiShotMode" name="multiShotMode" value={settings.multiShotMode} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            {MULTI_SHOT_MODES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* 溫度單位 */}
        <div>
          <label htmlFor="tempUnits" className="block text-gray-200 text-sm font-bold mb-1">溫度單位 (Temp Units):</label>
          <select id="tempUnits" name="tempUnits" value={settings.tempUnits} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            {TEMP_UNITS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* 影像資料條 */}
        <div>
          <label htmlFor="imageDataStrip" className="block text-gray-200 text-sm font-bold mb-1">影像資料條 (Image Data Strip):</label>
          <select id="imageDataStrip" name="imageDataStrip" value={settings.imageDataStrip} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            <option value="true">ON</option>
            <option value="false">OFF</option>
          </select>
        </div>

        {/* 動作測試 */}
        <div>
          <label htmlFor="motionTest" className="block text-gray-200 text-sm font-bold mb-1">動作測試 (Motion Test):</label>
          <select id="motionTest" name="motionTest" value={settings.motionTest} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            <option value="true">ON</option>
            <option value="false">OFF</option>
          </select>
        </div>

        {/* 動作偵測 */}
        <div>
          <label htmlFor="motionDetection" className="block text-gray-200 text-sm font-bold mb-1">動作偵測 (Motion Detection):</label>
          <select id="motionDetection" name="motionDetection" value={settings.motionDetection} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            {MOTION_DETECTION_RANGES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* 觸發速度 */}
        <div>
          <label htmlFor="triggerSpeed" className="block text-gray-200 text-sm font-bold mb-1">觸發速度 (Trigger Speed):</label>
          <select id="triggerSpeed" name="triggerSpeed" value={settings.triggerSpeed} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            {TRIGGER_SPEEDS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* 電池類型 */}
        <div>
          <label htmlFor="batteryType" className="block text-gray-200 text-sm font-bold mb-1">電池類型 (Battery Type):</label>
          <select id="batteryType" name="batteryType" value={settings.batteryType} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            {BATTERY_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* 紅外線閃光範圍 */}
        <div>
          <label htmlFor="irFlashRange" className="block text-gray-200 text-sm font-bold mb-1">紅外線閃光範圍 (IR Flash Range):</label>
          <select id="irFlashRange" name="irFlashRange" value={settings.irFlashRange} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            {IR_FLASH_RANGES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* 智慧紅外線影片 */}
        <div>
          <label htmlFor="smartIRVideo" className="block text-gray-200 text-sm font-bold mb-1">智慧紅外線影片 (Smart IR Video):</label>
          <select id="smartIRVideo" name="smartIRVideo" value={settings.smartIRVideo} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            <option value="true">ON</option>
            <option value="false">OFF</option>
          </select>
        </div>

        {/* SD 卡管理 */}
        <div>
          <label htmlFor="sdManagement" className="block text-gray-200 text-sm font-bold mb-1">SD 卡管理 (SD Management):</label>
          <select id="sdManagement" name="sdManagement" value={settings.sdManagement} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            <option value="true">ON</option>
            <option value="false">OFF</option>
          </select>
        </div>

        {/* 語言 */}
        <div>
          <label htmlFor="language" className="block text-gray-200 text-sm font-bold mb-1">語言 (Language):</label>
          <select id="language" name="language" value={settings.language} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            {LANGUAGES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* HDR */}
        <div>
          <label htmlFor="hdr" className="block text-gray-200 text-sm font-bold mb-1">HDR (High Dynamic Range):</label>
          <select id="hdr" name="hdr" value={settings.hdr} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            <option value="true">ON</option>
            <option value="false">OFF</option>
          </select>
        </div>

        {/* 縮時攝影設定 */}
        <div className="border-t border-gray-600 pt-4 mt-4">
          <h3 className="text-lg font-bold text-blue-200 mb-2">縮時攝影設定 (Timelapse Settings)</h3>
          <div>
            <label htmlFor="timeLapseEnabled" className="block text-gray-200 text-sm font-bold mb-1">啟用 (Enabled):</label>
            <select id="timeLapseEnabled" name="timeLapseEnabled" value={settings.timeLapseEnabled} onChange={handleChange}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
              <option value="true">ON</option>
              <option value="false">OFF</option>
            </select>
          </div>
          {settings.timeLapseEnabled && (
            <>
              <div className="mt-2">
                <label htmlFor="timeLapseFreq" className="block text-gray-200 text-sm font-bold mb-1">頻率 (Frequency):</label>
                <select id="timeLapseFreq" name="timeLapseFreq" value={settings.timeLapseFreq} onChange={handleChange}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
                  {TIMELAPSE_FREQS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="mt-2">
                <label htmlFor="timeLapsePeriod" className="block text-gray-200 text-sm font-bold mb-1">時段 (Period):</label>
                <select id="timeLapsePeriod" name="timeLapsePeriod" value={settings.timeLapsePeriod} onChange={handleChange}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
                  {TIMELAPSE_PERIODS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </>
          )}
        </div>

        {/* 拍攝定時器 */}
        <div className="border-t border-gray-600 pt-4 mt-4">
          <h3 className="text-lg font-bold text-blue-200 mb-2">拍攝定時器 (Capture Timer)</h3>
          <div>
            <label htmlFor="captureTimerEnabled" className="block text-gray-200 text-sm font-bold mb-1">啟用 (Enabled):</label>
            <select id="captureTimerEnabled" name="captureTimerEnabled" value={settings.captureTimer.enabled} onChange={handleChange}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
              <option value="true">ON</option>
              <option value="false">OFF</option>
            </select>
          </div>
          {settings.captureTimer.enabled && (
            <div className="mt-2 text-gray-300 text-sm">
              <p>開始時間: {settings.captureTimer.startTime}</p>
              <p>結束時間: {settings.captureTimer.stopTime}</p>
              <p className="text-xs text-gray-400">(時間固定，無法更改)</p>
            </div>
          )}
        </div>

        {/* 其他功能按鈕 */}
        <div className="mt-6 space-y-3">
          <button
            className="w-full bg-red-600 text-white p-3 rounded-md shadow-md hover:bg-red-700 transition-all duration-200 flex items-center justify-center font-bold"
            onClick={handleResetDefaults}
          >
            <RefreshCcw className="w-5 h-5 mr-2" /> 恢復預設設定 (Reset Defaults)
          </button>
          <button
            className="w-full bg-red-800 text-white p-3 rounded-md shadow-md hover:bg-red-900 transition-all duration-200 flex items-center justify-center font-bold"
            onClick={handleDeleteAll}
          >
            <HardDrive className="w-5 h-5 mr-2" /> 刪除所有檔案 (Delete All)
          </button>
          <button
            className="w-full bg-blue-800 text-white p-3 rounded-md shadow-md hover:bg-blue-900 transition-all duration-200 flex items-center justify-center font-bold"
            onClick={handleFirmwareUpgrade}
          >
            <Info className="w-5 h-5 mr-2" /> 韌體升級 (Firmware Upgrade)
          </button>
        </div>
      </div>
    </div>
  );
};

// 相機主應用程式
const App = () => {
  const [settings, setSettings] = useState(() => {
    // 從 Local Storage 載入設定，如果沒有則使用預設值
    const savedSettings = localStorage.getItem('trailCameraSettings');
    // 解析 currentDate 為 Date 物件
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      parsedSettings.currentDate = new Date(parsedSettings.currentDate); // 確保是 Date 物件
      return parsedSettings;
    }
    return defaultCameraSettings;
  });

  // 儲存設定到 Local Storage
  useEffect(() => {
    localStorage.setItem('trailCameraSettings', JSON.stringify(settings));
  }, [settings]);

  // 新增：每秒更新 currentDate 狀態
  useEffect(() => {
    const timerId = setInterval(() => {
      setSettings(prevSettings => {
        const newDate = new Date(prevSettings.currentDate);
        newDate.setSeconds(newDate.getSeconds() + 1); // 每秒增加1秒
        return {
          ...prevSettings,
          currentDate: newDate,
        };
      });
    }, 1000); // 每1000毫秒 (1秒) 更新一次

    // 清理函數：組件卸載時清除定時器
    return () => clearInterval(timerId);
  }, []); // 空依賴陣列表示只在組件掛載和卸載時運行一次

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-4 font-inter">
      <h1 className="text-3xl font-bold text-gray-800 mb-2 mt-4 md:mt-0 text-center">Browning 紅外線相機模擬器</h1>
      {/* 新增製作單位標註 */}
      <p className="text-sm text-gray-600 mb-8">臺北醫學大學 製作</p>

      {/* 總容器，現在只有這兩個區塊會垂直堆疊，並且各自由內部定義背景 */}
      <div className="w-full max-w-5xl lg:max-w-6xl flex flex-col items-center justify-center gap-6">
        {/* 上方：LCD 螢幕區 (現在帶有自己的背景樣式) */}
        <div className="w-full flex-shrink-0 min-h-[250px] md:min-h-[300px] lg:min-h-[350px] bg-gray-600 rounded-3xl shadow-2xl p-6 border-4 border-gray-700">
          <LCDScreen settings={settings} />
        </div>

        {/* 下方：設定控制面板 (維持自己的背景樣式，並移除其自身的 max-w-sm 確保與 LCD 等寬) */}
        <div className="w-full flex-grow flex items-stretch max-h-[70vh] mt-6"> {/* 增加一些間距 */}
          <SettingsControlPanel settings={settings} setSettings={setSettings} />
        </div>
      </div>
    </div>
  );
};

export default App;
