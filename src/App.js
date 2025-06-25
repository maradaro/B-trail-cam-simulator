import React, { useState, useEffect, useCallback } from 'react';
import { Camera, Video, Clock, Sun, Moon, CalendarDays, GripHorizontal, BatteryFull, BatteryCharging, Thermometer, Info, Target, Zap, Gauge, Languages, Timer, ImagePlus, RefreshCcw, HardDrive } from 'lucide-react'; // 僅保留用於顯示的圖示，已添加 HardDrive

// 定義相機的預設設定
const defaultCameraSettings = {
  mode: 'TRAIL CAM',
  photoResolution: '12MP',
  videoResolution: '1920x1080 30fps', // High
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
  timeLapseEnabled: false, // 是否啟用 Timelapse
  timeLapseFreq: '5s',
  timeLapsePeriod: 'ALL DAY',
  smartIRVideo: false,
  irFlashRange: 'Economy', // 新增預設值
  sdManagement: false,
  language: 'English',
  captureTimer: {
    enabled: false,
    startTime: '19:00', // 預設 7 PM
    stopTime: '05:00',  // 預設 5 AM
  },
  hdr: false,
  currentDate: new Date(), // 模擬日期和時間
};

// 各選項的對應值
const CAMERA_MODES = ['TRAIL CAM', 'TIMELAPSE PLUS', 'VIDEO'];
const PHOTO_RESOLUTIONS = ['4MP', '8MP', '12MP', '24MP'];
const VIDEO_RESOLUTIONS = ['1920x1080 30fps', '1920x1080 60fps']; // High, Ultra
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

// LCD 螢幕組件 (現在作為儀表板顯示所有設定)
const LCDScreen = ({ settings }) => {
  const {
    mode, photoResolution, videoResolution, videoLength, multiShotMode, currentDate, motionTest, sdManagement,
    tempUnits, cameraName, imageDataStrip, motionDetection, triggerSpeed, batteryType, photoDelay, // <-- 已添加 photoDelay
    timeLapseEnabled, timeLapseFreq, timeLapsePeriod, smartIRVideo, irFlashRange, // <-- 已添加 irFlashRange
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
      <div className="relative z-10 flex flex-col h-full overflow-y-auto custom-scrollbar p-2">
        <h2 className="text-base font-bold text-yellow-400 mb-3 border-b border-yellow-400 pb-1 text-center">相機狀態總覽</h2>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="col-span-2 flex justify-between">
            <span>模式:</span>
            <span className="font-bold text-green-300">{mode}</span>
          </div>
          {mode !== 'VIDEO' && ( // 僅非影片模式顯示照片相關
            <div className="col-span-2 flex justify-between">
              <span>照片品質:</span>
              <span className="font-bold">{photoResolution}</span>
            </div>
          )}
          {mode === 'VIDEO' && ( // 僅影片模式顯示影片相關
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
          )}
          <div className="col-span-2 flex justify-between">
            <span>多重拍攝:</span>
            <span className="font-bold">{multiShotMode}</span>
          </div>
          <div className="col-span-2 flex justify-between">
            <span>照片延遲:</span>
            <span className="font-bold">{photoDelay}</span> {/* 已確保 photoDelay 已定義 */}
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
            <span className="font-bold">{irFlashRange}</span> {/* 已確保 irFlashRange 已定義 */}
          </div>
          <div className="col-span-2 flex justify-between">
            <span>智慧紅外線影片:</span>
            <span className={`font-bold ${smartIRVideo ? 'text-green-400' : 'text-red-400'}`}>{smartIRVideo ? 'ON' : 'OFF'}</span>
          </div>
          <div className="col-span-2 flex justify-between">
            <span>HDR:</span>
            <span className={`font-bold ${hdr ? 'text-green-400' : 'text-red-400'}`}>{hdr ? 'ON' : 'OFF'}</span>
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

        <div className="flex-grow flex items-end justify-between mt-auto text-xs border-t border-gray-700 pt-2">
          <span>電量: {batteryPercentage}</span>
          <span>SD 卡: {sdCardUsage}</span>
          <span>{formatDate(currentDate)} {formatTime(currentDate)}</span>
        </div>
      </div>
    </div>
  );
};


// 設置控制面板組件
const SettingsControlPanel = ({ settings, setSettings }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings(prevSettings => {
      let newSettings = { ...prevSettings };

      if (name === 'timeLapseEnabled' || name === 'smartIRVideo' || name === 'sdManagement' || name === 'imageDataStrip' || name === 'motionTest' || name === 'hdr' || name === 'captureTimerEnabled') { // captureTimerEnabled 也是布林值
        // 特殊處理 captureTimer.enabled，因為它是嵌套對象的屬性
        if (name === 'captureTimerEnabled') {
          newSettings.captureTimer = {
            ...newSettings.captureTimer,
            enabled: value === 'true'
          };
        } else {
          newSettings[name] = value === 'true'; // 將字串 'true'/'false' 轉換為布林值
        }
      } else {
        newSettings[name] = value;
      }
      return newSettings;
    });
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
      // 在此處可添加模擬清空圖片計數等邏輯
    }
  };

  const handleFirmwareUpgrade = () => {
    alert("韌體已是最新版本，無需升級。");
  };


  return (
    <div className="p-6 bg-gray-700 rounded-lg shadow-inner w-full max-w-sm overflow-y-auto custom-scrollbar h-full">
      <h2 className="text-xl font-bold text-blue-300 mb-4 text-center">調整相機設定</h2>

      <div className="grid grid-cols-1 gap-4">
        {/* 操作模式 */}
        <div>
          <label htmlFor="mode" className="block text-gray-200 text-sm font-bold mb-1">操作模式:</label>
          <select id="mode" name="mode" value={settings.mode} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            {CAMERA_MODES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* 照片品質 */}
        <div>
          <label htmlFor="photoResolution" className="block text-gray-200 text-sm font-bold mb-1">照片品質:</label>
          <select id="photoResolution" name="photoResolution" value={settings.photoResolution} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            {PHOTO_RESOLUTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* 影片解析度 */}
        <div>
          <label htmlFor="videoResolution" className="block text-gray-200 text-sm font-bold mb-1">影片解析度:</label>
          <select id="videoResolution" name="videoResolution" value={settings.videoResolution} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            {VIDEO_RESOLUTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* 影片長度 */}
        <div>
          <label htmlFor="videoLength" className="block text-gray-200 text-sm font-bold mb-1">影片長度:</label>
          <select id="videoLength" name="videoLength" value={settings.videoLength} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            {VIDEO_LENGTHS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* 照片延遲 */}
        <div>
          <label htmlFor="photoDelay" className="block text-gray-200 text-sm font-bold mb-1">照片延遲:</label>
          <select id="photoDelay" name="photoDelay" value={settings.photoDelay} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            {PHOTO_DELAYS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* 多重拍攝模式 */}
        <div>
          <label htmlFor="multiShotMode" className="block text-gray-200 text-sm font-bold mb-1">多重拍攝模式:</label>
          <select id="multiShotMode" name="multiShotMode" value={settings.multiShotMode} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            {MULTI_SHOT_MODES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* 溫度單位 */}
        <div>
          <label htmlFor="tempUnits" className="block text-gray-200 text-sm font-bold mb-1">溫度單位:</label>
          <select id="tempUnits" name="tempUnits" value={settings.tempUnits} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            {TEMP_UNITS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* 影像資料條 */}
        <div>
          <label htmlFor="imageDataStrip" className="block text-gray-200 text-sm font-bold mb-1">影像資料條:</label>
          <select id="imageDataStrip" name="imageDataStrip" value={settings.imageDataStrip} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            <option value="true">ON</option>
            <option value="false">OFF</option>
          </select>
        </div>

        {/* 動作測試 */}
        <div>
          <label htmlFor="motionTest" className="block text-gray-200 text-sm font-bold mb-1">動作測試:</label>
          <select id="motionTest" name="motionTest" value={settings.motionTest} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            <option value="true">ON</option>
            <option value="false">OFF</option>
          </select>
        </div>

        {/* 動作偵測 */}
        <div>
          <label htmlFor="motionDetection" className="block text-gray-200 text-sm font-bold mb-1">動作偵測:</label>
          <select id="motionDetection" name="motionDetection" value={settings.motionDetection} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            {MOTION_DETECTION_RANGES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* 觸發速度 */}
        <div>
          <label htmlFor="triggerSpeed" className="block text-gray-200 text-sm font-bold mb-1">觸發速度:</label>
          <select id="triggerSpeed" name="triggerSpeed" value={settings.triggerSpeed} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            {TRIGGER_SPEEDS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* 電池類型 */}
        <div>
          <label htmlFor="batteryType" className="block text-gray-200 text-sm font-bold mb-1">電池類型:</label>
          <select id="batteryType" name="batteryType" value={settings.batteryType} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            {BATTERY_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* 紅外線閃光範圍 */}
        <div>
          <label htmlFor="irFlashRange" className="block text-gray-200 text-sm font-bold mb-1">紅外線閃光範圍:</label>
          <select id="irFlashRange" name="irFlashRange" value={settings.irFlashRange} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            {IR_FLASH_RANGES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* 智慧紅外線影片 */}
        <div>
          <label htmlFor="smartIRVideo" className="block text-gray-200 text-sm font-bold mb-1">智慧紅外線影片:</label>
          <select id="smartIRVideo" name="smartIRVideo" value={settings.smartIRVideo} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            <option value="true">ON</option>
            <option value="false">OFF</option>
          </select>
        </div>

        {/* SD 卡管理 */}
        <div>
          <label htmlFor="sdManagement" className="block text-gray-200 text-sm font-bold mb-1">SD 卡管理:</label>
          <select id="sdManagement" name="sdManagement" value={settings.sdManagement} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            <option value="true">ON</option>
            <option value="false">OFF</option>
          </select>
        </div>

        {/* 語言 */}
        <div>
          <label htmlFor="language" className="block text-gray-200 text-sm font-bold mb-1">語言:</label>
          <select id="language" name="language" value={settings.language} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            {LANGUAGES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* HDR */}
        <div>
          <label htmlFor="hdr" className="block text-gray-200 text-sm font-bold mb-1">HDR:</label>
          <select id="hdr" name="hdr" value={settings.hdr} onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
            <option value="true">ON</option>
            <option value="false">OFF</option>
          </select>
        </div>

        {/* 縮時攝影設定 */}
        <div className="border-t border-gray-600 pt-4 mt-4">
          <h3 className="text-lg font-bold text-blue-200 mb-2">縮時攝影設定</h3>
          <div>
            <label htmlFor="timeLapseEnabled" className="block text-gray-200 text-sm font-bold mb-1">啟用:</label>
            <select id="timeLapseEnabled" name="timeLapseEnabled" value={settings.timeLapseEnabled} onChange={handleChange}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
              <option value="true">ON</option>
              <option value="false">OFF</option>
            </select>
          </div>
          {settings.timeLapseEnabled && (
            <>
              <div className="mt-2">
                <label htmlFor="timeLapseFreq" className="block text-gray-200 text-sm font-bold mb-1">頻率:</label>
                <select id="timeLapseFreq" name="timeLapseFreq" value={settings.timeLapseFreq} onChange={handleChange}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500">
                  {TIMELAPSE_FREQS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="mt-2">
                <label htmlFor="timeLapsePeriod" className="block text-gray-200 text-sm font-bold mb-1">時段:</label>
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
          <h3 className="text-lg font-bold text-blue-200 mb-2">拍攝定時器</h3>
          <div>
            <label htmlFor="captureTimerEnabled" className="block text-gray-200 text-sm font-bold mb-1">啟用:</label>
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
            <RefreshCcw className="w-5 h-5 mr-2" /> 恢復預設設定
          </button>
          <button
            className="w-full bg-red-800 text-white p-3 rounded-md shadow-md hover:bg-red-900 transition-all duration-200 flex items-center justify-center font-bold"
            onClick={handleDeleteAll}
          >
            <HardDrive className="w-5 h-5 mr-2" /> 刪除所有檔案
          </button>
          <button
            className="w-full bg-blue-800 text-white p-3 rounded-md shadow-md hover:bg-blue-900 transition-all duration-200 flex items-center justify-center font-bold"
            onClick={handleFirmwareUpgrade}
          >
            <Info className="w-5 h-5 mr-2" /> 韌體升級
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
    return savedSettings ? JSON.parse(savedSettings) : defaultCameraSettings;
  });

  // 儲存設定到 Local Storage
  useEffect(() => {
    localStorage.setItem('trailCameraSettings', JSON.stringify(settings));
  }, [settings]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-4 font-inter">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 mt-4 md:mt-0 text-center">Browning 紅外線相機模擬器</h1>

      <div className="relative bg-gray-600 rounded-3xl shadow-2xl p-6 border-4 border-gray-700 w-full max-w-5xl lg:max-w-6xl flex flex-col md:flex-row items-stretch justify-center gap-6">
        {/* 左側：設定控制面板 */}
        <div className="w-full md:w-1/2 flex items-stretch">
          <SettingsControlPanel settings={settings} setSettings={setSettings} />
        </div>

        {/* 右側：LCD 螢幕區 */}
        <div className="w-full md:w-1/2 flex items-stretch min-h-[300px] md:min-h-[400px] aspect-video"> {/* 使用 aspect-video 保持比例 */}
          <LCDScreen settings={settings} />
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
