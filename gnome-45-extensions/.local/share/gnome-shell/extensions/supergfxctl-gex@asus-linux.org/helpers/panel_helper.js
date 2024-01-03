import * as Util from 'resource:///org/gnome/shell/misc/util.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';
import * as Resources from './resource_helpers.js';

export class PanelHelper {
    static notify(details, icon, action = '', urgency = 2) {
        const params = { gicon: Resources.Icon.getByName(icon) };
        const source = new MessageTray.Source('Graphics', icon, params);
        const notification = new MessageTray.Notification(source, 'Graphics', details, params);
        Main.messageTray.add(source);
        notification.setTransient(true);

        switch (action) {
            case 'logout':
                notification.setUrgency(3);
                notification.addAction('Log Out Now!', () => {
                    Util.spawnCommandLine('gnome-session-quit');
                });
                break;
            case 'reboot':
                notification.setUrgency(3);
                notification.addAction('Reboot Now!', () => {
                    Util.spawnCommandLine('shutdown -ar now');
                });
                break;
            default:
                notification.setUrgency(urgency);
        }
        source.showNotification(notification);
    }
}
