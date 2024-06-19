import { WebUSB } from 'usb';

const webusb = new WebUSB();
const V_L = [16701, 1406]
const P_L = [8452, 8201]
const idx = 1
const VENDOR_ID = V_L[idx] // 1406;
const PRODUCT_ID = P_L[idx] // 8201;

export async function connectXboxController() {
    try {
        const device = await webusb.requestDevice({
            filters: [{ vendorId: VENDOR_ID, productId: PRODUCT_ID }]
        });

        if (!device) {
            console.log('Xbox controller not found');
            return;
        }

        await device.open();
        console.log('Xbox controller connected');

        await device.selectConfiguration(1);

        console.log('Device configuration:', device.configuration);

        device.configuration.interfaces.forEach((iface, index) => {
            console.log(`Interface ${index}:`);
            iface.alternate.endpoints.forEach((endpoint, epIndex) => {
                console.log(`  Endpoint ${epIndex}:`, endpoint);
            });
        });

        await device.claimInterface(1);
        const command = new Uint8Array([0x01, 0x03, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, ...new Uint8Array(56).fill(0)]);

        const endpointNumber = 3;
        await device.transferOut(endpointNumber, command);
        console.log('Command sent to Xbox controller');
    } catch (error) {
        console.error('Error:', error);
    }
}

connectXboxController();