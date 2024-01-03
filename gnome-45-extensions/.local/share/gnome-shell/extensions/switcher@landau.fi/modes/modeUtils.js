import St from 'gi://St';
import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import * as Convenience from '../convenience.js';

import * as util from '../util.js';
import * as controlCenter from '../controlCenter.js';
import * as switcherApplication from '../switcherApplication.js';

import * as KeyActivationModule from '../keyActivation.js';
const keyActivation = KeyActivationModule.KeyActivation;

let gnomeControlCenterAppIDs = null;

function getGnomeControlCenterAppIDs() {
  if (gnomeControlCenterAppIDs) return gnomeControlCenterAppIDs;

  let gnomeControlCenter;
  let mainApplicationName;

  // get gnome control center instance
  gnomeControlCenter = new controlCenter.GnomeControlCenter();
  if (gnomeControlCenter.mainApplicationId != '') {
    try {
      mainApplicationName = Shell.AppSystem.get_default()
        .lookup_app(gnomeControlCenter.mainApplicationId)
        .get_name();
    } catch (error) {
      mainApplicationName = '';
    }
  }

  gnomeControlCenterAppIDs = gnomeControlCenter
    .getPanelAppIDs()
    .map(function (appId) {
      return new switcherApplication.GnomeControlApplication(
        appId,
        mainApplicationName
      );
    });
  // Tried to get before initialization was complete
  if (gnomeControlCenterAppIDs.length === 0) {
    gnomeControlCenterAppIDs = null
    return []
  }
  return gnomeControlCenterAppIDs;
}

export var ModeUtils = (function () {
  // From _loadApps() in GNOME Shell's appDisplay.js
  let appInfos = () => {
    // get app ids for regular applications
    let regularAppIDs = Gio.AppInfo.get_all()
      .filter(function (appInfo) {
        try {
          let id = appInfo.get_id(); // catch invalid file encodings
        } catch (e) {
          return false;
        }
        return appInfo.should_show();
      })
      .map(function (app) {
        return new switcherApplication.RegularApplication(app.get_id());
      });

    // get gnome control center panel app ids
    let gnomeControlCenterAppIDs = getGnomeControlCenterAppIDs();
    // combine Regular Apps ans and Gnome Control Apps ids
    let allApps = regularAppIDs.concat(gnomeControlCenterAppIDs);

    return allApps;
  };

  let shellAppCache = { lastIndexed: null, apps: [] };
  let nullAppInfosFound = false;
  let getHasNullAppInfos = () => nullAppInfosFound;
  let shellApps = (force) => {
    const get = () => {
      nullAppInfosFound = false;
      return appInfos().map(function (switcherApp) {
        let shellApp = Shell.AppSystem.get_default().lookup_app(
          switcherApp.appId
        );
        if (shellApp == null) {
          nullAppInfosFound = true;
          return null
        }
        // TODO: should this really be done during appInfos creation?
        //       seems disjointed here
        switcherApp.setShellApp(shellApp);
        return switcherApp;
      }).filter(x => x);
    }
    const update = () => {
      shellAppCache.lastIndexed = new Date();
      shellAppCache.apps = get();
    };
    if (!shellAppCache.lastIndexed || !!force) {
      update();
    }
    return shellAppCache.apps;
  };

  let appIcons = {};
  let iconSize = null;

  let getAppIcon = (app) => {
    const configuredIconSize = Convenience.getSettings().get_uint('icon-size');

    // if icon size changes, redo the whole cache
    if (configuredIconSize !== iconSize) {
      appIcons = {};
      iconSize = configuredIconSize;
      shellApps().forEach(function (app) {
        appIcons[app.get_id()] = app.create_icon_texture(iconSize);
      });
    }

    // if icon doesn't exist (e.g. new app installed) add it to the cache
    if (!appIcons.hasOwnProperty(app.get_id())) {
      appIcons[app.get_id()] = app.create_icon_texture(iconSize);
    }

    return appIcons[app.get_id()];
  };

  let seenIDs = {};
  let cleanIDs = () => (seenIDs = {});
  let makeBox = function (
    appObj,
    app,
    appRef,
    description,
    index,
    onActivate,
    oldBox
  ) {
    if (oldBox.whole) oldBox.whole.disconnect(oldBox.activationCallbackId);
    const whole =
      oldBox.whole || new St.Button({ style_class: 'switcher-box' });
    const box = oldBox.whole ? undefined : new St.BoxLayout();

    const label =
      oldBox.label ||
      new St.Label({
        style_class: 'switcher-label',
        y_align: Clutter.ActorAlign.CENTER
      });
    label.clutter_text.set_text(description);
    label.set_x_expand(true);
    if (!oldBox.label) box.insert_child_at_index(label, 0);

    let shortcutBox;
    if (
      !oldBox.label &&
      Convenience.getSettings().get_uint('activate-by-key')
    ) {
      const shortcut = new St.Label({
        style_class: 'switcher-shortcut',
        text: keyActivation.getKeyDesc(index + 1)
      });
      shortcutBox = new St.Bin({ style_class: 'switcher-label' });
      shortcutBox.child = shortcut;
      box.insert_child_at_index(shortcutBox, 0);
    }

    // In case of multiple windows sharing the same id, we need to keep track
    // of ids which were already seen, in order to create a new icon for each
    // window beyond the first.
    // In another case, some windows may use a custom app id, forcing us to
    // create an icon.
    const iconBox =
      oldBox.iconBox || new St.Bin({ style_class: 'switcher-icon' });
    const id = appRef.get_id();
    let appIcon = getAppIcon(appRef);
    if (seenIDs.hasOwnProperty(id) || appIcon === undefined) {
      iconBox.child = appRef.create_icon_texture(iconSize);
    } else {
      // To reuse the same icon, it's actor must not belong to any parent
      util.detachParent(appIcon);
      iconBox.child = appIcon;

      seenIDs[id] = true; // Dummy value
    }
    if (!oldBox.iconBox) box.insert_child_at_index(iconBox, 0);
    const activationCallback = () => {
      const e = Clutter.get_current_event();
      const control = (e.get_state() & Clutter.ModifierType.CONTROL_MASK) !== 0;
      const shift = (e.get_state() & Clutter.ModifierType.SHIFT_MASK) !== 0;
      const alt = (e.get_state() & Clutter.ModifierType.META_MASK) !== 0;
      const super_ = (e.get_state() & Clutter.ModifierType.SUPER_MASK) !== 0;
      onActivate(appObj, { control, shift, alt, super_ });
    };
    const activationCallbackId = whole.connect('clicked', activationCallback);
    if (!oldBox.whole) whole.set_child(box);
    whole.set_track_hover(true);

    return {
      whole: whole,
      iconBox: iconBox,
      shortcutBox: shortcutBox,
      label: label,
      activationCallback: activationCallback,
      activationCallbackId: activationCallbackId
    };
  };

  let getExecutable = function (appInfo) {
    let executable = appInfo.get_executable();
    executable = GLib.basename(executable);
    executable = executable.replace(/%[a-zA-Z]/g, '').trim();
    return `(${executable})`;
  };

  let getOriginal = function (appInfo) {
    let original = appInfo.get_string('Name');
    return `[${original}]`;
  };

  let getExtras = function (appRef) {
    const showOriginal = Convenience.getSettings().get_boolean(
      'show-original-names'
    );
    const showExec = Convenience.getSettings().get_boolean('show-executables');
    if (!showOriginal && !showExec) return '';
    try {
      let appInfo = appRef.get_app_info();
      if (!appInfo) return ''; // e.g. settings panel
      const original = showOriginal ? getOriginal(appInfo) : '';
      const executable = showExec ? getExecutable(appInfo) : '';
      return `${original} ${executable}`;
    } catch (e) {
      log(e);
      return '';
    }
  };

  return {
    cleanIDs,
    makeBox,
    shellApps,
    getExtras,
    getHasNullAppInfos,
  };
})();
