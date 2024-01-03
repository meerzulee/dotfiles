import { VersionHelper } from './version_helper.js';

export class LabelHelper {
    _gfxLabels = [
        'hybrid',
        'integrated',
        'vfio',
        'egpu',
        'asusmuxdiscreet',
        'none',
    ];
    _gfxLabelsMenu = [
        'Hybrid',
        'Integrated',
        'VFIO',
        'eGPU',
        'MUX / dGPU',
        'None',
    ];
    _powerLabel = [
        'active',
        'suspended',
        'off',
        'disabled',
        'active',
        'unknown',
    ];
    _powerLabelFilename = [
        'active',
        'suspended',
        'off',
        'off',
        'active',
        'gpu-integrated-active',
    ];
    _userAction = [
        'logout',
        'reboot',
        'integrated',
        'asusgpumuxdisable',
        'none',
    ];
    vHelper;

    constructor(vInstatce) {
        if (vInstatce instanceof VersionHelper)
            this.vHelper = vInstatce;
        else
            this.vHelper = new VersionHelper(vInstatce);
    }

    get gsVersion() {
        return this.vHelper.gsVersion();
    }

    gfxLabels(type) {
        if (!(type === 0 || type === 1) ||
            !this.vHelper.isBetween(this.vHelper.currentVersion, this.vHelper.allowedSgfxVersions)) {
            return [];
        }

        switch (type) {
            case 0:
                return this._gfxLabels
                    .slice(0, 2)
                    .concat(this.v50 ? [] : this.v51 ? ['nvidianomodeset'] : [], this._gfxLabels.slice(-4));
            case 1:
                return this._gfxLabelsMenu
                    .slice(0, 2)
                    .concat(this.v50 ? [] : this.v51 ? ['Nvidia (no modeset)'] : [], this._gfxLabelsMenu.slice(-4));
            default:
                return [];
        }
    }

    get userActions() {
        return this._userAction
            .slice(0, 1)
            .concat(this.v50 ? [] : this.v51 ? ['reboot'] : [], this._userAction.slice(-3));
    }

    get(type, idx) {

        switch (type) {
            case 0:
            case 1:
                return this.gfxLabels(type)[idx];
            case 2:
                return this._powerLabel[idx];
            case 3:
                return this._powerLabelFilename[idx];
            case 4:
                return this.userActions[idx];
            default:
                return '';
        }
    }

    is(type, idx, comp) {
        return this.get(type, idx) === comp;
    }

    isVersion(major = 5, minor = 0) {
        return this.vHelper.isBetween(this.vHelper.currentVersion, [
            [major, minor, 0],
            [major, minor, 9999],
        ]);
    }

    get v50() {
        return this.isVersion(5, 0);
    }

    get v51() {
        return this.isVersion(5, 1);
    }
}
