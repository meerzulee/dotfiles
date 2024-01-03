import Gio from 'gi://Gio';
import * as Resources from '../helpers/resource_helpers.js';
import * as Log from './log.js';
import { PanelHelper } from '../helpers/panel_helper.js';
import { LabelHelper } from '../helpers/label_helper.js';

export class DBus {
    labels;
    gpuModeToggle;
    proxy;
    sgfxVendor = '';
    sgfxLastState = 6;
    sgfxPowerState = 5;
    sgfxSupportedGPUs = [];
    connected = false;

    constructor(gpuModeToggle) {
        this.gpuModeToggle = gpuModeToggle;
        this.proxy = new Gio.DBusProxy.makeProxyWrapper(Resources.File.DBus('org-supergfxctl-gfx-5', this.gpuModeToggle._exPath))(Gio.DBus.system, 'org.supergfxctl.Daemon', '/org/supergfxctl/Gfx');
    }
    async initialize() {

        try {
            await this.initLabels();
            if (this.labels.v51)
                this.sgfxLastState = 7;
            const sup = await this.proxy.SupportedAsync();
            if (Array.isArray(sup) && Array.isArray(sup[0])) {
                this.sgfxSupportedGPUs = sup[0].map((n) => parseInt(n) || 0);
                this.connected = sup[0].length === this.sgfxSupportedGPUs.length;
            }
            if (this.connected) {
                await this.vendor();
                await this.gfxMode();
                await this.gpuPower();
                this.connectNotifySignal();
                this.connectPowerSignal();

                try {
                    const lastState = this.lastState;
                    const lastPState = this.lastPowerState;
                    const lVar = `${this.labels.get(1, lastState)} (${this.labels.get(2, lastPState)}})`;
                    const gpuIconName = `gpu-${this.labels.get(0, lastState) +
                        this.labels.get(3, lastPState) ==
                        'active'
                        ? '-active'
                        : ''}`;
                    if (this.labels.gsVersion >= 44)
                        this.gpuModeToggle.title = lVar;
                    else
                        this.gpuModeToggle.label = lVar;
                    this.gpuModeToggle.gicon = Resources.Icon.getByName(gpuIconName);
                    this.gpuModeToggle.menu.setHeader(Resources.Icon.getByName(gpuIconName), `${this.labels.get(1, lastState)} (${this.labels.get(2, lastPState)})`);
                }
                catch {
                    PanelHelper.notify('DBus: Could not establish connection to supergfxctl!', 'gpu-integrated-active', '', 3);
                    Log.error('DBus: initializing interface: failed after making the connection!');
                }
            }
        }
        catch {
            Log.error('DBus: initializing interface: aborted!');
        }
    }
    async initLabels() {

        try {
            this.labels = new LabelHelper((await this.proxy.VersionAsync()).toString().split('.'));
        }
        catch {
            Log.error('DBus: initializing labels: get current version failed!');
        }
    }

    connectNotifySignal() {

        try {
            this.proxy.connectSignal('NotifyAction', (_proxy = null, _name, value) => {
                let newMode = parseInt(this.proxy.ModeSync());
                let details = `has changed.`;
                let icon = 'gpu-integrated-active';
                let switchable = true;

                switch (this.labels.get(4, value)) {
                    case 'integrated':
                        details = `You must switch to Integrated mode before switching to VFIO.`;
                        switchable = false;
                        break;
                    case 'none':
                        details = `changed to ${this.labels.get(0, newMode)}`;
                        break;
                    default:
                        details = `changed. Please save your work and ${this.labels.get(4, value)} to apply the changes.`;
                        icon = 'reboot';
                        break;
                }
                if (switchable && newMode !== this.sgfxLastState) {
                    this.sgfxLastState = newMode;
                    this.gpuModeToggle.refresh();
                }
                PanelHelper.notify(details, icon, this.labels.get(4, value));
            });
        }
        catch {
            Log.error(`DBus: connecting signal: Error, no live updates of GPU modes!`);
        }
    }

    connectPowerSignal() {

        try {
            this.proxy.connectSignal('NotifyGfxStatus', (_proxy = null, _name, value) => {
                if (this.sgfxPowerState !== value[0]) {
                    this.sgfxPowerState = value[0];
                    if (this.sgfxPowerState == 0 && this.sgfxLastState == 1) {

                        try {
                            let mode = parseInt(this.proxy.ModeSync());
                            if (this.labels.is(0, mode, 'integrated'))
                                PanelHelper.notify(`Your dedicated GPU turned on while you are on the integrated mode. This should not happen. It could be that another application rescanned your PCI bus. Rebooting is advised.`, 'gif/fire.gif', 'reboot');
                            else if (this.sgfxLastState !== mode)
                                this.sgfxLastState = mode;
                        }
                        catch {
                            Log.error('DBus: getting mode: failed!');
                        }
                    }
                    this.gpuModeToggle.refresh();
                }
            });
        }
        catch (error) {
            Log.error(`DBus: connecting signal: Error, no live updates of power modes!`, error);
        }
    }
    async vendor() {

        try {
            this.sgfxVendor = await this.proxy.VendorAsync();
        }
        catch {
            Log.error('DBus: get current vendor: failed!');
        }
        return this.sgfxVendor;
    }
    async gfxMode(mode = -1) {

        try {
            if (mode >= 0) {

                try {
                    await this.proxy.SetModeAsync(mode);
                }
                catch (e) {
                    Log.error('DBus: switching mode: failed!');
                    PanelHelper.notify(e.toString(), 'gif/fire.gif');
                }
            }
            this.sgfxLastState = parseInt(await this.proxy.ModeAsync());
        }
        catch {
            Log.error('DBus: get current mode: failed!');
        }
        return this.sgfxLastState;
    }
    async gpuPower() {

        try {
            this.sgfxPowerState = parseInt((await this.proxy.PowerAsync()).toString().trim());
        }
        catch {
            Log.error('DBus: getting power mode: failed!');
            this.sgfxPowerState = 5;
        }
        return this.sgfxPowerState;
    }

    get supported() {
        if (this.connected) {
            if (this.sgfxSupportedGPUs.length === 1 &&
                ((this.labelHelper.v50 && this.sgfxSupportedGPUs[0] === 4) ||
                    (this.labelHelper.v51 && this.sgfxSupportedGPUs[0] === 5))) {
                return [0].concat(this.sgfxSupportedGPUs);
            }
            return this.sgfxSupportedGPUs;
        }
        return [];
    }

    get lastState() {
        return this.connected ? this.sgfxLastState : 6 + (this.labels.v51 ? 1 : 0);
    }

    get lastPowerState() {
        return this.connected ? this.sgfxPowerState : 5;
    }

    get labelHelper() {
        return this.labels;
    }
}
