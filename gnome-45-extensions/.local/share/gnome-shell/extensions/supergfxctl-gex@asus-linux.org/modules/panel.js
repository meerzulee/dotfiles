import GObject from 'gi://GObject';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { QuickMenuToggle, SystemIndicator, } from 'resource:///org/gnome/shell/ui/quickSettings.js';
import * as Log from './log.js';
import * as Resources from '../helpers/resource_helpers.js';
import { DBus } from './dbus.js';

export const GpuModeIndicator = GObject.registerClass(class GpuModeIndicator extends SystemIndicator {

    constructor() {
        super();
    }
});

export const GpuModeToggle = GObject.registerClass(class GpuModeToggle extends QuickMenuToggle {
    _instance;
    _title = 'Graphics';
    _dbus;
    _labels;
    _gpuModeIndicator = null;
    _gpuModeSection;
    _gpuModeItems = new Map();
    _exPath;

    constructor(gpuModeIndicator, instance) {
        super();
        this._instance = instance;
        this._exPath = this._instance.path ?? '';
        this._gpuModeIndicator = gpuModeIndicator;
        this._gpuModeIndicator._indicator =
            this._gpuModeIndicator._addIndicator();
        this._gpuModeSection = new PopupMenu.PopupMenuSection();
        this.menu.addMenuItem(this._gpuModeSection);
        this._dbus = new DBus(this);
        this._dbus
            .initialize()
            .then(() => {
            this._gpuModeIndicator._indicator.visible = true;
        })
            .catch((e) => {
            Log.error('Panel: Initilization: error!', e);
        })
            .finally(() => {
            this._labels = this._dbus?.labelHelper;
            this.refresh();
        });
    }

    refresh() {
        if (this._dbus === undefined || this._labels === undefined) {
            this._instance.disable();
            return;
        }
        this._gpuModeSection.removeAll();
        this._gpuModeItems.clear();
        const lastState = this._dbus.lastState;
        if (this._dbus.connected && this._dbus.supported.length > 0) {

            for (const key in this._dbus.supported) {
                if (Object.prototype.hasOwnProperty.call(this._dbus.supported, key)) {
                    const element = this._dbus.supported[key];
                    const item = new PopupMenu.PopupImageMenuItem(this._labels.get(1, element), Resources.Icon.getByName(`gpu-${this._labels.get(0, element)}`));
                    item.connect('activate', () => {
                        if (this._dbus !== undefined)
                            this._dbus.gfxMode(element);
                    });
                    this._gpuModeItems.set(element, item);
                    this._gpuModeSection.addMenuItem(item);
                }
            }
        }
        this._gpuModeSection.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        for (const [profile, item] of this._gpuModeItems) {
            item.setOrnament(profile === lastState
                ? PopupMenu.Ornament.DOT
                : PopupMenu.Ornament.NONE);
        }
        const powerItem = new PopupMenu.PopupImageMenuItem(`dedicated GPU is ${this._labels.get(2, this._dbus.lastPowerState)}`, Resources.Icon.getByName(`dgpu-${this._labels.get(3, this._dbus.lastPowerState)}`));
        powerItem.sensitive = false;
        powerItem.active = false;
        this._gpuModeSection.addMenuItem(powerItem);
        const title = `${this._labels.get(1, this._dbus.lastState)} (${this._labels.get(2, this._dbus.lastPowerState)})`;
        if (this._labels.gsVersion >= 44) {
            this.title = this._title;
            this.subtitle = title;
        }
        else
            this.label = title;
        const icon = Resources.Icon.getByName(`gpu-${this._labels.get(0, this._dbus.lastState)}${this._labels.get(3, this._dbus.lastPowerState) == 'active'
            ? '-active'
            : ''}`);
        this.gicon = icon;
        this.addIndicator();
        if (this._labels.gsVersion >= 44) {
            this.menu.setHeader(icon, this._title + ' (SuperGFX)', `Current status: ${this._labels.get(1, this._dbus.lastState)} (dGPU: ${this._labels.get(2, this._dbus.lastPowerState)})`);
        }
        else {
            this.menu.setHeader(icon, `Current status: ${this._labels.get(1, this._dbus.lastState)} (dGPU: ${this._labels.get(2, this._dbus.lastPowerState)})`);
        }
    }

    addIndicator() {
        if (this._dbus === undefined || this._labels === undefined)
            return;
        this._gpuModeIndicator.remove_actor(this._gpuModeIndicator._indicator);
        this._gpuModeIndicator._indicator.gicon = Resources.Icon.getByName(`gpu-${this._labels.get(0, this._dbus.lastState)}${this._labels.get(3, this._dbus.lastPowerState) == 'active'
            ? '-active'
            : ''}`);
        this._gpuModeIndicator._indicator.style_class =
            'supergfxctl-gex panel-icon system-status-icon';
        this._gpuModeIndicator.add_actor(this._gpuModeIndicator._indicator);
    }

    disable() {
        this.destroy();
        this._dbus = undefined;
        this._labels = undefined;
        this._gpuModeIndicator = null;
    }
});
