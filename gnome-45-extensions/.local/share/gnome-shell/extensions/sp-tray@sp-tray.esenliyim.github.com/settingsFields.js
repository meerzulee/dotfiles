const settingsFields = [
    /*
    {
        setting: name in the settings schema,
        fieldId: name in the UI definition prefs.xml,
        type: "text" | "active" (aka. boolean) | "value" (aka number),
        resettable: whether it receives a default value,
        resetCallback: reset click callback,
        restartsAnimation: whether it should restart the marquee if it is active,
        changeCallback: change callback
    }
    */
    {
        setting: "paused",
        fieldId: "field_paused",
        type: "text",
        resettable: true,
        resetCallback: "on_resetPaused_clicked",
        restartsAnimation: false,
    },
    {
        setting: "stopped",
        fieldId: "field_stopped",
        type: "text",
        resettable: true,
        resetCallback: "on_resetStopped_clicked",
        restartsAnimation: true,
    },
    {
        setting: "off",
        fieldId: "field_notRunning",
        type: "text",
        resettable: true,
        resetCallback: "on_resetNotRunning_clicked",
        restartsAnimation: true,
    },
    {
        setting: "display-format",
        fieldId: "field_format",
        type: "text",
        resettable: true,
        resetCallback: "on_resetFormat_clicked",
        restartsAnimation: true,
    },
    {
        setting: "podcast-format",
        fieldId: "podcast_format",
        type: "text",
        resettable: true,
        resetCallback: "on_resetPodcastFormat_clicked",
        restartsAnimation: true,
    },
    {
        setting: "hidden-when-inactive",
        fieldId: "field_hideInactive",
        type: "active",
        resettable: false,
        restartsAnimation: true,
    },
    {
        setting: "position",
        fieldId: "box_position",
        type: "active",
        resettable: true,
        resetCallback: "on_resetPosition_clicked",
        restartsAnimation: false,
        changeCallback: "_positionChanged",
    },
    {
        setting: "hidden-when-paused",
        fieldId: "field_hidePaused",
        type: "active",
        resettable: false,
        restartsAnimation: true,
    },
    {
        setting: "metadata-when-paused",
        fieldId: "field_pausedMetadata",
        type: "active",
        resettable: false,
        restartsAnimation: true,
    },
    {
        setting: "hidden-when-stopped",
        fieldId: "field_hideStopped",
        type: "active",
        resettable: false,
        restartsAnimation: true,
    },
    {
        setting: "title-max-length",
        fieldId: "title_length",
        type: "value",
        resettable: true,
        resetCallback: "on_resetTitleLength_clicked",
        restartsAnimation: false,
    },
    {
        setting: "marquee-length",
        fieldId: "marquee_length",
        type: "value",
        resettable: true,
        resetCallback: "on_resetMarqueeLength_clicked",
        restartsAnimation: true,
    },
    {
        setting: "artist-max-length",
        fieldId: "artist_length",
        type: "value",
        resettable: true,
        resetCallback: "on_resetArtistLength_clicked",
        restartsAnimation: false,
    },
    {
        setting: "album-max-length",
        fieldId: "album_length",
        type: "value",
        resettable: true,
        resetCallback: "on_resetAlbumLength_clicked",
        restartsAnimation: false,
    },
    {
        setting: "logo-position",
        fieldId: "logo_position",
        type: "active",
        resettable: true,
        resetCallback: "on_resetLogo_clicked",
        restartsAnimation: false,
        changeCallback: "_handleLogoDisplay",
    },
    {
        setting: "display-mode",
        fieldId: "display_mode",
        type: "active",
        resettable: true,
        resetCallback: "on_resetDisplayMode_clicked",
        restartsAnimation: true,
    },
    {
        setting: "shuffle",
        fieldId: "shuffle",
        type: "text",
        resettable: true,
        resetCallback: "on_resetShuffle_clicked",
        restartsAnimation: false,
    },
    {
        setting: "loop-track",
        fieldId: "loopTrack",
        type: "text",
        resettable: true,
        resetCallback: "on_resetLoopTrack_clicked",
        restartsAnimation: false,
    },
    {
        setting: "loop-playlist",
        fieldId: "loopPlaylist",
        type: "text",
        resettable: true,
        resetCallback: "on_resetLoopPlaylist_clicked",
        restartsAnimation: false,
    },
    {
        setting: "marquee-tail",
        fieldId: "marquee_tail",
        type: "text",
        resettable: true,
        resetCallback: "on_resetMarqueeTail_clicked",
        restartsAnimation: true,
    },
    {
        setting: "marquee-interval",
        fieldId: "marquee_interval",
        type: "value",
        resettable: true,
        resetCallback: "on_resetMarqueeInterval_clicked",
        restartsAnimation: false,
    },
];

export default settingsFields;