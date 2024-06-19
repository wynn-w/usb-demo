import * as usb from 'usb';
const V_L = [16701, 1406]
const P_L = [8452, 8201]
const idx = 1
const VENDOR_ID = V_L[idx] // 1406;
const PRODUCT_ID = P_L[idx] // 8201;
export async function connectXboxController() {
    try {
        const devices = usb.getDeviceList();
        let xboxController = null;

        // 查找 Xbox 手柄
        devices.forEach(device => {
            if (device.deviceDescriptor.idVendor === VENDOR_ID && device.deviceDescriptor.idProduct === PRODUCT_ID) {
                xboxController = device;
            }
        });

        if (!xboxController) {
            console.log('Xbox controller not found');
            return;
        }

        await xboxController.open();
        console.log('Xbox controller connected');

        if (xboxController.configuration === null) {
            xboxController.setConfiguration(1);
        }

        // // Error: LIBUSB_ERROR_NOT_SUPPORTED // pass
        // xboxController.interfaces.forEach(iface => {
        //     if (!iface.isKernelDriverActive()) {
        //         iface.claim();
        //     }
        // });
        xboxController.interfaces[1].claim()
        const endpoint = xboxController.interfaces[1].endpoints[1];
        const command = Buffer.from([0x01, 0x03, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00].concat());

        endpoint.transfer(command, (error) => {
            if (error) {
                console.error('Error sending command to Xbox controller:', error);
            } else {
                console.log('Command sent to Xbox controller');
            }
        });
    } catch (error) {
        console.error('Error:', error);
    }
}
// connectXboxController()