# Configuring the Official Raspberry Pi 7" Touchscreen with LabWC

This guide explains how to configure the official Raspberry Pi 7" touchscreen to work properly with the LabWC Wayland compositor, preventing it from being treated as a mouse input device.

## Hardware Details

- **Display**: Official Raspberry Pi 7" Touchscreen
- **Resolution**: 800x480
- **Touch Controller**: edt-ft5506 (generic ft5x06)
- **Device Name**: "6-0038 generic ft5x06 (79)"
- **Input Device**: /dev/input/event5 (may vary)

## Configuration Steps

1. First, verify your touchscreen is being detected correctly:
   ```bash
   libinput list-devices
   ```
   Look for a device entry similar to:
   ```
   Device:           6-0038 generic ft5x06 (79)
   Kernel:           /dev/input/event5
   Group:            1
   Seat:             seat0, default
   Capabilities:     touch
   ```

2. Verify touch events are being generated:
   ```bash
   sudo evtest
   ```
   Select the ft5x06 device and verify you see touch events when touching the screen.

3. Create your user configuration:
   ```bash
   mkdir -p ~/.config/labwc
   nano ~/.config/labwc/rc.xml
   ```
   Add the following content:
   ```xml
   <?xml version="1.0"?>
   <openbox_config xmlns="http://openbox.org/3.4/rc">
       <touch deviceName="6-0038 generic ft5x06 (79)" mapToOutput="card0-DSI-1" mouseEmulation="no"/>
   </openbox_config>
   ```

4. Create the input configuration:
   ```bash
   nano ~/.config/labwc/input.conf
   ```
   Add the following content:
   ```
   touch-device {
       name = "6-0038 generic ft5x06 (79)"
       output = "card0-DSI-1"
       map-to-output = "card0-DSI-1"
       transform = "normal"
   }
   ```

5. Modify the system configuration:
   ```bash
   sudo nano /etc/xdg/labwc/rc.xml
   ```
   Find the line:
   ```xml
   <touch deviceName="6-0038 generic ft5x06 (79)" mapToOutput="DSI-1" mouseEmulation="yes" />
   ```
   Change it to:
   ```xml
   <touch deviceName="6-0038 generic ft5x06 (79)" mapToOutput="DSI-1" mouseEmulation="no" />
   ```

   > **Note**: This change to the system configuration may need to be reapplied after system updates.

6. Reboot your system:
   ```bash
   sudo reboot
   ```

## Verification

After rebooting, the touchscreen should:
- Respond to touch input naturally
- Not behave like a mouse pointer
- Support proper touch gestures

## Troubleshooting

If touch input still behaves like a mouse after following these steps:

1. Verify the device name matches exactly:
   ```bash
   cat /proc/bus/input/devices | grep -A 15 ft5x06
   ```

2. Check that touch events are being properly recognized:
   ```bash
   libinput debug-events --verbose
   ```
   You should see TOUCH events rather than POINTER events.

3. Verify the display identifier:
   ```bash
   ls /sys/class/drm/
   ```
   Make sure the DSI display is identified as expected.

## Technical Notes

- The official Raspberry Pi touchscreen uses the edt_ft5x06 driver
- The touchscreen connects via I2C (not USB like some third-party screens)
- Configuration changes in /etc/xdg/labwc/rc.xml might be reset by system updates
- The device name (6-0038) indicates the I2C bus number and device address

## Additional Information

LabWC's configuration system normally allows user settings to override system settings using the --merge-config option, but as of version 0.7.4, this doesn't work reliably for touch device configuration. For this reason, the system configuration file needs to be modified directly.