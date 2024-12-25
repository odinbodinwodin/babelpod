import { useState } from 'react';
import { Volume2, Mic, Speaker, Bluetooth, RefreshCw, Power } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Alert, AlertDescription } from './ui/alert';
import { useSocket, useDevices, useDeviceControl } from './SocketProvider';
import { cn } from '@/lib/utils';

export function KioskAudioUI() {
  const { isConnected, error } = useSocket();
  const { inputs, outputs } = useDevices();
  const {
    selectedInput,
    selectedOutputs,
    volumes,
    switchInput,
    switchOutputs,
    changeVolume,
  } = useDeviceControl();

  const [power, setPower] = useState(true);

  // Prevent text selection
  const preventSelection = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Touch-optimized volume control
  const handleVolumeTouch = (deviceId: string, direction: 'up' | 'down') => {
    const currentVolume = volumes[deviceId] || 0;
    const step = 5;
    const newVolume = direction === 'up' 
      ? Math.min(currentVolume + step, 100)
      : Math.max(currentVolume - step, 0);
    changeVolume(deviceId, newVolume);
  };

  return (
    <div 
      className={`h-[480px] w-[800px] bg-black text-white ${!power ? 'opacity-0' : 'opacity-100'} 
        transition-opacity duration-500 overflow-hidden touch-manipulation select-none`}
      onMouseDown={preventSelection}
    >
      {/* Header - Optimized height for 480px screen */}
      <div className="px-3 py-1 bg-zinc-900 border-b border-zinc-800 h-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-blue-500 animate-pulse' : 'bg-zinc-700'}`} />
            <h1 className="font-mono text-sm tracking-wider">BABELPOD</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700"
              onClick={() => setPower(!power)}
            >
              <Power className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Adjusted for 470px remaining height */}
      <div className="grid grid-cols-12 gap-1 p-1 h-[470px]">
        {/* Input Section - Narrower for small screen */}
        <div className="col-span-3 space-y-1">
          <div className="text-xs font-mono text-zinc-500 px-1">INPUT</div>
          <div className="space-y-1 overflow-y-auto max-h-[430px]">
            {inputs.map(input => (
              <Button
                key={input.id}
                variant="ghost"
                className={cn(
                  "w-full h-12 justify-start px-2 bg-zinc-900 border border-zinc-800",
                  selectedInput === input.id && "border-blue-500 text-blue-500"
                )}
                onClick={() => switchInput(input.id)}
              >
                {input.type === 'bluetooth' ? (
                  <Bluetooth className="h-4 w-4 mr-2" />
                ) : (
                  <Mic className="h-4 w-4 mr-2" />
                )}
                <span className="font-mono text-xs truncate">{input.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Output Section - Optimized for touch */}
        <div className="col-span-9 space-y-1">
          <div className="text-xs font-mono text-zinc-500 px-1">OUTPUT ZONES</div>
          <div className="grid grid-cols-2 gap-1 h-[430px] overflow-y-auto pr-1">
            {outputs.map(output => (
              <Card 
                key={output.id}
                className={cn(
                  "bg-zinc-900 border-zinc-800",
                  selectedOutputs.includes(output.id) && "border-blue-500"
                )}
              >
                <CardContent className="p-2 space-y-2">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full h-10 justify-between px-2 text-zinc-300 hover:text-white",
                      selectedOutputs.includes(output.id) && "text-white"
                    )}
                    onClick={() => {
                      const newOutputs = selectedOutputs.includes(output.id)
                        ? selectedOutputs.filter(id => id !== output.id)
                        : [...selectedOutputs, output.id];
                      switchOutputs(newOutputs);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Speaker className={cn(
                        "h-4 w-4",
                        selectedOutputs.includes(output.id) ? "text-blue-500" : "text-zinc-400"
                      )} />
                      <span className="font-mono text-xs truncate">{output.name}</span>
                    </div>
                  </Button>

                  {selectedOutputs.includes(output.id) && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <Volume2 className="h-4 w-4 text-blue-500" />
                        <span className="text-blue-500">
                          {(volumes[output.id] || 0).toString().padStart(2, '0')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-1">
                        <Button
                          variant="ghost"
                          className="h-12 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xl font-bold"
                          onTouchStart={() => handleVolumeTouch(output.id, 'up')}
                          onClick={() => handleVolumeTouch(output.id, 'up')}
                        >
                          +
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-12 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xl font-bold"
                          onTouchStart={() => handleVolumeTouch(output.id, 'down')}
                          onClick={() => handleVolumeTouch(output.id, 'down')}
                        >
                          -
                        </Button>
                      </div>

                      <Slider
                        value={[volumes[output.id] || 0]}
                        onValueChange={([v]) => changeVolume(output.id, v)}
                        min={0}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="fixed bottom-2 left-2 right-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}