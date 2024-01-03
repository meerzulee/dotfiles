import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';
import {
	ExtensionPreferences,
	gettext as _
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import {
	CPU_NOT_SUPPORTED,
	CPU_INTEL,
	bashSyncCommand,
	getMyCpuType,
	pkexecCommand,
	getBoostState
} from './common.js';

export default class FrequencyBoostSwitchPreferences extends ExtensionPreferences {
	fillPreferencesWindow( window )
	{
		const builder = new Gtk.Builder();

		// Save the instances for other methods
		this.builder = builder;
		this.window  = window;

		builder.set_translation_domain( this.metadata[ 'gettext-domain' ] );

		builder.add_from_file( this.dir.get_child( 'general.ui' ).get_path() );
		builder.add_from_file( this.dir.get_child( 'debug.ui' ).get_path() );

		const freqBoostPolkitVersion = builder.get_object( 'freqBoostPolkitVersion' );
		const pkexecVersion          = bashSyncCommand( 'pkexec --version' );
		const myCpuType              = getMyCpuType();
		const cpuSupported           = myCpuType !== CPU_NOT_SUPPORTED;
		const isIntel                = myCpuType === CPU_INTEL;
		const onLogsClicked          = ( { name } ) =>
		{
			const content = `journalctl -o cat -f /usr/bin/${name}`;

			Gdk.Display.get_default().get_clipboard().set( content );

			window.add_toast( new Adw.Toast( { title: _( 'Copied: {{content}}' ).replace( '{{content}}', content ) } ) );
		};

		this.setExecutableOption();

		if ( cpuSupported )
		{
			builder.get_object( 'freqBoostCpuDetected' ).set_subtitle( isIntel ? 'Intel' : 'AMD' );
		}

		builder.get_object( 'freqBoostMyVersion' ).set_subtitle( this.metadata.version.toString() );

		builder.get_object( 'freqBoostLogsPreferences' ).connect( 'clicked', onLogsClicked );
		builder.get_object( 'freqBoostLogsExtension' ).connect( 'clicked', onLogsClicked );

		if ( pkexecVersion && cpuSupported )
		{
			const freqBoostPersistSwitch = builder.get_object( 'freqBoostPersistSwitch' );
			const cleanSwitch            = builder.get_object( 'cleanSwitch' );
			const settings               = this.getSettings();
			const version                = pkexecVersion.slice( pkexecVersion.search( /\d/ ) );

			// Time to add the General tab - extension should be able to work properly, so some preferences will be nice
			window.add( builder.get_object( 'freqBoostGeneralTab' ) );
			window.set_visible_page_name( 'freqBoostGeneralTab' );

			// Show Polkit version in the Debug tab
			freqBoostPolkitVersion.set_subtitle( version );

			settings.bind( 'persist', freqBoostPersistSwitch, 'active', Gio.SettingsBindFlags.DEFAULT );
			settings.bind( 'clean', cleanSwitch, 'active', Gio.SettingsBindFlags.DEFAULT );

			this.settings = settings;

			if ( Number( version ) >= 0.106 )
			{
				this.setPolkitOption();
			}

			// Test if we have Intel EPP and EPB. Add Intel tab if we have at least one. Also show debug items
			if ( isIntel )
			{
				this.setIntelOptions();
			}
		}
		else
		{
			// Hide, if we came here because of CPU not supported
			freqBoostPolkitVersion.visible = cpuSupported;

			window.set_visible_page_name( 'freqBoostDebugTab' );
		}

		window.add( builder.get_object( 'freqBoostDebugTab' ) );
	}

	setExecutableOption()
	{
		const freqBoostExecutableBit    = this.builder.get_object( 'freqBoostExecutableBit' );
		const freqBoostExecutableBitSet = this.builder.get_object( 'freqBoostExecutableBitSet' );
		const setExecutableUi           = () =>
		{
			if ( this.dir.get_child( 'set_boost' ).query_info( 'access::can-execute', null, null ).get_attribute_boolean( 'access::can-execute' ) )
			{
				freqBoostExecutableBit.set_subtitle( _( 'Yes' ) );

				freqBoostExecutableBitSet.visible = false;
			}
		};

		freqBoostExecutableBit.visible = true;

		freqBoostExecutableBitSet.connect( 'clicked', _ =>
		{
			bashSyncCommand( `chmod +xx ${this.dir.get_child( 'set_boost' ).get_path()}` );

			setExecutableUi();
		} );

		this.builder.get_object( 'freqBoostExecutableBitLocate' ).connect( 'clicked', _ => Gio.DBus.session.call(
			'org.freedesktop.FileManager1',
			'/org/freedesktop/FileManager1',
			'org.freedesktop.FileManager1',
			'ShowItems',
			new GLib.Variant(
				'(ass)',
				[ [ `file://${this.dir.get_child( 'set_boost' ).get_path()}` ], '' ]
			),
			null,
			Gio.DBusCallFlags.NONE,
			-1,
			null,
			// We do not care of the response
			null
		) );

		setExecutableUi();
	}

	setPolkitOption()
	{
		const freqBoostPolkitSwitch   = this.builder.get_object( 'freqBoostPolkitSwitch' );
		const freqBoostRulesDebugItem = this.builder.get_object( 'freqBoostRulesDebugItem' );

		// Hide Outdated message and show action row
		this.builder.get_object( 'freqBoostPolkitOk' ).visible       = true;
		this.builder.get_object( 'freqBoostOutdatedPolkit' ).visible = false;

		freqBoostPolkitSwitch.set_active( this.settings.get_boolean( 'polkit-rules' ) );
		freqBoostPolkitSwitch.connect( 'notify::active', ( { active } ) =>
		{
			// This if filters out 2 cases:
			// 1. Initial switch set
			// 2. If user denies permissions, we set the switch back to previous state, which comes here again
			if ( this.settings.get_boolean( 'polkit-rules' ) !== active )
			{
				pkexecCommand( active ? `cp ${this.dir.get_child( 'freq-boost-switch.rules' ).get_path()} /etc/polkit-1/rules.d/` : 'rm -f /etc/polkit-1/rules.d/freq-boost-switch.rules', true )
					.then( _ => this.settings.set_boolean( 'polkit-rules', active ) )
					.catch( _ => freqBoostPolkitSwitch.set_active( !active ) );
			}
		} );

		// Setup debug item for Polkit
		freqBoostRulesDebugItem.visible = true;

		this.builder.get_object( 'freqBoostExecutableBitTest' ).connect( 'clicked', () => pkexecCommand( 'ls /etc/polkit-1/rules.d/freq-boost-switch.rules', true )
			.then( () => freqBoostRulesDebugItem.set_subtitle( _( 'Yes' ) ) )
			.catch( () => freqBoostRulesDebugItem.set_subtitle( _( 'No' ) ) )
		);
	}

	setIntelOptions()
	{
		let intelTabVisibility = false;
		const myCpuType        = CPU_INTEL;
		const onIntelChange    = ( {
			                           'active-id': activeId,
			                           name
		                           } ) => this.settings[ `set_${name.startsWith( 'epp' ) ? 'string' : 'int'}` ]( name, activeId );

		this.builder.add_from_file( this.dir.get_child( 'intel.ui' ).get_path() );

		// EPB is supported
		if ( bashSyncCommand( 'cat /sys/devices/system/cpu/cpu0/power/energy_perf_bias' ) )
		{
			const freqBoostEpbOn        = this.builder.get_object( 'freqBoostEpbOn' );
			const freqBoostEpbOff       = this.builder.get_object( 'freqBoostEpbOff' );
			const freqBoostEpbDebugItem = this.builder.get_object( 'freqBoostEpbDebugItem' );
			const epbMap                = new Map( [
				[ '0', 'performance' ],
				[ '4', 'balance-performance' ],
				[ '6', 'normal' ],
				[ '8', 'balance-power' ],
				[ '15', 'power' ]
			] );
			const onTestEpbClicked      = _ =>
			{
				const epb = bashSyncCommand( 'cat /sys/devices/system/cpu/cpu0/power/energy_perf_bias' );

				if ( epb )
				{
					freqBoostEpbDebugItem.set_subtitle( epbMap.get( epb ) || epb );
				}
			};

			intelTabVisibility = true;

			freqBoostEpbDebugItem.visible = true;

			epbMap.forEach( ( value, key ) =>
			{
				freqBoostEpbOn.append( key, value );
				freqBoostEpbOff.append( key, value );
			} );

			freqBoostEpbOn[ 'active-id' ]  = this.settings.get_int( 'epb-on' ).toString();
			freqBoostEpbOff[ 'active-id' ] = this.settings.get_int( 'epb-off' ).toString();

			freqBoostEpbOn.connect( 'changed', onIntelChange );
			freqBoostEpbOff.connect( 'changed', onIntelChange );

			// Update Debug item
			onTestEpbClicked();

			this.builder.get_object( 'freqBoostEpbSet' ).connect( 'clicked', _ =>
			{
				const state = getBoostState( myCpuType );

				pkexecCommand(
					[
						this.dir.get_child( 'set_boost' ).get_path(),
						// Subprocess is not happy if we leave those as numbers
						myCpuType.toString(),
						Number( state ).toString(),
						'-1',
						this.settings.get_int( `epb-${state ? 'on' : 'off'}` ).toString()
					] )
					.then( onTestEpbClicked );
			} );
			this.builder.get_object( 'freqBoostEpbRefresh' ).connect( 'clicked', onTestEpbClicked );
		}
		else
		{
			this.builder.get_object( 'freqBoostEpbFrame' ).visible = false;
		}

		const epp = bashSyncCommand( 'cat /sys/devices/system/cpu/cpu0/cpufreq/energy_performance_available_preferences' );

		// EPP is supported
		if ( epp )
		{
			const freqBoostEppOn        = this.builder.get_object( 'freqBoostEppOn' );
			const freqBoostEppOff       = this.builder.get_object( 'freqBoostEppOff' );
			const freqBoostEppDebugItem = this.builder.get_object( 'freqBoostEppDebugItem' );
			const onTestEppClicked      = _ =>
			{
				const epp = bashSyncCommand( 'cat /sys/devices/system/cpu/cpu0/cpufreq/energy_performance_preference' );

				if ( epp )
				{
					freqBoostEppDebugItem.set_subtitle( epp );
				}
			};

			intelTabVisibility = true;

			freqBoostEppDebugItem.visible = true;

			// Set dropdown items
			epp.split( ' ' ).forEach( value =>
			{
				freqBoostEppOn.append( value, value );
				freqBoostEppOff.append( value, value );
			} );

			freqBoostEppOn[ 'active-id' ]  = this.settings.get_string( 'epp-on' );
			freqBoostEppOff[ 'active-id' ] = this.settings.get_string( 'epp-off' );

			freqBoostEppOn.connect( 'changed', onIntelChange );
			freqBoostEppOff.connect( 'changed', onIntelChange );

			// Update Debug item
			onTestEppClicked();

			this.builder.get_object( 'freqBoostEppSet' ).connect( 'clicked', _ =>
			{
				const state = getBoostState( myCpuType );

				pkexecCommand(
					[
						this.dir.get_child( 'set_boost' ).get_path(),
						// Subprocess is not happy if we leave those as numbers
						myCpuType.toString(),
						Number( state ).toString(),
						this.settings.get_string( `epp-${state ? 'on' : 'off'}` ),
						'-1'
					] )
					.then( onTestEppClicked );
			} );
			this.builder.get_object( 'freqBoostEppRefresh' ).connect( 'clicked', onTestEppClicked );
		}
		else
		{
			this.builder.get_object( 'freqBoostEppFrame' ).visible = false;
		}

		if ( intelTabVisibility )
		{
			this.window.add( this.builder.get_object( 'freqBoostIntelTab' ) );
		}
	}
}