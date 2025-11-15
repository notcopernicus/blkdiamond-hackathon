import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Heart, Wind, Navigation, Smartphone, Sun, Battery, Zap } from 'lucide-react';

export default function App() {
  const [position, setPosition] = useState(0);
  const [warning, setWarning] = useState(false);

  const [radiation, setRadiation] = useState(0.3);
  const [temp, setTemp] = useState(-180);
  const [solarExposure, setSolarExposure] = useState(87);

  const [heartRate, setHeartRate] = useState(68);
  const [oxygen, setOxygen] = useState(98);
  const [suitBattery, setSuitBattery] = useState(94);

  const [shelterDistance, setShelterDistance] = useState(200);
  const [missionTime, setMissionTime] = useState(0);

  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const requestGyro = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setGyroEnabled(true);
        }
      } catch (error) {
        console.error('Gyroscope permission denied:', error);
      }
    } else {
      setGyroEnabled(true);
    }
  };

  useEffect(() => {
    if (!gyroEnabled) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const beta = event.beta || 0;
      const gamma = event.gamma || 0;

      setTilt({
        x: Math.max(-30, Math.min(30, gamma)),
        y: Math.max(-30, Math.min(30, beta - 45))
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [gyroEnabled]);

  useEffect(() => {
    const timer = setInterval(() => {
      setMissionTime(prev => prev + 1);

      setPosition(prev => {
        const newPos = prev + 2;

        if (newPos >= 100 && newPos < 150) {
          setWarning(true);
          setRadiation(prev => Math.min(prev + 0.15, 4.5));
          setHeartRate(prev => Math.min(prev + 2, 120));
          setSolarExposure(Math.max(12 - (newPos - 100) * 0.2, 5));
          setSuitBattery(prev => Math.max(prev - 0.3, 45));
          setShelterDistance(prev => Math.max(prev - 4, 0));
          setTemp(-220);
        } else if (newPos >= 150) {
          setWarning(false);
          setRadiation(0.3);
          setHeartRate(68);
          setSolarExposure(94);
          setSuitBattery(prev => Math.min(prev + 0.1, 94));
          setShelterDistance(0);
          setTemp(-180);
        } else {
          setRadiation(0.3 + Math.sin(newPos / 10) * 0.1);
          setHeartRate(68 + Math.sin(newPos / 20) * 3);
          setSolarExposure(87);
          setSuitBattery(94);
          setTemp(-180);
        }

        return newPos > 200 ? 0 : newPos;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBatteryTimeRemaining = () => {
    const drainRate = solarExposure < 20 ? 0.3 : -0.1;
    if (drainRate < 0) return '∞';
    const minutesLeft = Math.floor((suitBattery / drainRate) / 60);
    return `${minutesLeft}m`;
  };

  return (
    <div className="w-full h-screen bg-black text-white relative overflow-hidden">
      {isMobile && !gyroEnabled && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur p-4">
          <div className="bg-gradient-to-br from-cyan-900/90 to-blue-900/90 border-2 border-cyan-400 p-8 rounded-xl max-w-sm text-center shadow-2xl">
            <div className="bg-cyan-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-10 h-10 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-bold text-cyan-400 mb-3">
              BECOME AN ASTRONAUT
            </h3>
            <p className="text-cyan-100 mb-6 text-sm leading-relaxed">
              Enable device motion to experience immersive AR navigation on the lunar surface
            </p>
            <button
              onClick={requestGyro}
              className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-3 rounded-lg font-bold w-full mb-3 transition-all transform hover:scale-105"
            >
              ENABLE MOTION CONTROLS
            </button>
            <button
              onClick={() => setGyroEnabled(true)}
              className="text-cyan-300 text-xs underline hover:text-cyan-200"
            >
              Continue without motion
            </button>
          </div>
        </div>
      )}

      {/* Video Background */}
      <div
        className="absolute inset-0 transition-transform duration-100"
        style={{
          transform: gyroEnabled
            ? `rotateY(${tilt.x * 0.3}deg) rotateX(${-tilt.y * 0.3}deg)`
            : 'none',
          transformStyle: 'preserve-3d'
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: 'scale(1.3)',
            filter: 'brightness(0.7)'
          }}
        >
          <source src="/moonthree.mp4" type="video/mp4" />
        </video>
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* HUD Overlay Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-cyan-400 opacity-70"></div>
        <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-cyan-400 opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-cyan-400 opacity-70"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-cyan-400 opacity-70"></div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 border border-cyan-400 rounded-full opacity-40"></div>
          <div className="absolute top-1/2 left-1/2 w-12 h-0.5 bg-cyan-400 -translate-x-1/2 -translate-y-1/2 opacity-60"></div>
          <div className="absolute top-1/2 left-1/2 w-0.5 h-12 bg-cyan-400 -translate-x-1/2 -translate-y-1/2 opacity-60"></div>
        </div>

        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-6 py-2 rounded-lg border border-cyan-400/50 shadow-lg pointer-events-none">
          <div className="font-mono text-cyan-400 text-sm flex items-center gap-4">
            <span>HOLOWEATHER v2.1</span>
            <span className="text-cyan-300">|</span>
            <span>MISSION: {formatTime(missionTime)}</span>
            <span className="text-cyan-300">|</span>
            <span className={solarExposure > 50 ? 'text-yellow-400' : 'text-blue-400'}>
              <Sun className="w-4 h-4 inline mr-1" />
              {solarExposure}%
            </span>
          </div>
        </div>

        <div className="absolute top-20 left-4 bg-black/80 backdrop-blur-md p-4 rounded-lg border border-cyan-400/50 w-56 shadow-xl pointer-events-none">
          <div className="font-mono text-xs text-cyan-400 mb-3 flex items-center gap-2 border-b border-cyan-400/30 pb-2">
            <Heart className="w-4 h-4" />
            <span className="font-bold">BIOMETRICS</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Heart Rate</span>
              <span className={`font-mono font-bold ${warning ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
                {Math.round(heartRate)} BPM
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">O₂ Level</span>
              <span className="text-green-400 font-mono font-bold">{oxygen}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Suit Temp</span>
              <span className="text-cyan-400 font-mono">21°C</span>
            </div>
            <div className="flex justify-between items-center border-t border-cyan-400/20 pt-2 mt-2">
              <span className="text-gray-400 flex items-center gap-1">
                <Battery className="w-3 h-3" />
                Battery
              </span>
              <span className={`font-mono font-bold ${suitBattery < 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                {Math.round(suitBattery)}%
              </span>
            </div>
            <div className="text-xs text-gray-500 text-right">
              Time: {getBatteryTimeRemaining()}
            </div>
          </div>
        </div>

        <div className="absolute top-20 right-4 bg-black/80 backdrop-blur-md p-4 rounded-lg border border-cyan-400/50 w-56 shadow-xl pointer-events-none">
          <div className="font-mono text-xs text-cyan-400 mb-3 flex items-center gap-2 border-b border-cyan-400/30 pb-2">
            <Wind className="w-4 h-4" />
            <span className="font-bold">ENVIRONMENT</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Radiation</span>
              <span className={`font-mono font-bold ${
                warning ? 'text-red-400 animate-pulse' :
                radiation > 1 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {radiation.toFixed(1)} mSv/h
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Ext. Temp</span>
              <span className="text-blue-400 font-mono">{temp}°C</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Terrain</span>
              <span className="text-green-400 font-mono text-xs">STABLE</span>
            </div>
            <div className="flex justify-between items-center border-t border-cyan-400/20 pt-2 mt-2">
              <span className="text-gray-400 flex items-center gap-1">
                <Sun className="w-3 h-3" />
                Solar
              </span>
              <span className={`font-mono font-bold ${
                solarExposure < 20 ? 'text-red-400' :
                solarExposure < 50 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {solarExposure}%
              </span>
            </div>
            <div className={`text-xs text-right ${solarExposure < 20 ? 'text-red-400' : 'text-gray-500'}`}>
              {solarExposure < 20 ? '⚠ Low Power Zone' : 'Optimal Charging'}
            </div>
          </div>
        </div>

        {warning && (
          <div className="absolute inset-0 flex items-center justify-center p-6 animate-in fade-in duration-300 pointer-events-none">
            <div className="bg-gradient-to-br from-red-900/95 to-red-800/95 backdrop-blur-md border-4 border-red-500 p-6 rounded-xl shadow-2xl max-w-xl animate-pulse">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-red-500/30 rounded-full p-3">
                  <AlertTriangle className="w-12 h-12 text-red-400" />
                </div>
                <div className="flex-1">
                  <div className="text-3xl font-bold text-red-400 mb-2 flex items-center gap-3">
                    SOLAR FLARE DETECTED
                    <Zap className="w-8 h-8 animate-pulse" />
                  </div>
                  <div className="text-xl text-red-300 mb-2">CRITICAL RADIATION LEVELS</div>
                  <div className="text-sm text-red-200 bg-red-950/50 rounded px-3 py-2 font-mono">
                    Exposure: {radiation.toFixed(1)} mSv/h • Limit: 3.0 mSv/h
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-red-500/50 pt-4 mt-4">
                <div className="flex items-center justify-between text-lg mb-2">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-6 h-6 text-green-400 animate-bounce" />
                    <span className="text-white font-bold">SHELTER IDENTIFIED</span>
                  </div>
                  <div className="text-green-400 font-mono text-3xl font-bold">
                    {shelterDistance > 0 ? `${shelterDistance}m` : '✓ SAFE'}
                  </div>
                </div>
                {shelterDistance > 0 && (
                  <div className="bg-yellow-900/50 border border-yellow-500/50 rounded px-3 py-2">
                    <div className="text-yellow-300 text-sm font-bold">
                      ⚠ IMMEDIATE ACTION REQUIRED
                    </div>
                    <div className="text-yellow-200 text-xs mt-1">
                      Follow waypoint to high-solar safe zone
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {warning && shelterDistance > 0 && (
          <div className="absolute bottom-1/3 left-1/4 animate-bounce pointer-events-none">
            <div className="relative">
              <div className="w-6 h-6 bg-green-400 rounded-full animate-ping absolute opacity-75"></div>
              <div className="w-6 h-6 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
              <div className="absolute -top-8 left-8 bg-green-900/90 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-mono text-green-300 whitespace-nowrap border border-green-500/50 shadow-lg">
                SHELTER {shelterDistance}m →
              </div>
            </div>
          </div>
        )}

        {warning && shelterDistance === 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-in zoom-in duration-500 pointer-events-none">
            <div className="bg-gradient-to-br from-green-900/95 to-green-800/95 backdrop-blur-md border-4 border-green-500 p-8 rounded-xl shadow-2xl">
              <div className="text-4xl font-bold text-green-400 text-center mb-3 flex items-center justify-center gap-3">
                <div className="bg-green-500/30 rounded-full p-3">
                  ✓
                </div>
                SAFE ZONE REACHED
              </div>
              <div className="text-green-300 text-center text-lg">
                Threat Neutralized • Solar Exposure Restored
              </div>
              <div className="mt-4 text-center text-sm text-green-200 bg-green-950/50 rounded px-4 py-2">
                Mission Status: NOMINAL
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}