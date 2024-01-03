import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as Log from './modules/log.js';
import * as Panel from './modules/panel.js';

export default class SuperGfxExtension extends Extension {
    gpuModeIndicator = null;
    quickToggles = null;
    systemMenu = null;
    glSourceId = null;

    enable() {
        if (Main.panel.statusArea.quickSettings._system && this.glSourceId !== null)
            return this.enableSystemMenu();
        return this.enableSystemMenuQueued();
    }

    enableSystemMenuQueued() {
        var success = false;
        this.glSourceId = GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
            if (!Main.panel.statusArea.quickSettings._system)
                return GLib.SOURCE_CONTINUE;
            success = this.enableSystemMenu();
            this.glSourceId = null;
            return GLib.SOURCE_REMOVE;
        });
        return success;
    }

    enableSystemMenu() {
        Gio.Resource.load(this.path +
            '/resources/org.gnome.Shell.Extensions.supergfxctl-gex.gresource')._register();
        this.systemMenu = Main.panel.statusArea.quickSettings;
        if (this.systemMenu === undefined || this.systemMenu === null) {
            Log.raw('init: system menu is not defined');
            return false;
        }
        this.gpuModeIndicator = new Panel.GpuModeIndicator();
        this.quickToggles = new Panel.GpuModeToggle(this.gpuModeIndicator, this);
        this.gpuModeIndicator.quickSettingsItems.push(this.quickToggles);
        Main.panel.statusArea.quickSettings.addExternalIndicator(this.gpuModeIndicator);
        if (this.systemMenu?._backgroundApps?.quickSettingsItems?.at(-1))

            for (const item of this.gpuModeIndicator.quickSettingsItems) {
                this.systemMenu.menu._grid.set_child_below_sibling(item, this.systemMenu._backgroundApps.quickSettingsItems[0]);
            }
        return true;
    }

    disable() {
        this.quickToggles?.disable();
        this.gpuModeIndicator?.destroy();
        this.quickToggles = null;
        this.gpuModeIndicator = null;
        if (this.glSourceId) {
            GLib.Source.remove(this.glSourceId);
            this.glSourceId = null;
        }
    }
}
