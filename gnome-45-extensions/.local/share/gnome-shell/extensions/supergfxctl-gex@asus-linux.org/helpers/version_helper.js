import * as Config from 'resource:///org/gnome/shell/misc/config.js';
const [major] = Config.PACKAGE_VERSION.split('.').map((s) => Number(s));

export class VersionHelper {
    curVersion;
    allowedSgfxVersions = [
        [5, 0, 0],
        [5, 1, 9999],
    ];

    constructor(version) {
        this.curVersion = version.map((i) => Number(i));
    }

    get currentVersion() {
        return this.curVersion;
    }

    get currentVersionHasUpdate() {
        return false;
    }

    gsVersion() {
        return major >= 40 ? major : -1;
    }

    compare(verA, verB) {
        verA = verA.map((i) => Number(i));
        verB = verB.map((i) => Number(i));
        if (JSON.stringify(verA) === JSON.stringify(verB)) {
            return 0;
        }
        else if (verA[0] !== verB[0]) {
            return verA[0] < verB[0] ? -1 : 1;
        }
        else if (verA[1] !== verB[1]) {
            return verA[1] < verB[1] ? -1 : 1;
        }
        else if (verA[2] !== verB[2]) {
            return verA[2] < verB[2] ? -1 : 1;
        }
        return 0;
    }

    isBetween(version, range) {
        if (range.length < 2)
            return false;
        return (this.compare(version, range[0]) >= 0 &&
            this.compare(version, range[1]) <= 0);
    }
}
