/**
 * @description Listening for device messages until receiving a stop flag.
 * */
import { WebUSB } from 'usb';

const webusb = new WebUSB();
const V_L = [16701, 1406]
const P_L = [8452, 8201]
const idx = 0
const VENDOR_ID = V_L[idx] // 1406;
const PRODUCT_ID = P_L[idx] // 8201;
class UsbServive {
    constructor() {
        this.endpointNumber = 3;
        this.mtu = 64
        this.loopInfo = {
            looping: false,
            abort: false,
            index: 0,
            timer: 0
        }
    }
    async init() {
        this.device = await this.scan()
    }
    async recevicelistener() {
        await this.connect().catch(error => console.log(error))
        await this.enableTestMode().catch(error => console.log(error))
        await this.startLoop().catch(error => console.log(error))
    }
    async scan() {
        const device = await webusb.requestDevice({
            filters: [{ vendorId: VENDOR_ID, productId: PRODUCT_ID }]
        });
        return device
    }
    async connect() {
        if (!this.device) {
            console.log('Xbox controller not found');
            throw Error()
        }
        await this.device.open();
        console.log('Xbox controller connected');

        await this.device.selectConfiguration(1);
        await this.device.claimInterface(2);
    }
    async enableTestMode() {
        const command = new Uint8Array([0xa5, 0x05, 0x19, 0x01, 0x00, ...new Uint8Array(59)]);
        const sendRes = await this.device.transferOut(this.endpointNumber, command);
        console.log("Function enableTestMode result:", sendRes)
    }
    async startLoop() {
        this.loopInfo.looping = true
        while (this.loopInfo.looping) {
            if (this.loopInfo.abort) {
                console.log("Loop finish")
                break
            }
            try {
                let res = await this.device.transferIn(this.endpointNumber, this.mtu);
                if (this.loopInfo.index % 100 === 0) {
                    console.log(this.loopInfo.index);
                    console.assert(res, "-")
                    const memoryUsage = process.memoryUsage();
                    console.log(`Memory usage: ${JSON.stringify(memoryUsage)}`);
                    if (memoryUsage.heapUsed > memoryUsage.heapTotal * 0.9) {
                        console.warn("High memory usage detected, stopping loop to prevent crash.");
                    }
                }
                this.loopInfo.index += 1;
                res = null
            } catch (error) {
                console.error("Error receiving data:", error);
            } finally {
                await new Promise(resolve => setTimeout(resolve, 10)); // 控制循环速率
            }
        }
    }
    stopLoop() {
        this.loopInfo.abort = false
        this.loopInfo.looping = false
        console.log("Send a command to terminate listening")
    }
}
// usecase
// async function main() {
//     const connectXboxController = new UsbServive();
//     await connectXboxController.init()
//     await connectXboxController.recevicelistener()
// }
// main()