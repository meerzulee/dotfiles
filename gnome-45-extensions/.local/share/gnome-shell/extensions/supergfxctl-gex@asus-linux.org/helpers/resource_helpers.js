import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import * as Log from '../modules/log.js';

export class File {
    static DBus(name, path = '') {
        const decoder = new TextDecoder();
        const file = `${path}/resources/dbus/${name}.xml`;

        try {
            const [ok, bytes] = GLib.file_get_contents(file);
            if (!ok)
                Log.warn(`Couldn't read contents of "${file}"`);
            return ok ? decoder.decode(bytes) : undefined;
        }
        catch (e) {
            Log.error(`Failed to load "${file}"`, e);
        }
    }
}

export class Icon {
    static getByName(name) {
        if ([
            'dgpu-active',
            'dgpu-off',
            'dgpu-suspended',
            'gpu-asusmuxdiscreet-active',
            'gpu-asusmuxdiscreet',
            'gpu-compute-active',
            'gpu-compute',
            'gpu-egpu-active',
            'gpu-egpu',
            'gpu-hybrid-active',
            'gpu-hybrid',
            'gpu-integrated-active',
            'gpu-integrated',
            'gpu-nvidianomodeset-active',
            'gpu-nvidianomodeset',
            'gpu-vfio-active',
            'gpu-vfio',
            'reboot',
        ].some((s) => s === name)) {
            return new Gio.FileIcon({
                file: Gio.File.new_for_uri(`resource://org/gnome/Shell/Extensions/supergfxctl-gex/icons/scalable/${name}.svg`),
            });
        }
        return new Gio.ThemedIcon({ name: name });
    }
}
